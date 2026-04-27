import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
import datetime

# Create data directory if it doesn't exist
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
os.makedirs(DATA_DIR, exist_ok=True)

DATABASE_URL = f"sqlite+aiosqlite:///{os.path.join(DATA_DIR, 'sessions.db')}"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

class DiagramSession(Base):
    __tablename__ = "diagram_sessions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    diagram_spec = Column(Text) # JSON string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def save_diagram_to_session(session_id: str, spec_dict: dict):
    async with AsyncSessionLocal() as session:
        new_entry = DiagramSession(
            session_id=session_id,
            diagram_spec=json.dumps(spec_dict)
        )
        session.add(new_entry)
        await session.commit()

import json
from sqlalchemy import select

async def get_session_history(session_id: str, limit: int = 3):
    async with AsyncSessionLocal() as session:
        query = select(DiagramSession).where(DiagramSession.session_id == session_id).order_by(DiagramSession.created_at.desc()).limit(limit)
        result = await session.execute(query)
        return [json.loads(row.diagram_spec) for row in result.scalars()]
