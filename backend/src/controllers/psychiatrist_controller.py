import uuid
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field
from fastapi import HTTPException, status
from pymongo.database import Database
from pymongo import DESCENDING


class ConnectRequestSchema(BaseModel):
    doctor_id: str = Field(..., description="Target Doctor ID or ANY")
    doctor_name: Optional[str] = None
    preferred_mode: str = Field("video", description="video, voice, or chat")
    victim_name: Optional[str] = "Anonymous Survivor"
    victim_id: Optional[str] = None
    phone: Optional[str] = None
    district: Optional[str] = "Nashik"
    state: Optional[str] = "Maharashtra"
    distress_score: Optional[float] = None
    severity_level: Optional[str] = "MODERATE"
    reason: Optional[str] = "Requested 1-to-1 Telepsychiatry review."


class NotificationActionSchema(BaseModel):
    action: str = Field(..., description="accept, schedule, complete, decline")
    scheduled_slot: Optional[str] = None
    clinical_notes: Optional[str] = None


class PsychiatristController:

    @staticmethod
    def get_doctors(db: Database, district: Optional[str] = None) -> List[dict]:
        """Retrieve list of registered verified Tele-MANAS Psychiatrists for the patient directory."""
        query = {}
        if district and district.upper() != "ALL":
            query["district"] = {"": f"^{district}$", "off on off off off off off off off off on off on off off off off off on off off off on on off off off off on off off off off off off off off off off off off on off off off off off off off on off on on off off off on off off on off off on off off on off on off off on off on off off off off on off off off on off off on off off off off off off off off on off on off off on off off off off off off off off off off off off on off off off on off on off on on off off off off on on off off on on off on off on on off off off off on on off off on off off off off off on off off on off off on off off off off off off on off off off off on on off on off off off off off on off on off off off off off off off off off off on on off on off off off": "i"}

        doctors = list(db.psychiatrists.find(query, {"_id": 0}).sort("rating", DESCENDING))
        if not doctors:
            # Fallback to user collection if psychiatrists collection is empty
            user_docs = list(db.user.find({"role": "psychiatrist"}, {"_id": 0, "hashed_password": 0}))
            return user_docs
        return doctors

    @staticmethod
    def create_connect_request(
        data: ConnectRequestSchema,
        current_user: Optional[dict],
        db: Database
    ) -> dict:
        """Submits a 1-to-1 consultation request from a citizen/victim to a psychiatrist."""
        now = datetime.now(timezone.utc)
        req_id = f"REQ-CON-{uuid.uuid4().hex[:8].upper()}"

        # Resolve doctor name if not provided
        doctor_name = data.doctor_name
        if not doctor_name and data.doctor_id != "ANY":
            doc = db.psychiatrists.find_one({"doctor_id": data.doctor_id})
            if doc:
                doctor_name = doc.get("name")

        victim_id = current_user.get("id") if current_user else data.victim_id
        victim_name = data.victim_name
        if current_user and current_user.get("full_name"):
            victim_name = current_user["full_name"]

        request_doc = {
            "request_id": req_id,
            "doctor_id": data.doctor_id,
            "doctor_name": doctor_name or "On-Duty Telepsychiatrist",
            "victim_id": victim_id,
            "victim_name": victim_name,
            "preferred_mode": data.preferred_mode.lower(),
            "phone": data.phone or (current_user.get("phone") if current_user else None),
            "district": data.district or (current_user.get("district") if current_user else "Nashik"),
            "state": data.state or (current_user.get("state") if current_user else "Maharashtra"),
            "distress_score": data.distress_score,
            "severity_level": (data.severity_level or "MODERATE").upper(),
            "reason": data.reason,
            "status": "pending",
            "session_link": None,
            "scheduled_slot": None,
            "clinical_notes": None,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }

        db.doctor_connect_requests.insert_one(request_doc)
        request_doc.pop("_id", None)

        return {
            "success": True,
            "message": f"1-to-1 consultation request submitted successfully to {request_doc['doctor_name']}. The doctor has been notified.",
            "request_id": req_id,
            "request": request_doc
        }

    @staticmethod
    def get_notifications(
        doctor_id: Optional[str],
        status_filter: Optional[str],
        current_user: Optional[dict],
        db: Database
    ) -> dict:
        """Fetches incoming victim consultation requests/notifications for the psychiatrist."""
        query = {}
        target_doc_id = doctor_id
        if not target_doc_id and current_user and current_user.get("doctor_id"):
            target_doc_id = current_user.get("doctor_id")

        if target_doc_id and target_doc_id.upper() != "ALL":
            query["$or"] = [
                {"doctor_id": target_doc_id},
                {"doctor_id": target_doc_id.upper()},
                {"doctor_id": "ANY"}
            ]

        if status_filter and status_filter.upper() != "ALL":
            query["status"] = status_filter.lower()

        cursor = db.doctor_connect_requests.find(query, {"_id": 0})
        notifications = list(cursor)

        # Format dates if datetime objects
        for n in notifications:
            if isinstance(n.get("created_at"), datetime):
                n["created_at"] = n["created_at"].isoformat()
            if isinstance(n.get("updated_at"), datetime):
                n["updated_at"] = n["updated_at"].isoformat()

        notifications.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)

        pending_count = sum(1 for n in notifications if n.get("status") == "pending")

        return {
            "total": len(notifications),
            "pending_count": pending_count,
            "notifications": notifications
        }

    @staticmethod
    def action_notification(
        request_id: str,
        data: NotificationActionSchema,
        current_user: Optional[dict],
        db: Database
    ) -> dict:
        """Psychiatrist accepts, schedules, or completes a patient consultation request."""
        req = db.doctor_connect_requests.find_one({"request_id": request_id})
        if not req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Consultation request {request_id} was not found."
            )

        now = datetime.now(timezone.utc).isoformat()
        action_lower = data.action.lower()
        updates = {"updated_at": now}

        if action_lower == "accept":
            updates["status"] = "accepted"
            updates["session_link"] = f"https://telemanas.gov.in/telepsychiatry/room/{request_id}"
            updates["accepted_at"] = now
        elif action_lower == "schedule":
            updates["status"] = "scheduled"
            updates["scheduled_slot"] = data.scheduled_slot or "Tomorrow 10:00 AM"
        elif action_lower == "complete":
            updates["status"] = "completed"
            if data.clinical_notes:
                updates["clinical_notes"] = data.clinical_notes
        elif action_lower == "decline":
            updates["status"] = "declined"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid action: '{data.action}'. Supported: accept, schedule, complete, decline."
            )

        db.doctor_connect_requests.update_one(
            {"request_id": request_id},
            {"$set": updates}
        )

        updated_req = db.doctor_connect_requests.find_one({"request_id": request_id}, {"_id": 0})
        return {
            "success": True,
            "action": action_lower,
            "message": f"Request {request_id} has been marked as {updates.get('status')}.",
            "request": updated_req
        }
