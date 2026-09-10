from typing import Optional
from fastapi import APIRouter, Depends, Query, Path
from pymongo.database import Database

from src.db.db import get_db
from src.middlewares.auth_middleware import get_optional_current_user
from src.controllers.psychiatrist_controller import (
    PsychiatristController,
    ConnectRequestSchema,
    NotificationActionSchema
)

router = APIRouter(prefix="/psychiatrist", tags=["Telepsychiatry & Doctor Directory"])


@router.get("/doctors", summary="List All Registered Tele-MANAS Psychiatrists & Observers")
def get_registered_doctors(
    district: Optional[str] = Query(None, description="Filter by district"),
    db: Database = Depends(get_db)
):
    """
    Returns verified registered Tele-MANAS Psychiatrists and Doctors for the victim
    1-to-1 consultation directory, including qualifications, hospital, and live availability.
    """
    return PsychiatristController.get_doctors(db=db, district=district)


@router.post("/connect-request", summary="Submit 1-to-1 Doctor Consultation Request")
def create_connect_request(
    data: ConnectRequestSchema,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Database = Depends(get_db)
):
    """
    Endpoint for citizens/victims to request a direct 1-to-1 consultation (Video, Voice, or Chat)
    with a specific registered doctor or next available specialist.
    Generates an urgent notification delivered to the psychiatrist workstation.
    """
    return PsychiatristController.create_connect_request(
        data=data,
        current_user=current_user,
        db=db
    )


@router.get("/notifications", summary="Get Psychiatrist Notifications & Connect Requests")
def get_psychiatrist_notifications(
    doctor_id: Optional[str] = Query(None, description="Filter by Doctor ID (e.g. DOC-ANITA-101)"),
    status: Optional[str] = Query(None, description="Filter by status (pending, accepted, scheduled, completed)"),
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Database = Depends(get_db)
):
    """
    Returns pending and active consultation requests queued for the psychiatrist,
    including patient pseudonym, distress score, requested communication mode, and triage urgency.
    """
    return PsychiatristController.get_notifications(
        doctor_id=doctor_id,
        status_filter=status,
        current_user=current_user,
        db=db
    )


@router.post("/notifications/{request_id}/action", summary="Accept or Schedule Patient Consultation")
def action_psychiatrist_notification(
    request_id: str = Path(..., description="Consultation Request ID"),
    data: NotificationActionSchema = ...,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Database = Depends(get_db)
):
    """
    Action on a notification:
    - 'accept': Immediately launches telepsychiatry room link and notifies patient.
    - 'schedule': Assigns dedicated consultation timeslot.
    - 'complete': Records clinical notes and closes the consultation.
    - 'decline': Forwards to next available doctor.
    """
    return PsychiatristController.action_notification(
        request_id=request_id,
        data=data,
        current_user=current_user,
        db=db
    )
