import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    character_class = Column(String, default="UNASSIGNED")
    has_completed_survey = Column(Boolean, default=False)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    hp = Column(Integer, default=100)
    max_hp = Column(Integer, default=100)
    mana = Column(Integer, default=50)
    max_mana = Column(Integer, default=50)
    gold = Column(Integer, default=50)
    stats = Column(JSON, default=lambda: {"str": 10, "int": 10, "dex": 10, "wis": 10, "cha": 10})

    created_at = Column(DateTime, default=datetime.utcnow)
    habits = relationship("Habit", back_populates="owner", cascade="all, delete-orphan")

class Habit(Base):
    __tablename__ = "habits"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    category = Column(String, default="STUDY")
    difficulty = Column(String, default="MEDIUM")
    streak = Column(Integer, default=0)
    completed_today = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    owner = relationship("User", back_populates="habits")

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    from_username = Column(String, nullable=False)
    to_username = Column(String, nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, default="STUDY")
    xp_reward = Column(Integer, default=50)
    gold_reward = Column(Integer, default=25)
    status = Column(String, default="PENDING")

    created_at = Column(DateTime, default=datetime.utcnow)
