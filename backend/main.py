import json
from typing import List, Dict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta

from database import engine, Base, get_db
import models

# Inicializa o banco de dados
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HabitQuest RPG API (Python + FastAPI)",
    description="API do HabitQuest em Python com WebSockets em Tempo Real e Swagger Docs automáticos",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "habitquest_secret_key_42"
ALGORITHM = "HS256"

# Pydantic Schemas
class RegisterSchema(BaseModel):
    email: str
    username: str
    password: str

class LoginSchema(BaseModel):
    email: str
    password: str

class HabitCreateSchema(BaseModel):
    title: str
    description: str = ""
    category: str = "STUDY"
    difficulty: str = "MEDIUM"

class SurveySubmitSchema(BaseModel):
    character_class: str

# Connection Manager para WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[WebSocket, str] = {}
        self.online_users: Dict[str, dict] = {}

    async def connect(self, websocket: WebSocket, username: str = "Herói"):
        await websocket.accept()
        self.active_connections[websocket] = username

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            username = self.active_connections.pop(websocket)
            if username in self.online_users:
                del self.online_users[username]

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections.keys()):
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# --- ROTAS REST ---

@app.get("/")
def read_root():
    return {"message": "⚔️ HabitQuest Python Backend (FastAPI) está operacional!"}

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(data: RegisterSchema, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter((models.User.email == data.email) | (models.User.username == data.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="E-mail ou nome de usuário já cadastrado.")

    hashed_pw = pwd_context.hash(data.password)
    new_user = models.User(
        email=data.email,
        username=data.username,
        password_hash=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = jwt.encode({"sub": new_user.id, "username": new_user.username, "exp": datetime.utcnow() + timedelta(days=7)}, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "username": new_user.username,
            "characterClass": new_user.character_class,
            "hasCompletedSurvey": new_user.has_completed_survey,
            "level": new_user.level,
            "xp": new_user.xp,
            "gold": new_user.gold,
            "stats": new_user.stats
        },
        "token": token
    }

@app.post("/api/auth/login")
def login_user(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Credenciais inválidas.")

    token = jwt.encode({"sub": user.id, "username": user.username, "exp": datetime.utcnow() + timedelta(days=7)}, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "characterClass": user.character_class,
            "hasCompletedSurvey": user.has_completed_survey,
            "level": user.level,
            "xp": user.xp,
            "gold": user.gold,
            "stats": user.stats
        },
        "token": token
    }

@app.post("/api/user/survey")
def submit_survey(data: SurveySubmitSchema, user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    user.character_class = data.character_class
    user.has_completed_survey = True

    # Ajusta atributos base conforme a classe
    stats = {"str": 10, "int": 10, "dex": 10, "wis": 10, "cha": 10}
    if data.character_class == "WIZARD": stats["int"] = 18
    elif data.character_class == "WARRIOR": stats["str"] = 18
    elif data.character_class == "ROGUE": stats["dex"] = 18
    elif data.character_class == "CLERIC": stats["wis"] = 18
    elif data.character_class == "BARD": stats["cha"] = 18

    user.stats = stats
    db.commit()

    return {"message": "Questionário salvo com sucesso!", "characterClass": user.character_class, "stats": user.stats}

@app.get("/api/habits")
def get_habits(user_id: str, db: Session = Depends(get_db)):
    habits = db.query(models.Habit).filter(models.Habit.user_id == user_id).all()
    return habits

@app.post("/api/habits")
def create_habit(data: HabitCreateSchema, user_id: str, db: Session = Depends(get_db)):
    new_h = models.Habit(
        user_id=user_id,
        title=data.title,
        description=data.description,
        category=data.category,
        difficulty=data.difficulty
    )
    db.add(new_h)
    db.commit()
    db.refresh(new_h)
    return new_h

@app.post("/api/ai/generate-habits")
def generate_ai_habits():
    return {
        "title": "Ler 20 páginas de Arquitetura de Sistemas (Missão IA Python)",
        "description": "O Mestre da Masmorra gerou este hábito baseado no seu perfil de estudo.",
        "category": "STUDY",
        "difficulty": "HARD"
    }

# --- WEBSOCKET DA TAVERNA E DESAFIOS ---

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data_raw = await websocket.receive_text()
            data = json.loads(data_raw)
            event_type = data.get("type")

            if event_type == "user_online":
                username = data.get("username", "Herói")
                manager.online_users[username] = {
                    "username": username,
                    "characterClass": data.get("characterClass", "UNASSIGNED"),
                    "level": data.get("level", 1),
                    "stats": data.get("stats", {})
                }
                await manager.broadcast({
                    "type": "online_users_list",
                    "users": list(manager.online_users.values())
                })

            elif event_type == "send_message":
                await manager.broadcast({
                    "type": "receive_message",
                    "username": data.get("username"),
                    "content": data.get("content"),
                    "timestamp": datetime.now().strftime("%H:%M")
                })

            elif event_type == "send_challenge":
                await manager.broadcast({
                    "type": "new_challenge_broadcast",
                    "id": f"ch_{int(datetime.now().timestamp())}",
                    "fromUsername": data.get("fromUsername"),
                    "toUsername": data.get("toUsername"),
                    "title": data.get("title"),
                    "category": data.get("category", "STUDY"),
                    "xpReward": data.get("xpReward", 50),
                    "goldReward": data.get("goldReward", 25),
                    "status": "PENDING"
                })
                await manager.broadcast({
                    "type": "system_feed",
                    "text": f"⚔️ O Herói {data.get('fromUsername')} desafiou {data.get('toUsername')} para a missão: '{data.get('title')}'!",
                    "timestamp": datetime.now().strftime("%H:%M:%S")
                })

            elif event_type == "complete_challenge":
                await manager.broadcast({
                    "type": "challenge_completed_broadcast",
                    "challengeId": data.get("challengeId"),
                    "completedBy": data.get("completedBy")
                })
                await manager.broadcast({
                    "type": "system_feed",
                    "text": f"🎉 O Herói {data.get('completedBy')} completou o desafio enviado com êxito! (+50 XP / +25 Ouro)",
                    "timestamp": datetime.now().strftime("%H:%M:%S")
                })

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast({
            "type": "online_users_list",
            "users": list(manager.online_users.values())
        })
