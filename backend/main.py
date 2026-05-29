import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import ollama
from app.api.routes import router

load_dotenv()

app = FastAPI(
    title="VoxMail AI Backend",
    description="AI-powered email assistant",
    version="1.0.0"
)

app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "status": "online",
        "provider": os.getenv("LLM_PROVIDER", "ollama"),
        "message": "VoxMail AI Backend Running"
    }


@app.get("/health/ollama")
async def check_ollama():
    try:
        models = ollama.list()

        available_models = []

        # New Ollama API format
        if hasattr(models, "models"):
            available_models = [m.model for m in models.models]

        return {
            "status": "connected",
            "available_models": available_models
        }

    except Exception as e:
        return {
            "status": "disconnected",
            "error": str(e)
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )