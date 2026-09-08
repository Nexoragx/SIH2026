from typing import Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, status
from pymongo.database import Database
import json

from src.db.db import get_db
from src.models.user_model import UserRole
from src.models.interview_report_model import DistressSeverity, ReportStatus
from src.middlewares.auth_middleware import (
    get_current_user,
    get_optional_current_user,
    require_roles
)
from src.middlewares.file_middleware import validate_and_save_audio
from src.controllers.interview_controller import (
    InterviewController,
    AssessmentSubmissionSchema,
    CaseInterventionSchema
)

router = APIRouter(prefix="/interview", tags=["Multi-Modal Interview & Assessments"])


@router.post("/submit", summary="Submit Multi-Modal Mental Health Assessment")
async def submit_assessment(
    data: AssessmentSubmissionSchema,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Database = Depends(get_db)
):
    """
    Submits psychiatric screening forms (MADRS, PHQ-9, GAD-7) and victim text input.
    Executes NLP engine, feature fusion, XGBoost distress scoring, LSTM trend prediction,
    alert engine (including 108 ambulance if critical), and generates relief recommendations in MongoDB.
    """
    return await InterviewController.submit_assessment(
        data=data,
        current_user=current_user,
        db=db
    )


@router.post("/submit-voice", summary="Submit Voice Audio Sample for STT & Acoustic Analysis")
async def submit_voice_assessment(
    file: UploadFile = File(..., description="Audio recording of victim consultation/statement"),
    data_json: Optional[str] = Form(None, description="Optional JSON string of AssessmentSubmissionSchema"),
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Database = Depends(get_db)
):
    """
    Multi-modal voice ingestion:
    Validates and saves the audio file, passes to Voice Analysis (Whisper STT & acoustic stress signals),
    and combines with form & NLP signals through the Feature Fusion Layer.
    """
    saved_audio_path = await validate_and_save_audio(file)
    
    submission_data = AssessmentSubmissionSchema()
    if data_json:
        try:
            parsed = json.loads(data_json)
            submission_data = AssessmentSubmissionSchema(**parsed)
        except Exception:
            pass

    return await InterviewController.submit_assessment(
        data=submission_data,
        current_user=current_user,
        db=db,
        audio_file_path=saved_audio_path
    )


@router.get("/reports/{report_id}", summary="Get Detailed Assessment & Explainability Report")
def get_report(
    report_id: str,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """
    Retrieves full interview report from MongoDB including SHAP explainability attributes,
    multimodal breakdown, temporal trend, and emergency dispatch status.
    """
    return InterviewController.get_report_by_id(
        session_or_report_id=report_id,
        current_user=current_user,
        db=db
    )


@router.get("/history", summary="Get Victim Assessment History & Trajectory")
def get_victim_history(
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """
    Returns sequential distress history for the authenticated victim from MongoDB,
    used to render historical trend graphs and monitor recovery or deterioration.
    """
    return InterviewController.get_victim_history(
        current_user=current_user,
        db=db
    )


@router.get(
    "/observer/dashboard",
    summary="Health Observer Dashboard (District · State · National)",
    dependencies=[Depends(require_roles([
        UserRole.OBSERVER_DISTRICT,
        UserRole.OBSERVER_STATE,
        UserRole.OBSERVER_NATIONAL,
        UserRole.PSYCHIATRIST,
        UserRole.NGO_PARTNER,
        UserRole.ADMIN
    ]))]
)
def get_observer_dashboard(
    district: Optional[str] = Query(None, description="Filter by district"),
    state: Optional[str] = Query(None, description="Filter by state"),
    severity: Optional[DistressSeverity] = Query(None, description="Filter by severity level"),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """
    Dashboard for District, State, and National Health Observers backed by MongoDB.
    Provides aggregate caseload analytics, high-risk flags, score charts,
    active 108 ambulance dispatches, and pending intervention lists.
    """
    return InterviewController.get_observer_dashboard(
        current_user=current_user,
        db=db,
        district=district,
        state=state,
        severity=severity,
        limit=limit
    )


@router.post(
    "/observer/intervene/{report_id}",
    summary="Case Intervention & Resource Assignment",
    dependencies=[Depends(require_roles([
        UserRole.OBSERVER_DISTRICT,
        UserRole.OBSERVER_STATE,
        UserRole.OBSERVER_NATIONAL,
        UserRole.PSYCHIATRIST,
        UserRole.NGO_PARTNER,
        UserRole.ADMIN
    ]))]
)
def intervene_case(
    report_id: str,
    data: CaseInterventionSchema,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """
    Enables health observers, psychiatrists, and NGO field coordinators to:
    - Update case status (UNDER_REVIEW, INTERVENTION_ASSIGNED, CRISIS_DISPATCHED, RESOLVED)
    - Assign telepsychiatrists or NGO field support
    - Record clinical intervention notes
    - Manually trigger 108 Emergency Ambulance dispatch in MongoDB
    """
    return InterviewController.update_case_intervention(
        report_id=report_id,
        data=data,
        current_user=current_user,
        db=db
    )
