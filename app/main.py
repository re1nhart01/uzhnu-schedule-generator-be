from typing import Annotated
from fastapi import Depends, FastAPI
from sqlalchemy import text                    
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.adapters.postgres.adapter import get_session

app = FastAPI()

@app.get("/")
async def health(
    session: AsyncSession = Depends(get_session)
):
    await session.execute(text("SELECT 1"))
    return {"status": "ok"}