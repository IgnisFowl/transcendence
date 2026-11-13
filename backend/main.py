import asyncio
import json
import os
import smtplib
from datetime import date, datetime, timedelta, timezone
from email.message import EmailMessage

import bcrypt
import jwt
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, WebSocket, WebSocketDisconnect, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.orm import Session

import models
from database import Base, SessionLocal, engine, ensure_column, get_db

Base.metadata.create_all(bind=engine)
ensure_column("users", "role", "role VARCHAR DEFAULT 'user'")
ensure_column("users", "bio", "bio VARCHAR DEFAULT ''")
ensure_column("users", "avatar_filename", "avatar_filename VARCHAR")
ensure_column("habits", "last_completed", "last_completed DATE")
ensure_column("challenges", "from_user_id", "from_user_id VARCHAR")
ensure_column("challenges", "to_user_id", "to_user_id VARCHAR")

SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = "HS256"
bearer = HTTPBearer()


def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password, password_hash):
    return bcrypt.checkpw(password.encode(), password_hash.encode())

ACHIEVEMENTS = [
    ("first_quest", "Primeira missão", "Crie sua primeira missão."),
    ("first_complete", "Contrato cumprido", "Complete uma missão."),
    ("level_2", "Aprendiz", "Alcance o nível 2."),
    ("streak_3", "Ofensiva", "Mantenha uma ofensiva de 3 dias."),
    ("ally", "Aliado", "Adicione um amigo."),
    ("tavern", "Voz da taverna", "Envie uma mensagem na taverna."),
]

REWARDS = {"EASY": (25, 10), "MEDIUM": (50, 20), "HARD": (100, 45)}
CLASSES = {"WIZARD": "int", "WARRIOR": "str", "ROGUE": "dex", "CLERIC": "wis", "BARD": "cha"}
CLASS_NAMES = {"WIZARD": "Mago", "WARRIOR": "Guerreiro", "ROGUE": "Ladino", "CLERIC": "Clérigo", "BARD": "Bardo"}
CLASS_CATEGORY = {
    "WIZARD": "STUDY",
    "WARRIOR": "FITNESS",
    "ROGUE": "PRODUCTIVITY",
    "CLERIC": "WELLBEING",
    "BARD": "CREATIVITY",
}
SUGGESTIONS = {
    "WIZARD": ("Ler 20 páginas de um livro técnico", "STUDY", "MEDIUM"),
    "WARRIOR": ("Treinar 30 minutos", "FITNESS", "MEDIUM"),
    "ROGUE": ("Planejar o dia em 10 minutos", "PRODUCTIVITY", "EASY"),
    "CLERIC": ("Meditar por 10 minutos", "WELLBEING", "EASY"),
    "BARD": ("Praticar um idioma ou um instrumento por 20 minutos", "CREATIVITY", "MEDIUM"),
    "UNASSIGNED": ("Caminhar 15 minutos", "WELLBEING", "EASY"),
}

app = FastAPI(title="Side Quest API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_error(_request, exc):
    message = "Dados inválidos."
    if exc.errors():
        message = str(exc.errors()[0].get("msg", message)).replace("Value error, ", "")
    return JSONResponse(status_code=400, content={"detail": message})


def seed():
    db = SessionLocal()
    try:
        for code, title, description in ACHIEVEMENTS:
            if not db.get(models.Achievement, code):
                db.add(models.Achievement(id=code, title=title, description=description))
        email = os.getenv("ADMIN_EMAIL", "").strip().lower()
        username = os.getenv("ADMIN_USERNAME", "").strip()
        password = os.getenv("ADMIN_PASSWORD", "")
        if email and username and len(password) >= 8:
            existing = db.query(models.User).filter(models.User.email == email).first()
            taken = db.query(models.User).filter(models.User.username == username).first()
            if existing:
                existing.role = "admin"
            elif not taken:
                db.add(models.User(
                    email=email,
                    username=username,
                    password_hash=hash_password(password),
                    role="admin",
                    has_completed_survey=1,
                    character_class="WIZARD",
                    stats=json.dumps({"str": 10, "int": 18, "dex": 10, "wis": 10, "cha": 10}),
                ))
        db.commit()
    finally:
        db.close()


seed()


def parse_stats(raw):
    if isinstance(raw, dict):
        return raw
    try:
        return json.loads(raw or "{}")
    except json.JSONDecodeError:
        return {"str": 10, "int": 10, "dex": 10, "wis": 10, "cha": 10}


UPLOAD_DIR = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(__file__), "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)
MAX_AVATAR_BYTES = 2 * 1024 * 1024
AVATAR_TYPES = {
    "image/jpeg": (".jpg", lambda raw: raw.startswith(b"\xff\xd8\xff")),
    "image/png": (".png", lambda raw: raw.startswith(b"\x89PNG\r\n\x1a\n")),
    "image/webp": (".webp", lambda raw: raw.startswith(b"RIFF") and raw[8:12] == b"WEBP"),
}


def avatar_url(user):
    filename = getattr(user, "avatar_filename", None)
    return f"/api/avatars/{filename}" if filename else None


def user_out(user, include_email=False):
    data = {
        "id": user.id,
        "username": user.username,
        "role": user.role or "user",
        "bio": user.bio or "",
        "avatarUrl": avatar_url(user),
        "characterClass": user.character_class,
        "hasCompletedSurvey": bool(user.has_completed_survey),
        "level": user.level,
        "xp": user.xp,
        "hp": user.hp,
        "maxHp": user.max_hp,
        "mana": user.mana,
        "maxMana": user.max_mana,
        "gold": user.gold,
        "stats": parse_stats(user.stats),
    }
    if include_email:
        data["email"] = user.email
    return data


def habit_out(habit):
    completed = habit.last_completed == date.today()
    return {
        "id": habit.id,
        "title": habit.title,
        "description": habit.description or "",
        "category": habit.category,
        "difficulty": habit.difficulty,
        "streak": habit.streak or 0,
        "completedToday": completed,
    }


def challenge_out(challenge):
    return {
        "id": challenge.id,
        "fromUsername": challenge.from_username,
        "toUsername": challenge.to_username,
        "title": challenge.title,
        "category": challenge.category,
        "xpReward": challenge.xp_reward,
        "goldReward": challenge.gold_reward,
        "status": challenge.status,
    }


def note_out(note):
    return {
        "id": note.id,
        "action": note.action,
        "entity": note.entity,
        "message": note.message,
        "read": bool(note.read),
        "timestamp": note.created_at.strftime("%H:%M") if note.created_at else "",
    }


def email_out(row):
    return {"to": row.to_email, "subject": row.subject, "body": row.body}


def achievements_for(db, user):
    rows = (
        db.query(models.Achievement)
        .join(models.UserAchievement, models.UserAchievement.achievement_id == models.Achievement.id)
        .filter(models.UserAchievement.user_id == user.id)
        .all()
    )
    return [{"id": row.id, "title": row.title, "description": row.description} for row in rows]


def create_token(user):
    payload = {
        "sub": user.id,
        "username": user.username,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão inválida.")
    user = db.get(models.User, payload.get("sub"))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão inválida.")
    return user


def reject_guest(user):
    if (user.role or "user") == "guest":
        raise HTTPException(status_code=403, detail="Convidados podem olhar a guilda, mas não jogar.")


def require_staff(user):
    if (user.role or "user") not in {"admin", "moderator"}:
        raise HTTPException(status_code=403, detail="Só a mesa da guilda pode fazer isso.")


def require_admin(user):
    if (user.role or "user") != "admin":
        raise HTTPException(status_code=403, detail="Só o mestre pode fazer isso.")


def notify(db, user_id, action, entity, message):
    note = models.Notification(user_id=user_id, action=action, entity=entity, message=message)
    db.add(note)
    db.flush()
    return note


def record_email(db, user, subject, body):
    row = models.EmailLog(user_id=user.id, to_email=user.email, subject=subject, body=body)
    db.add(row)
    db.flush()
    host = os.getenv("SMTP_HOST")
    if host:
        message = EmailMessage()
        message["From"] = os.getenv("SMTP_FROM", "sidequest@localhost")
        message["To"] = user.email
        message["Subject"] = subject
        message.set_content(body)
        try:
            with smtplib.SMTP(host, int(os.getenv("SMTP_PORT", "587"))) as server:
                if os.getenv("SMTP_USER"):
                    server.starttls()
                    server.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASSWORD", ""))
                server.send_message(message)
        except OSError:
            pass
    return row


def streak_bonus(streak):
    if streak >= 7:
        return 15
    if streak >= 3:
        return 10
    if streak >= 2:
        return 5
    return 0


def grant_reward(user, xp, gold):
    user.xp += xp
    user.gold += gold
    leveled = False
    while user.xp >= user.level * 100:
        user.xp -= user.level * 100
        user.level += 1
        leveled = True
    return leveled


def unlock(db, user, code):
    exists = (
        db.query(models.UserAchievement)
        .filter_by(user_id=user.id, achievement_id=code)
        .first()
    )
    if exists:
        return None
    achievement = db.get(models.Achievement, code)
    if not achievement:
        return None
    db.add(models.UserAchievement(user_id=user.id, achievement_id=code))
    return {"id": code, "title": achievement.title, "description": achievement.description}


def check_achievements(db, user):
    found = []
    if db.query(models.Habit).filter_by(user_id=user.id).count():
        row = unlock(db, user, "first_quest")
        if row:
            found.append(row)
    if db.query(models.Habit).filter(models.Habit.user_id == user.id, models.Habit.last_completed.isnot(None)).count():
        row = unlock(db, user, "first_complete")
        if row:
            found.append(row)
    if user.level >= 2:
        row = unlock(db, user, "level_2")
        if row:
            found.append(row)
    if db.query(models.Habit).filter(models.Habit.user_id == user.id, models.Habit.streak >= 3).count():
        row = unlock(db, user, "streak_3")
        if row:
            found.append(row)
    if db.query(models.Friendship).filter_by(user_id=user.id).count():
        row = unlock(db, user, "ally")
        if row:
            found.append(row)
    if db.query(models.ChatMessage).filter_by(user_id=user.id).count():
        row = unlock(db, user, "tavern")
        if row:
            found.append(row)
    return found


class Presence:
    def __init__(self, user):
        self.id = user.id
        self.username = user.username
        self.character_class = user.character_class
        self.level = user.level
        self.stats = user.stats
        self.avatar_filename = getattr(user, "avatar_filename", None)


class ConnectionManager:
    def __init__(self):
        self.active = {}

    def register(self, websocket, user):
        self.active[websocket] = user if isinstance(user, Presence) else Presence(user)

    def refresh(self, user):
        for online in self.active.values():
            if online.id == user.id:
                online.character_class = user.character_class
                online.level = user.level
                online.stats = user.stats
                online.username = user.username
                online.avatar_filename = getattr(user, "avatar_filename", None)

    def disconnect(self, websocket):
        self.active.pop(websocket, None)

    def online_payload(self):
        seen = {}
        for user in self.active.values():
            seen[user.username] = {
                "userId": user.id,
                "username": user.username,
                "characterClass": user.character_class,
                "level": user.level,
                "stats": parse_stats(user.stats),
                "avatarUrl": avatar_url(user),
            }
        return list(seen.values())

    def is_online(self, username):
        return any(user.username == username for user in self.active.values())

    async def broadcast(self, message):
        for socket in list(self.active.keys()):
            try:
                await socket.send_json(message)
            except Exception:
                self.active.pop(socket, None)

    async def send_user(self, user_id, message):
        for socket, user in list(self.active.items()):
            if user.id == user_id:
                try:
                    await socket.send_json(message)
                except Exception:
                    self.active.pop(socket, None)

    async def broadcast_online(self):
        await self.broadcast({"type": "online_users_list", "users": self.online_payload()})


manager = ConnectionManager()


class RegisterSchema(BaseModel):
    email: EmailStr
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def clean_username(cls, value):
        value = value.strip()
        if not value.replace("_", "").isalnum() or not 3 <= len(value) <= 20:
            raise ValueError("O nome de usuário deve ter 3 a 20 caracteres (letras, números ou _).")
        return value

    @field_validator("password")
    @classmethod
    def clean_password(cls, value):
        if not 8 <= len(value) <= 72:
            raise ValueError("A senha deve ter entre 8 e 72 caracteres.")
        return value


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class HabitSchema(BaseModel):
    title: str
    description: str = ""
    category: str = "STUDY"
    difficulty: str = "MEDIUM"

    @field_validator("title")
    @classmethod
    def clean_title(cls, value):
        value = value.strip()
        if not 1 <= len(value) <= 120:
            raise ValueError("O título da missão deve ter entre 1 e 120 caracteres.")
        return value

    @field_validator("category")
    @classmethod
    def clean_category(cls, value):
        allowed = {"STUDY", "FITNESS", "PRODUCTIVITY", "WELLBEING", "CREATIVITY"}
        if value not in allowed:
            raise ValueError("Categoria inválida.")
        return value

    @field_validator("difficulty")
    @classmethod
    def clean_difficulty(cls, value):
        if value not in REWARDS:
            raise ValueError("Dificuldade inválida.")
        return value


class SurveySchema(BaseModel):
    character_class: str

    @field_validator("character_class")
    @classmethod
    def clean_class(cls, value):
        if value not in CLASSES:
            raise ValueError("Classe inválida.")
        return value


class ProfileSchema(BaseModel):
    bio: str = ""

    @field_validator("bio")
    @classmethod
    def clean_bio(cls, value):
        if len(value) > 240:
            raise ValueError("A bio deve ter no máximo 240 caracteres.")
        return value.strip()


class ChatSchema(BaseModel):
    content: str

    @field_validator("content")
    @classmethod
    def clean_content(cls, value):
        value = value.strip()
        if not 1 <= len(value) <= 500:
            raise ValueError("A mensagem deve ter entre 1 e 500 caracteres.")
        return value


class FriendSchema(BaseModel):
    username: str


class ChallengeSchema(BaseModel):
    toUsername: str
    title: str
    category: str = "STUDY"
    xpReward: int = 50
    goldReward: int = 25

    @field_validator("title")
    @classmethod
    def clean_title(cls, value):
        value = value.strip()
        if not 1 <= len(value) <= 120:
            raise ValueError("O título do desafio deve ter entre 1 e 120 caracteres.")
        return value


class DeleteSchema(BaseModel):
    confirmation: str


class AdminCreateSchema(BaseModel):
    email: EmailStr
    username: str
    password: str
    role: str = "user"

    @field_validator("username")
    @classmethod
    def clean_username(cls, value):
        value = value.strip()
        if not value.replace("_", "").isalnum() or not 3 <= len(value) <= 20:
            raise ValueError("O nome de usuário deve ter 3 a 20 caracteres (letras, números ou _).")
        return value

    @field_validator("password")
    @classmethod
    def clean_password(cls, value):
        if not 8 <= len(value) <= 72:
            raise ValueError("A senha deve ter entre 8 e 72 caracteres.")
        return value

    @field_validator("role")
    @classmethod
    def clean_role(cls, value):
        if value not in {"admin", "moderator", "user", "guest"}:
            raise ValueError("Papel inválido.")
        return value


class AdminUpdateSchema(BaseModel):
    role: str
    bio: str = ""
    password: str = ""

    @field_validator("role")
    @classmethod
    def clean_role(cls, value):
        if value not in {"admin", "moderator", "user", "guest"}:
            raise ValueError("Papel inválido.")
        return value

    @field_validator("bio")
    @classmethod
    def clean_bio(cls, value):
        if len(value) > 240:
            raise ValueError("A bio deve ter no máximo 240 caracteres.")
        return value.strip()

    @field_validator("password")
    @classmethod
    def clean_password(cls, value):
        if value and not 8 <= len(value) <= 72:
            raise ValueError("A senha deve ter entre 8 e 72 caracteres.")
        return value


def auth_payload(user, db):
    return {"user": {**user_out(user, True), "achievements": achievements_for(db, user)}, "token": create_token(user)}


@app.get("/api/health")
def health():
    return {"status": "ok", "name": "Side Quest"}


@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(data: RegisterSchema, db: Session = Depends(get_db)):
    existing = (
        db.query(models.User)
        .filter((models.User.email == data.email.lower()) | (models.User.username == data.username))
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="E-mail ou nome de usuário já cadastrado.")
    user = models.User(
        email=data.email.lower(),
        username=data.username,
        password_hash=hash_password(data.password),
        stats=json.dumps({"str": 10, "int": 10, "dex": 10, "wis": 10, "cha": 10}),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return auth_payload(user, db)


@app.post("/api/auth/login")
def login_user(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email.lower()).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Credenciais inválidas.")
    return auth_payload(user, db)


@app.get("/api/me")
def me(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    return {**user_out(user, True), "achievements": achievements_for(db, user)}


@app.put("/api/me")
async def update_me(data: ProfileSchema, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    reject_guest(user)
    user.bio = data.bio
    note = notify(db, user.id, "updated", "profile", "Seu perfil foi atualizado.")
    db.commit()
    payload = note_out(note)
    await manager.send_user(user.id, {"type": "notification", "notification": payload})
    return {**user_out(user, True), "achievements": achievements_for(db, user), "notification": payload}


def remove_avatar_file(filename):
    if not filename:
        return
    path = os.path.join(UPLOAD_DIR, os.path.basename(filename))
    if os.path.isfile(path):
        os.remove(path)


@app.post("/api/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user: models.User = Depends(current_user),
    db: Session = Depends(get_db),
):
    reject_guest(user)
    raw = await file.read()
    rule = AVATAR_TYPES.get(file.content_type or "")
    if not rule or not 16 <= len(raw) <= MAX_AVATAR_BYTES or not rule[1](raw):
        raise HTTPException(status_code=400, detail="Envie uma imagem PNG, JPEG ou WebP de até 2 MB.")
    filename = f"{models.new_id()}{rule[0]}"
    previous = user.avatar_filename
    with open(os.path.join(UPLOAD_DIR, filename), "wb") as handle:
        handle.write(raw)
    user.avatar_filename = filename
    note = notify(db, user.id, "updated", "avatar", "Seu avatar foi atualizado.")
    db.commit()
    remove_avatar_file(previous)
    manager.refresh(user)
    await manager.send_user(user.id, {"type": "notification", "notification": note_out(note)})
    await manager.broadcast_online()
    return {**user_out(user, True), "achievements": achievements_for(db, user)}


@app.delete("/api/me/avatar")
async def delete_avatar(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    reject_guest(user)
    previous = user.avatar_filename
    user.avatar_filename = None
    note = notify(db, user.id, "deleted", "avatar", "Avatar removido. O retrato padrão voltou.")
    db.commit()
    remove_avatar_file(previous)
    manager.refresh(user)
    await manager.send_user(user.id, {"type": "notification", "notification": note_out(note)})
    await manager.broadcast_online()
    return {**user_out(user, True), "achievements": achievements_for(db, user)}


@app.get("/api/avatars/{filename}")
def serve_avatar(filename: str):
    safe = os.path.basename(filename)
    if safe != filename or ".." in filename:
        raise HTTPException(status_code=404, detail="Avatar não encontrado.")
    path = os.path.join(UPLOAD_DIR, safe)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Avatar não encontrado.")
    return FileResponse(path)


@app.post("/api/user/survey")
async def submit_survey(data: SurveySchema, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    reject_guest(user)
    stats = {"str": 10, "int": 10, "dex": 10, "wis": 10, "cha": 10}
    stats[CLASSES[data.character_class]] = 18
    user.character_class = data.character_class
    user.has_completed_survey = 1
    user.stats = json.dumps(stats)
    note = notify(db, user.id, "updated", "profile", f"Sua classe agora é {CLASS_NAMES[data.character_class]}.")
    db.commit()
    manager.refresh(user)
    await manager.send_user(user.id, {"type": "notification", "notification": note_out(note)})
    await manager.broadcast_online()
    return {**user_out(user, True), "achievements": achievements_for(db, user)}


@app.get("/api/habits")
def get_habits(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    habits = db.query(models.Habit).filter_by(user_id=user.id).order_by(models.Habit.created_at.desc()).all()
    return [habit_out(habit) for habit in habits]


@app.post("/api/habits", status_code=status.HTTP_201_CREATED)
async def create_habit(data: HabitSchema, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    reject_guest(user)
    habit = models.Habit(
        user_id=user.id,
        title=data.title,
        description=data.description.strip(),
        category=data.category,
        difficulty=data.difficulty,
    )
    db.add(habit)
    unlocked = check_achievements(db, user)
    note = notify(db, user.id, "created", "habit", f"Missão criada: {data.title}.")
    db.commit()
    db.refresh(habit)
    await manager.send_user(user.id, {"type": "notification", "notification": note_out(note)})
    return {"habit": habit_out(habit), "unlocked": unlocked, "user": user_out(user, True)}


@app.post("/api/habits/suggest", status_code=status.HTTP_201_CREATED)
async def suggest_habit(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    reject_guest(user)
    title, category, difficulty = SUGGESTIONS.get(user.character_class, SUGGESTIONS["UNASSIGNED"])
    habit = models.Habit(user_id=user.id, title=title, description="Sugestão da sua classe.", category=category, difficulty=difficulty)
    db.add(habit)
    unlocked = check_achievements(db, user)
    note = notify(db, user.id, "created", "habit", f"Missão sugerida criada: {title}.")
    db.commit()
    db.refresh(habit)
    await manager.send_user(user.id, {"type": "notification", "notification": note_out(note)})
    return {"habit": habit_out(habit), "unlocked": unlocked, "user": user_out(user, True)}


@app.delete("/api/habits/{habit_id}")
async def delete_habit(habit_id: str, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    reject_guest(user)
    habit = db.query(models.Habit).filter_by(id=habit_id, user_id=user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Missão não encontrada.")
    title = habit.title
    db.delete(habit)
    note = notify(db, user.id, "deleted", "habit", f"Missão excluída: {title}.")
    db.commit()
    await manager.send_user(user.id, {"type": "notification", "notification": note_out(note)})
    return {"ok": True}


@app.post("/api/habits/{habit_id}/complete")
async def complete_habit(habit_id: str, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    reject_guest(user)
    habit = db.query(models.Habit).filter_by(id=habit_id, user_id=user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Missão não encontrada.")
    today = date.today()
    if habit.last_completed == today:
        raise HTTPException(status_code=400, detail="Essa missão já foi concluída hoje.")
    yesterday = today.fromordinal(today.toordinal() - 1)
    habit.streak = (habit.streak or 0) + 1 if habit.last_completed == yesterday else 1
    habit.last_completed = today
    habit.completed_today = 1
    xp, gold = REWARDS.get(habit.difficulty, REWARDS["MEDIUM"])
    bonus = max(5, xp // 5) if CLASS_CATEGORY.get(user.character_class) == habit.category else 0
    streak_extra = streak_bonus(habit.streak)
    xp += bonus + streak_extra
    leveled = grant_reward(user, xp, gold)
    unlocked = check_achievements(db, user)
    extras = []
    if bonus:
        extras.append(f"+{bonus} da classe")
    if streak_extra:
        extras.append(f"+{streak_extra} da ofensiva")
    bonus_text = f", incluindo {', '.join(extras)}" if extras else ""
    note = notify(db, user.id, "updated", "habit", f"Missão concluída: {habit.title} (+{xp} XP{bonus_text}, +{gold} ouro).")
    db.commit()
    db.refresh(user)
    manager.refresh(user)
    await manager.send_user(user.id, {"type": "notification", "notification": note_out(note)})
    await manager.broadcast({
        "type": "system_feed",
        "text": f"{user.username} concluiu a missão '{habit.title}'.",
        "timestamp": datetime.now().strftime("%H:%M:%S"),
    })
    return {
        "habit": habit_out(habit),
        "user": {**user_out(user, True), "achievements": achievements_for(db, user)},
        "unlocked": unlocked,
        "leveled": leveled,
        "xp": xp,
        "gold": gold,
        "classBonus": bonus,
        "streakBonus": streak_extra,
    }


@app.get("/api/leaderboard")
def leaderboard(db: Session = Depends(get_db), _: models.User = Depends(current_user)):
    users = db.query(models.User).order_by(models.User.level.desc(), models.User.xp.desc()).limit(20).all()
    return [
        {
            "rank": index + 1,
            "username": user.username,
            "level": user.level,
            "xp": user.xp,
            "gold": user.gold,
            "characterClass": user.character_class,
        }
        for index, user in enumerate(users)
    ]


@app.get("/api/friends")
def list_friends(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    links = db.query(models.Friendship).filter_by(user_id=user.id).all()
    friends = []
    for link in links:
        friend = db.get(models.User, link.friend_id)
        if not friend:
            continue
        friends.append({
            **user_out(friend),
            "isOnline": manager.is_online(friend.username),
        })
    return friends


@app.post("/api/friends", status_code=status.HTTP_201_CREATED)
async def add_friend(data: FriendSchema, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    reject_guest(user)
    other = db.query(models.User).filter(models.User.username == data.username.strip()).first()
    if not other or other.id == user.id:
        raise HTTPException(status_code=404, detail="Herói não encontrado.")
    exists = db.query(models.Friendship).filter_by(user_id=user.id, friend_id=other.id).first()
    if exists:
        raise HTTPException(status_code=400, detail="Esse herói já está na sua lista.")
    db.add(models.Friendship(user_id=user.id, friend_id=other.id))
    db.add(models.Friendship(user_id=other.id, friend_id=user.id))
    note = notify(db, user.id, "created", "friend", f"{other.username} entrou na sua lista de aliados.")
    other_note = notify(db, other.id, "created", "friend", f"{user.username} adicionou você como aliado.")
    unlocked = check_achievements(db, user)
    db.commit()
    await manager.send_user(user.id, {"type": "notification", "notification": note_out(note)})
    await manager.send_user(other.id, {"type": "notification", "notification": note_out(other_note)})
    return {"ok": True, "unlocked": unlocked}


@app.delete("/api/friends/{username}")
async def remove_friend(username: str, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    reject_guest(user)
    other = db.query(models.User).filter(models.User.username == username).first()
    if not other:
        raise HTTPException(status_code=404, detail="Herói não encontrado.")
    db.query(models.Friendship).filter(
        ((models.Friendship.user_id == user.id) & (models.Friendship.friend_id == other.id))
        | ((models.Friendship.user_id == other.id) & (models.Friendship.friend_id == user.id))
    ).delete(synchronize_session=False)
    note = notify(db, user.id, "deleted", "friend", f"{other.username} saiu da sua lista de aliados.")
    db.commit()
    await manager.send_user(user.id, {"type": "notification", "notification": note_out(note)})
    return {"ok": True}


@app.get("/api/users/{username}")
def public_profile(username: str, db: Session = Depends(get_db), _: models.User = Depends(current_user)):
    other = db.query(models.User).filter(models.User.username == username).first()
    if not other:
        raise HTTPException(status_code=404, detail="Herói não encontrado.")
    return {**user_out(other), "isOnline": manager.is_online(other.username), "achievements": achievements_for(db, other)}


@app.get("/api/chat")
def chat_history(_: models.User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.query(models.ChatMessage).order_by(models.ChatMessage.created_at.desc()).limit(80).all()
    rows.reverse()
    payload = []
    for row in rows:
        author = db.get(models.User, row.user_id)
        payload.append({
            "id": row.id,
            "username": author.username if author else "Herói",
            "content": row.content,
            "timestamp": row.created_at.strftime("%H:%M") if row.created_at else "",
        })
    return payload


@app.post("/api/chat", status_code=status.HTTP_201_CREATED)
async def send_chat(data: ChatSchema, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    reject_guest(user)
    message = models.ChatMessage(user_id=user.id, content=data.content)
    db.add(message)
    unlocked = check_achievements(db, user)
    note = notify(db, user.id, "created", "chat", "Mensagem enviada na taverna.")
    db.commit()
    db.refresh(message)
    payload = {
        "id": message.id,
        "username": user.username,
        "content": message.content,
        "timestamp": message.created_at.strftime("%H:%M"),
    }
    await manager.broadcast({"type": "receive_message", **payload})
    await manager.send_user(user.id, {"type": "notification", "notification": note_out(note)})
    return {"message": payload, "unlocked": unlocked}


@app.delete("/api/chat/{message_id}")
async def delete_chat(message_id: str, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    require_staff(user)
    message = db.get(models.ChatMessage, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada.")
    db.delete(message)
    db.commit()
    await manager.broadcast({"type": "message_deleted", "id": message_id})
    return {"ok": True}


@app.get("/api/challenges")
def list_challenges(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(models.Challenge)
        .filter((models.Challenge.from_user_id == user.id) | (models.Challenge.to_user_id == user.id))
        .order_by(models.Challenge.created_at.desc())
        .all()
    )
    return [challenge_out(row) for row in rows]


@app.post("/api/challenges", status_code=status.HTTP_201_CREATED)
async def create_challenge(data: ChallengeSchema, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    reject_guest(user)
    other = db.query(models.User).filter(models.User.username == data.toUsername.strip()).first()
    if not other or other.id == user.id:
        raise HTTPException(status_code=404, detail="Herói não encontrado.")
    if data.xpReward < 1 or data.goldReward < 1 or data.xpReward > 100 or data.goldReward > 45:
        raise HTTPException(status_code=400, detail="A recompensa fica entre uma missão fácil e uma difícil: até 100 XP e 45 de ouro.")
    if user.gold < data.goldReward:
        raise HTTPException(status_code=400, detail="Ouro insuficiente. Conclua uma missão para encher a bolsa.")
    user.gold -= data.goldReward
    challenge = models.Challenge(
        from_user_id=user.id,
        to_user_id=other.id,
        from_username=user.username,
        to_username=other.username,
        title=data.title,
        category=data.category if data.category in {"STUDY", "FITNESS", "PRODUCTIVITY", "WELLBEING", "CREATIVITY"} else "STUDY",
        xp_reward=data.xpReward,
        gold_reward=data.goldReward,
    )
    db.add(challenge)
    note = notify(db, user.id, "created", "challenge", f"Desafio enviado para {other.username}: {data.title}. {data.goldReward} de ouro saíram da bolsa.")
    other_note = notify(db, other.id, "created", "challenge", f"{user.username} desafiou você: {data.title}. Vale {data.goldReward} de ouro.")
    db.commit()
    db.refresh(challenge)
    db.refresh(user)
    payload = challenge_out(challenge)
    await manager.broadcast({"type": "new_challenge_broadcast", **payload})
    await manager.send_user(user.id, {"type": "notification", "notification": note_out(note)})
    await manager.send_user(other.id, {"type": "notification", "notification": note_out(other_note)})
    return {"challenge": payload, "user": {**user_out(user, True), "achievements": achievements_for(db, user)}}


@app.post("/api/challenges/{challenge_id}/complete")
async def complete_challenge(challenge_id: str, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    reject_guest(user)
    challenge = db.get(models.Challenge, challenge_id)
    if not challenge or challenge.to_user_id != user.id:
        raise HTTPException(status_code=404, detail="Desafio não encontrado.")
    if challenge.status != "PENDING":
        raise HTTPException(status_code=400, detail="Esse desafio já foi concluído.")
    challenge.status = "COMPLETED"
    leveled = grant_reward(user, challenge.xp_reward, challenge.gold_reward)
    unlocked = check_achievements(db, user)
    note = notify(db, user.id, "updated", "challenge", f"Desafio concluído: {challenge.title}. +{challenge.gold_reward} de ouro.")
    sender_note = notify(
        db,
        challenge.from_user_id,
        "updated",
        "challenge",
        f"{user.username} concluiu '{challenge.title}' e recebeu {challenge.gold_reward} de ouro.",
    )
    db.commit()
    manager.refresh(user)
    await manager.broadcast({
        "type": "challenge_completed_broadcast",
        "challengeId": challenge.id,
        "completedBy": user.username,
    })
    await manager.send_user(user.id, {"type": "notification", "notification": note_out(note)})
    if sender_note:
        await manager.send_user(challenge.from_user_id, {"type": "notification", "notification": note_out(sender_note)})
    return {
        "challenge": challenge_out(challenge),
        "user": {**user_out(user, True), "achievements": achievements_for(db, user)},
        "unlocked": unlocked,
        "leveled": leveled,
    }


@app.post("/api/challenges/{challenge_id}/cancel")
async def cancel_challenge(challenge_id: str, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    reject_guest(user)
    challenge = db.get(models.Challenge, challenge_id)
    if not challenge or challenge.from_user_id != user.id:
        raise HTTPException(status_code=404, detail="Desafio não encontrado.")
    if challenge.status != "PENDING":
        raise HTTPException(status_code=400, detail="Esse desafio não pode mais ser cancelado.")
    challenge.status = "CANCELLED"
    user.gold += challenge.gold_reward
    note = notify(db, user.id, "deleted", "challenge", f"Desafio cancelado: {challenge.title}. {challenge.gold_reward} de ouro voltaram.")
    other_note = notify(db, challenge.to_user_id, "deleted", "challenge", f"{user.username} cancelou o desafio '{challenge.title}'.")
    db.commit()
    db.refresh(user)
    await manager.broadcast({
        "type": "challenge_cancelled_broadcast",
        "challengeId": challenge.id,
        "refundedTo": user.username,
        "gold": user.gold,
    })
    await manager.send_user(user.id, {"type": "notification", "notification": note_out(note)})
    await manager.send_user(challenge.to_user_id, {"type": "notification", "notification": note_out(other_note)})
    return {"challenge": challenge_out(challenge), "user": {**user_out(user, True), "achievements": achievements_for(db, user)}}


@app.get("/api/notifications")
def list_notifications(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(models.Notification)
        .filter_by(user_id=user.id)
        .order_by(models.Notification.created_at.desc())
        .limit(40)
        .all()
    )
    return [note_out(row) for row in rows]


@app.post("/api/notifications/read")
def read_notifications(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    db.query(models.Notification).filter_by(user_id=user.id, read=0).update({"read": 1})
    db.commit()
    return {"ok": True}


@app.get("/api/me/emails")
def list_emails(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(models.EmailLog)
        .filter_by(user_id=user.id)
        .order_by(models.EmailLog.created_at.desc())
        .all()
    )
    return [email_out(row) for row in rows]


@app.get("/api/me/export")
def export_data(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    habits = db.query(models.Habit).filter_by(user_id=user.id).all()
    friends = db.query(models.Friendship).filter_by(user_id=user.id).all()
    friend_names = []
    for link in friends:
        friend = db.get(models.User, link.friend_id)
        if friend:
            friend_names.append(friend.username)
    payload = {
        "user": user_out(user, True),
        "habits": [habit_out(habit) for habit in habits],
        "friends": friend_names,
        "achievements": achievements_for(db, user),
    }
    subject = "Side Quest — exportação dos seus dados"
    body = (
        f"Olá {user.username},\n\n"
        "Confirmamos que você exportou seus dados do Side Quest. "
        "O arquivo JSON contém seu perfil, missões, aliados e conquistas.\n\n"
        "Side Quest"
    )
    email = record_email(db, user, subject, body)
    db.commit()
    return {"data": payload, "email": email_out(email)}


def account_row(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role or "user",
        "bio": user.bio or "",
        "level": user.level,
        "gold": user.gold,
        "characterClass": user.character_class,
    }


def purge_user(db, target):
    user_id = target.id
    pending_for_me = db.query(models.Challenge).filter_by(to_user_id=user_id, status="PENDING").all()
    for challenge in pending_for_me:
        sender = db.get(models.User, challenge.from_user_id)
        if sender and sender.id != user_id:
            sender.gold += challenge.gold_reward
            notify(db, sender.id, "deleted", "challenge", f"{target.username} saiu, e {challenge.gold_reward} de ouro voltaram para a sua bolsa.")
    db.query(models.Friendship).filter(
        (models.Friendship.user_id == user_id) | (models.Friendship.friend_id == user_id)
    ).delete(synchronize_session=False)
    db.query(models.ChatMessage).filter_by(user_id=user_id).delete(synchronize_session=False)
    db.query(models.Notification).filter_by(user_id=user_id).delete(synchronize_session=False)
    db.query(models.UserAchievement).filter_by(user_id=user_id).delete(synchronize_session=False)
    db.query(models.Challenge).filter(
        (models.Challenge.from_user_id == user_id) | (models.Challenge.to_user_id == user_id)
    ).delete(synchronize_session=False)
    db.query(models.EmailLog).filter_by(user_id=user_id).delete(synchronize_session=False)
    db.query(models.Habit).filter_by(user_id=user_id).delete(synchronize_session=False)
    db.delete(target)


def last_admin(db, target):
    if (target.role or "user") != "admin":
        return False
    admins = db.query(models.User).filter(models.User.role == "admin").count()
    return admins <= 1


@app.get("/api/admin/users")
def admin_users(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    require_staff(user)
    rows = db.query(models.User).order_by(models.User.username.asc()).all()
    return [account_row(row) for row in rows]


@app.post("/api/admin/users", status_code=status.HTTP_201_CREATED)
def admin_create_user(data: AdminCreateSchema, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    require_admin(user)
    existing = (
        db.query(models.User)
        .filter((models.User.email == data.email.lower()) | (models.User.username == data.username))
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="E-mail ou nome de usuário já cadastrado.")
    created = models.User(
        email=data.email.lower(),
        username=data.username,
        password_hash=hash_password(data.password),
        role=data.role,
        stats=json.dumps({"str": 10, "int": 10, "dex": 10, "wis": 10, "cha": 10}),
    )
    db.add(created)
    db.commit()
    db.refresh(created)
    return account_row(created)


@app.put("/api/admin/users/{user_id}")
def admin_update_user(user_id: str, data: AdminUpdateSchema, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    require_admin(user)
    target = db.get(models.User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="Herói não encontrado.")
    if data.role != "admin" and last_admin(db, target):
        raise HTTPException(status_code=400, detail="A guilda precisa de pelo menos um mestre.")
    target.role = data.role
    target.bio = data.bio
    if data.password:
        target.password_hash = hash_password(data.password)
    db.commit()
    db.refresh(target)
    return account_row(target)


@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: str, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    require_admin(user)
    target = db.get(models.User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="Herói não encontrado.")
    if target.id == user.id:
        raise HTTPException(status_code=400, detail="O mestre não pode excluir a própria conta por aqui.")
    if last_admin(db, target):
        raise HTTPException(status_code=400, detail="A guilda precisa de pelo menos um mestre.")
    purge_user(db, target)
    db.commit()
    return {"ok": True}


@app.delete("/api/me")
def delete_account(data: DeleteSchema, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    if data.confirmation != "EXCLUIR":
        raise HTTPException(status_code=400, detail="Digite EXCLUIR para confirmar a exclusão.")
    subject = "Side Quest — sua conta foi excluída"
    body = (
        f"Olá {user.username},\n\n"
        "Confirmamos a exclusão permanente da sua conta Side Quest e dos dados associados "
        f"({user.email}).\n\n"
        "Side Quest"
    )
    email = record_email(db, user, subject, body)
    confirmation = email_out(email)
    purge_user(db, user)
    db.commit()
    return {"ok": True, "email": confirmation}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        raw = await asyncio.wait_for(websocket.receive_text(), timeout=10)
        data = json.loads(raw)
        token = data.get("token") if data.get("type") == "auth" else None
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) if token else None
        db = SessionLocal()
        try:
            user = db.get(models.User, payload.get("sub")) if payload else None
        finally:
            db.close()
        if not user:
            await websocket.close(code=4401)
            return
        manager.register(websocket, Presence(user))
        await manager.broadcast_online()
        while True:
            await websocket.receive_text()
    except (WebSocketDisconnect, asyncio.TimeoutError, jwt.PyJWTError, json.JSONDecodeError):
        pass
    finally:
        manager.disconnect(websocket)
        await manager.broadcast_online()
