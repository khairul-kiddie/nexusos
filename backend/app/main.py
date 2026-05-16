from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import health, orchestrate, demo

app = FastAPI(
    title="NexusOS API",
    description="AI Operating System for Innovation Ecosystems",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["System"])
app.include_router(orchestrate.router, prefix="/api", tags=["Orchestration"])
app.include_router(demo.router, prefix="/api", tags=["Demo"])


@app.get("/")
async def root():
    return {
        "name": "NexusOS",
        "tagline": "AI Operating System for Innovation Ecosystems",
        "version": "1.0.0",
        "docs": "/docs",
    }
