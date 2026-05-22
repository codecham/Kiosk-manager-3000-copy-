import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import auth, enroll, groups, inventory, playbooks, terminals
from app.services.auth import hash_password


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await _create_default_admin()
    from app.services.console_key import get_or_create_console_key

    get_or_create_console_key()
    yield


async def _create_default_admin():
    """Crée un compte admin par défaut si aucun utilisateur n'existe."""
    from sqlalchemy import func, select
    from app.database import AsyncSessionLocal
    from app.models.user import User

    async with AsyncSessionLocal() as db:
        count = await db.execute(select(func.count()).select_from(User))
        if count.scalar() == 0:
            admin = User(
                username="admin",
                email="admin@localhost",
                hashed_password=hash_password("admin"),
                is_admin=True,
            )
            db.add(admin)
            await db.commit()
            print("Compte admin créé — changez le mot de passe en production !")


app = FastAPI(title="CPAS Manager 3000", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(terminals.router, prefix="/api")
app.include_router(groups.router, prefix="/api")
app.include_router(playbooks.router, prefix="/api")
app.include_router(inventory.router, prefix="/api")
app.include_router(enroll.router, prefix="/api")


class EndpointFilter(logging.Filter):
    def filter(self, record):
        return "/api/health" not in record.getMessage()


logging.getLogger("uvicorn.access").addFilter(EndpointFilter())


@app.get("/api/health")
async def health():
    return {"status": "ok"}
