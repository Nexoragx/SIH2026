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


@router.get(
    "/admin/reports",
    summary="Get All Participant Assessment Reports for Admin Panel"
)
def get_admin_reports(
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, HIGH, MODERATE, LOW)"),
    search: Optional[str] = Query(None, description="Search by session ID, participant ID, or status"),
    limit: int = Query(100, ge=1, le=500),
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Database = Depends(get_db)
):
    """
    Returns saved participant assessment reports for the Executive Admin Panel with
    model metrics, SHAP feature attributions, and temporal progression graphs.
    """
    return InterviewController.get_admin_reports(
        db=db,
        severity=severity,
        limit=limit,
        search=search
    )


@router.get(
    "/admin/reports/{report_id}",
    summary="Administrator Detailed Assessment Report"
)
def get_admin_report(
    report_id: str,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Database = Depends(get_db)
):
    """
    Returns saved questionnaire analysis, trend, and explainability for admins and observers.
    """
    return InterviewController.get_report_by_id(
        session_or_report_id=report_id,
        current_user=current_user,
        db=db,
    )


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
    current_user: Optional[dict] = Depends(get_optional_current_user),
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


@router.get("/clinical-summary/{report_id}", summary="Get Clinical AI Summary for Health Observer")
def get_clinical_summary(
    report_id: str,
    db: Database = Depends(get_db)
):
    """
    Generates structured clinical assessment summary according to Section 18.1 prompt template:
    3-sentence summary, primary risk factors, recommended intervention, and follow-up interval.
    """
    return InterviewController.generate_clinical_summary(session_or_report_id=report_id, db=db)


@router.get("/court-export/{report_id}", summary="Get Legal Aid & Court Documentation Dataset")
def get_court_export(
    report_id: str,
    db: Database = Depends(get_db)
):
    """
    Returns signed official court documentation dataset for bail / compensation hearings under SC/ST Act.
    """
    return InterviewController.generate_court_export(session_or_report_id=report_id, db=db)


@router.post("/admin/message/send", summary="Send Curated Motivation Push to Survivor")
def send_motivation_message(
    payload: dict,
    db: Database = Depends(get_db)
):
    """
    Delivers and logs a curated motivational push notification to the survivor's app.
    """
    return InterviewController.send_motivation_message(payload=payload, db=db)

