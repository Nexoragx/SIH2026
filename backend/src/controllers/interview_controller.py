import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from fastapi import HTTPException, status
from bson import ObjectId
from pymongo.database import Database
from pymongo import DESCENDING, ASCENDING

from src.models.user_model import UserRole
from src.models.interview_report_model import (
    TouchpointType,
    DistressSeverity,
    ReportStatus,
    serialize_report
)
from src.services.ai_service import (
    analyze_clinical_forms,
    analyze_nlp,
    analyze_voice,
    fuse_features,
    compute_distress_score,
    predict_temporal_trend,
    trigger_alert_engine,
    generate_recommendations
)


# --- Pydantic Schemas for Interview Controller ---

class AssessmentSubmissionSchema(BaseModel):
    touchpoint_type: Optional[TouchpointType] = TouchpointType.WEB_PORTAL
    language: Optional[str] = "en"
    
    # Clinical Scales Input (MADRS, PHQ-9, GAD-7)
    madrs: Optional[Dict[str, Any]] = None
    phq9: Optional[Dict[str, Any]] = None
    gad7: Optional[Dict[str, Any]] = None
    
    # Victim Text input (Chatbot, SMS, or Written Description of Atrocity)
    text_content: Optional[str] = None
    
    # Demographic / Contextual Atrocity Severity (0 - 100)
    context_score: Optional[float] = 20.0
    district: Optional[str] = None
    state: Optional[str] = None


class CaseInterventionSchema(BaseModel):
    status: ReportStatus
    assigned_psychiatrist_id: Optional[str] = None
    assigned_observer_id: Optional[str] = None
    observer_notes: Optional[str] = None
    dispatch_108_ambulance: Optional[bool] = False


# --- Controller Business Logic (MongoDB) ---

class InterviewController:

    @staticmethod
    async def submit_assessment(
        data: AssessmentSubmissionSchema,
        current_user: Optional[dict],
        db: Database,
        audio_file_path: Optional[str] = None
    ) -> dict:
        """
        Ingests multi-modal assessment from any victim touchpoint, executes
        the AI feature fusion pipeline, calculates distress score, triggers alerts
        (including 108 ambulance if critical), and stores the interview report in MongoDB.
        """
        session_id = f"SESSION-{uuid.uuid4().hex[:12].upper()}"
        victim_id = current_user.get("id") if current_user else None
        phone = current_user.get("phone") if current_user else None
        district = data.district or (current_user.get("district") if current_user else None)

        # 1. Multi-Modal Form Analysis (MADRS, PHQ-9, GAD-7)
        forms_analysis = analyze_clinical_forms(
            madrs_data=data.madrs,
            phq9_data=data.phq9,
            gad7_data=data.gad7
        )

        # 2. NLP Engine Analysis (Sentiment, Emotion AI, Threat detection)
        nlp_analysis = analyze_nlp(
            text_content=data.text_content,
            language=data.language or "en"
        )

        # 3. Voice Analysis (Whisper STT, Pitch, Stress signals)
        voice_analysis = analyze_voice(audio_file_path=audio_file_path)

        # 4. Feature Fusion Layer (Weighted Ensemble)
        fused_features = fuse_features(
            form_distress=forms_analysis["composite_form_score"],
            nlp_distress=nlp_analysis["nlp_distress_score"],
            voice_distress=voice_analysis["voice_distress_score"],
            context_score=data.context_score or 20.0,
            baseline_score=30.0
        )

        # 5. Distress Score Engine & SHAP Explainability
        distress_result = compute_distress_score(
            fused_features=fused_features,
            threat_flag=nlp_analysis["threat_detected"]
        )

        # 6. Temporal Trend Model (LSTM Progression)
        historical_scores = []
        if victim_id:
            past_reports_cursor = db.interview_reports.find(
                {"victim_id": victim_id}
            ).sort("created_at", ASCENDING)
            historical_scores = [r.get("distress_score", 0.0) for r in past_reports_cursor]

        temporal_trend = predict_temporal_trend(
            historical_scores=historical_scores,
            current_score=distress_result["score"]
        )

        # 7. Alert Engine (Push, SMS, IVR, 108 Emergency Ambulance)
        alert_result = await trigger_alert_engine(
            user_id=victim_id,
            phone=phone,
            distress_score=distress_result["score"],
            severity=distress_result["severity"],
            district=district
        )

        # 8. Recommendation Engine (Counselling, NGO, Legal, Medical, Financial aid)
        recommendations = generate_recommendations(
            distress_score=distress_result["score"],
            severity=distress_result["severity"],
            district=district
        )

        # 9. Save Interview Report Document to MongoDB
        now = datetime.now(timezone.utc)
        report_status = (
            ReportStatus.CRISIS_DISPATCHED.value
            if alert_result.get("ambulance_108_dispatched")
            else ReportStatus.PENDING.value
        )
        report_doc = {
            "session_id": session_id,
            "victim_id": victim_id,
            "touchpoint_type": data.touchpoint_type.value if hasattr(data.touchpoint_type, "value") else str(data.touchpoint_type),
            "detected_language": data.language or "en",
            "form_data": forms_analysis,
            "nlp_analysis": nlp_analysis,
            "voice_analysis": voice_analysis,
            "fused_features": fused_features,
            "distress_score": distress_result["score"],
            "severity_level": distress_result["severity"].value,
            "shap_explanations": distress_result["shap_explanations"],
            "temporal_trend": temporal_trend,
            "alert_triggered": alert_result["alert_triggered"],
            "alert_details": alert_result,
            "recommendations": recommendations,
            "assigned_observer_id": None,
            "assigned_psychiatrist_id": None,
            "status": report_status,
            "observer_notes": None,
            "created_at": now,
            "updated_at": now
        }
        res = db.interview_reports.insert_one(report_doc)
        report_id_str = str(res.inserted_id)

        return {
            "id": report_id_str,
            "session_id": session_id,
            "distress_score": report_doc["distress_score"],
            "severity_level": report_doc["severity_level"],
            "alert_triggered": report_doc["alert_triggered"],
            "ambulance_108_dispatched": alert_result.get("ambulance_108_dispatched", False),
            "shap_explainability": report_doc["shap_explanations"],
            "temporal_trend": report_doc["temporal_trend"],
            "recommendations": report_doc["recommendations"],
            "created_at": report_doc["created_at"].isoformat()
        }

    @staticmethod
    def get_report_by_id(session_or_report_id: str, current_user: dict, db: Database) -> dict:
        """
        Retrieves complete multi-modal report details from MongoDB.
        Enforces access permission (victim's own report or authorized observer/psychiatrist).
        """
        query = {"session_id": session_or_report_id}
        if ObjectId.is_valid(session_or_report_id):
            query = {"$or": [{"_id": ObjectId(session_or_report_id)}, {"session_id": session_or_report_id}]}

        report = db.interview_reports.find_one(query)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview report not found."
            )

        # Check authorization
        user_id = str(current_user.get("id"))
        is_owner = report.get("victim_id") == user_id
        user_role = current_user.get("role")
        is_observer = user_role in [
            UserRole.OBSERVER_DISTRICT.value,
            UserRole.OBSERVER_STATE.value,
            UserRole.OBSERVER_NATIONAL.value,
            UserRole.PSYCHIATRIST.value,
            UserRole.NGO_PARTNER.value,
            UserRole.ADMIN.value
        ]

        if not (is_owner or is_observer):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this report."
            )

        return serialize_report(report)

    @staticmethod
    def get_victim_history(current_user: dict, db: Database) -> dict:
        """
        Fetches historical assessments and trend progression for the authenticated victim.
        """
        user_id = str(current_user.get("id"))
        cursor = db.interview_reports.find(
            {"victim_id": user_id}
        ).sort("created_at", DESCENDING)

        reports = list(cursor)
        return {
            "total_assessments": len(reports),
            "history": [
                {
                    "id": str(r["_id"]),
                    "session_id": r.get("session_id"),
                    "distress_score": r.get("distress_score"),
                    "severity_level": r.get("severity_level"),
                    "created_at": r.get("created_at").isoformat() if isinstance(r.get("created_at"), datetime) else str(r.get("created_at")),
                    "status": r.get("status")
                }
                for r in reports
            ]
        }

    @staticmethod
    def get_observer_dashboard(
        current_user: dict,
        db: Database,
        district: Optional[str] = None,
        state: Optional[str] = None,
        severity: Optional[DistressSeverity] = None,
        limit: int = 50
    ) -> dict:
        """
        Health Observer Dashboard (District · State · National) backed by MongoDB.
        """
        filter_query: Dict[str, Any] = {}

        # Role-based jurisdiction scoping
        user_role = current_user.get("role")
        if user_role == UserRole.OBSERVER_DISTRICT.value and current_user.get("district"):
            district = current_user.get("district")
        elif user_role == UserRole.OBSERVER_STATE.value and current_user.get("state"):
            state = current_user.get("state")

        if severity:
            sev_val = severity.value if hasattr(severity, "value") else str(severity)
            filter_query["severity_level"] = sev_val

        total_cases = db.interview_reports.count_documents(filter_query)
        critical_cases = db.interview_reports.count_documents({**filter_query, "severity_level": DistressSeverity.CRITICAL.value})
        high_cases = db.interview_reports.count_documents({**filter_query, "severity_level": DistressSeverity.HIGH.value})
        moderate_cases = db.interview_reports.count_documents({**filter_query, "severity_level": DistressSeverity.MODERATE.value})
        low_cases = db.interview_reports.count_documents({**filter_query, "severity_level": DistressSeverity.LOW.value})
        active_dispatches = db.interview_reports.count_documents({"status": ReportStatus.CRISIS_DISPATCHED.value})

        recent_cursor = db.interview_reports.find(filter_query).sort("created_at", DESCENDING).limit(limit)
        recent_reports = list(recent_cursor)

        return {
            "jurisdiction": {
                "role": user_role,
                "district": district or "All",
                "state": state or "All"
            },
            "statistics": {
                "total_cases": total_cases,
                "critical": critical_cases,
                "high": high_cases,
                "moderate": moderate_cases,
                "low": low_cases,
                "active_108_dispatches": active_dispatches
            },
            "cases": [
                {
                    "id": str(r["_id"]),
                    "session_id": r.get("session_id"),
                    "victim_id": r.get("victim_id"),
                    "distress_score": r.get("distress_score"),
                    "severity_level": r.get("severity_level"),
                    "status": r.get("status"),
                    "touchpoint": r.get("touchpoint_type"),
                    "alert_triggered": r.get("alert_triggered"),
                    "created_at": r.get("created_at").isoformat() if isinstance(r.get("created_at"), datetime) else str(r.get("created_at"))
                }
                for r in recent_reports
            ]
        }

    @staticmethod
    def update_case_intervention(
        report_id: str,
        data: CaseInterventionSchema,
        current_user: dict,
        db: Database
    ) -> dict:
        """
        Updates case status, assigns a psychiatrist or NGO field worker,
        records clinical observation notes, or manually triggers 108 ambulance dispatch in MongoDB.
        """
        query = {"_id": ObjectId(report_id)} if ObjectId.is_valid(report_id) else {"session_id": report_id}
        report = db.interview_reports.find_one(query)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found."
            )

        status_val = data.status.value if hasattr(data.status, "value") else str(data.status)
        update_fields: Dict[str, Any] = {
            "status": status_val,
            "updated_at": datetime.now(timezone.utc)
        }
        if data.assigned_psychiatrist_id:
            update_fields["assigned_psychiatrist_id"] = data.assigned_psychiatrist_id
        if data.assigned_observer_id:
            update_fields["assigned_observer_id"] = data.assigned_observer_id
        if data.observer_notes:
            update_fields["observer_notes"] = data.observer_notes

        if data.dispatch_108_ambulance:
            update_fields["status"] = ReportStatus.CRISIS_DISPATCHED.value
            alert_details = report.get("alert_details") or {}
            alert_details["manual_108_dispatch"] = {
                "dispatched_by_observer_id": str(current_user.get("id")),
                "reason": "Observer manually escalated to 108 Emergency Ambulance"
            }
            update_fields["alert_details"] = alert_details

        db.interview_reports.update_one(query, {"$set": update_fields})

        return {
            "message": "Case intervention successfully updated.",
            "report_id": report_id,
            "status": update_fields["status"],
            "assigned_psychiatrist_id": update_fields.get("assigned_psychiatrist_id"),
            "observer_notes": update_fields.get("observer_notes")
        }
