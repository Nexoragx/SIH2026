import uuid
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field
from fastapi import HTTPException, status
from pymongo.database import Database
from pymongo import DESCENDING
from bson import ObjectId


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


class CaseloadNoteSchema(BaseModel):
    clinical_notes: Optional[str] = None
    scheduled_slot: Optional[str] = None
    status: Optional[str] = None


class PsychiatristController:

    @staticmethod
    def get_doctors(db: Database, district: Optional[str] = None) -> List[dict]:
        """Retrieve list of registered verified Tele-MANAS Psychiatrists for the patient directory."""
        query = {}
        if district and district.upper() != "ALL":
            query["district"] = {"$regex": f"^{district}$", "$options": "i"}

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

    @staticmethod
    def get_caseload(
        db: Database,
        severity: Optional[str] = None,
        district: Optional[str] = None,
        limit: int = 50
    ) -> List[dict]:
        """
        Fetches user assessment reports from MongoDB (db.interview_reports)
        for the psychiatrist clinical caseload and workstation review.
        """
        query = {}
        if severity and severity.upper() != "ALL":
            query["severity_level"] = severity.upper()
        if district and district.upper() != "ALL":
            query["district"] = {"$regex": f"^{district}$", "$options": "i"}

        cursor = db.interview_reports.find(query).sort("created_at", DESCENDING).limit(limit)
        reports = list(cursor)

        formatted_cases = []
        for r in reports:
            rep_id = str(r.get("_id", uuid.uuid4().hex[:8]))
            ca = r.get("clinical_assessment") or {}
            shap_list = ca.get("shap_explanations") or []
            shap_summary = ", ".join(
                [f"{s.get('feature', '')} ({s.get('importance', 0):.0f}%)" for s in shap_list[:3]]
            ) or ca.get("primary_driver") or "Multimodal psychological distress factors assessed."

            created_date = r.get("created_at")
            if isinstance(created_date, datetime):
                created_str = created_date.strftime("%d %b %Y")
            elif isinstance(created_date, str):
                created_str = created_date[:10]
            else:
                created_str = "Recent"

            formatted_cases.append({
                "id": rep_id,
                "session_id": r.get("session_id", f"SESS-{rep_id[:6]}"),
                "pseudonym": f"Survivor #{rep_id[-4:].upper()}",
                "age": r.get("age") or 28,
                "district": r.get("district") or "Nashik",
                "state": r.get("state") or "Maharashtra",
                "distressScore": float(r.get("distress_score") or 0.0),
                "riskLevel": (r.get("severity_level") or "LOW").lower(),
                "severity_level": (r.get("severity_level") or "LOW").upper(),
                "madrsScore": int(ca.get("madrs_total") or 0),
                "dsm5Probable": bool(ca.get("dsm5_probable_depression", False)),
                "referredBy": r.get("referred_by") or "Automated Multimodal Triage",
                "referredDate": created_str,
                "slotScheduled": r.get("slot_scheduled") or r.get("scheduled_slot"),
                "status": r.get("status") or "pending_review",
                "shapSummary": shap_summary,
                "clinicalNotes": r.get("clinical_notes") or ca.get("clinical_summary"),
                "detectedLanguage": r.get("detected_language") or "en",
                "touchpoint": r.get("touchpoint_type") or "web"
            })

        return formatted_cases

    @staticmethod
    def update_caseload_case(
        case_id: str,
        data: CaseloadNoteSchema,
        db: Database
    ) -> dict:
        """Updates clinical observations or confirmed schedule slots in MongoDB."""
        query = {"_id": ObjectId(case_id)} if ObjectId.is_valid(case_id) else {"session_id": case_id}
        update_fields = {}
        if data.clinical_notes is not None:
            update_fields["clinical_notes"] = data.clinical_notes
        if data.scheduled_slot is not None:
            update_fields["slot_scheduled"] = data.scheduled_slot
            update_fields["status"] = "session_scheduled"
        if data.status is not None:
            update_fields["status"] = data.status

        if update_fields:
            update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
            db.interview_reports.update_one(query, {"$set": update_fields})

        return {"success": True, "message": "Clinical case notes updated successfully in database."}
