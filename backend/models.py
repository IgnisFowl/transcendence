import uuid
from datetime import datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


def new_id():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=new_id)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")
    bio = Column(String, default="")
    avatar_filename = Column(String, nullable=True)
    character_class = Column(String, default="UNASSIGNED")
    has_completed_survey = Column(Integer, default=0)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    hp = Column(Integer, default=100)
    max_hp = Column(Integer, default=100)
    mana = Column(Integer, default=50)
    max_mana = Column(Integer, default=50)
    gold = Column(Integer, default=50)
    stats = Column(Text, default='{"str": 10, "int": 10, "dex": 10, "wis": 10, "cha": 10}')
    created_at = Column(DateTime, default=datetime.utcnow)

    habits = relationship("Habit", back_populates="owner", cascade="all, delete-orphan")


class Habit(Base):
    __tablename__ = "habits"

    id = Column(String, primary_key=True, default=new_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    category = Column(String, default="STUDY")
    difficulty = Column(String, default="MEDIUM")
    streak = Column(Integer, default=0)
    completed_today = Column(Integer, default=0)
    last_completed = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    owner = relationship("User", back_populates="habits")


class Friendship(Base):
    __tablename__ = "friendships"

    id = Column(String, primary_key=True, default=new_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    friend_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=new_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=new_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String, nullable=False)
    entity = Column(String, nullable=False)
    message = Column(String, nullable=False)
    read = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(String, primary_key=True, default=new_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    achievement_id = Column(String, ForeignKey("achievements.id"), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.utcnow)


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(String, primary_key=True, default=new_id)
    from_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    to_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    from_username = Column(String, nullable=False)
    to_username = Column(String, nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, default="STUDY")
    xp_reward = Column(Integer, default=50)
    gold_reward = Column(Integer, default=25)
    status = Column(String, default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)


class EmailLog(Base):
    __tablename__ = "email_log"

    id = Column(String, primary_key=True, default=new_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    to_email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
