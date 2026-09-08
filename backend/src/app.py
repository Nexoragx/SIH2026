from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from src.config.config import settings
from src.db.db import init_db
from src.routes.auth_routes import router as auth_router
from src.routes.interview_routes import router as interview_router
from src.routes.support_routes import router as support_router

# Setup logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
# Silence verbose pymongo driver heartbeats
logging.getLogger("pymongo").setLevel(logging.WARNING)
logger = logging.getLogger("sih26094_app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager: handles startup and shutdown logic.
    """
    logger.info("Initializing database tables...")
    init_db()
    logger.info("SIH26094 Mental Health Backend started successfully.")
    yield
    logger.info("SIH26094 Mental Health Backend shutting down.")


def create_app() -> FastAPI:
    """
    Application factory for the FastAPI backend.
    """
    # Ensure database tables exist
    init_db()

    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=(
            "AI-Powered Dynamic Mental Health Monitoring and Distress Prediction "
            "System for Victims of Atrocities (SIH26094).\n\n"
            "Implements multi-modal ingestion (Form, NLP, Voice), Feature Fusion, "
            "Distress Scoring (0-100), LSTM Temporal Progression, Crisis 108 Ambulance Dispatch, "
            "and Role-Based Health Observer Dashboards (District · State · National)."
        ),
        version="1.0.0",
        lifespan=lifespan,
        docs_url=f"{settings.API_V1_PREFIX}/docs",
        redoc_url=f"{settings.API_V1_PREFIX}/redoc",
        openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
    )

    # 1. CORS Middleware (Permit all localhost & 127.0.0.1 development ports)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 2. Validation Exception Handler (formats Pydantic errors into human-readable messages)
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        error_messages = []
        for error in exc.errors():
            loc_parts = [str(part) for part in error.get("loc", []) if part != "body"]
            loc_str = " -> ".join(loc_parts)
            msg = str(error.get("msg", "Validation error"))
            if msg.startswith("Value error, "):
                msg = msg[len("Value error, "):]
            if loc_str:
                error_messages.append(f"{loc_str.replace('_', ' ').capitalize()}: {msg}")
            else:
                error_messages.append(msg)
        readable_detail = "; ".join(error_messages) if error_messages else "Invalid request payload."
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "Validation Error",
                "detail": readable_detail
            }
        )

    # 3. Global Exception Handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled error on {request.url.path}: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal Server Error",
                "detail": str(exc) if settings.DEBUG else "An unexpected error occurred."
            }
        )

    # 3. Mount Routers
    app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
    app.include_router(interview_router, prefix=settings.API_V1_PREFIX)
    app.include_router(support_router, prefix=settings.API_V1_PREFIX)

    # 4. System Health & Architecture Endpoints
    @app.get(f"{settings.API_V1_PREFIX}/health", tags=["System"])
    def health_check():
        return {
            "status": "healthy",
            "project": "SIH26094 - AI-Powered Dynamic Mental Health Monitoring",
            "environment": settings.ENVIRONMENT,
            "version": "1.0.0"
        }

    @app.get(f"{settings.API_V1_PREFIX}/architecture", tags=["System"])
    def system_architecture():
        return {
            "title": "SIH26094 System Architecture Layers",
            "layers": [
                {"tier": 1, "name": "Victim Touch-points", "channels": ["Mobile app", "Web portal", "IVRS calls", "SMS", "Chatbot", "Helpline"]},
                {"tier": 2, "name": "API Gateway", "features": ["JWT Auth", "OAuth2", "Rate Limiting", "TLS 1.3", "Language Detect"]},
                {"tier": 3, "name": "Multi-Modal Ingestion & Analysis", "components": ["Form analysis (MADRS, PHQ-9, GAD-7)", "NLP engine (Sentiment, Emotion AI, Threat detection)", "Voice analysis (Whisper STT, Pitch, Stress signals)"]},
                {"tier": 4, "name": "Feature Fusion Layer", "weights": {"madrs": "40%", "nlp": "15%", "voice": "10%", "context": "15%", "baseline": "20%"}},
                {"tier": 5, "name": "Distress Score Engine", "scale": "0 - 100", "severity": ["🟢 Low (0-25)", "🟡 Moderate (26-50)", "🟠 High (51-75)", "🔴 Critical (76-100)"], "explainability": "XGBoost + SHAP"},
                {"tier": 6, "name": "Temporal Trend Model (LSTM)", "purpose": "Predict worsening risk trajectory across consecutive sessions"},
                {"tier": 7, "name": "Action Engines", "engines": ["Alert Engine (Push, SMS, IVR, 108 Ambulance Dispatch)", "Recommendation Engine (Counselling, NGO, Legal, Medical, Financial aid)"]},
                {"tier": 8, "name": "Health Observer Dashboard", "levels": ["District", "State", "National"], "features": ["Risk cases", "Score graphs", "Alerts", "1:1 Chat", "Case assign", "Interventions"]},
                {"tier": 9, "name": "Ecosystem Integrations", "partners": ["Psychiatrist Telepsychiatry portal", "NGO partners Field support", "108 Ambulance Crisis dispatch API"]}
            ]
        }

    return app


app = create_app()
