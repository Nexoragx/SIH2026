import enum
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class TouchpointType(str, enum.Enum):
    MOBILE_APP = "mobile_app"
    WEB_PORTAL = "web_portal"
    IVRS_CALL = "ivrs_calls"
    SMS = "sms"
    CHATBOT = "chatbot"
    HELPLINE = "helpline"


class DistressSeverity(str, enum.Enum):
    LOW = "LOW"            # 0 - 25 (Green)
    MODERATE = "MODERATE"  # 26 - 50 (Yellow)
    HIGH = "HIGH"          # 51 - 75 (Orange)
    CRITICAL = "CRITICAL"  # 76 - 100 (Red)


class ReportStatus(str, enum.Enum):
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    INTERVENTION_ASSIGNED = "INTERVENTION_ASSIGNED"
    CRISIS_DISPATCHED = "CRISIS_DISPATCHED"
    RESOLVED = "RESOLVED"


class InterviewReport(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    session_id: str
    victim_id: Optional[str] = None
    
    # Touchpoint & Input Ingestion
    touchpoint_type: TouchpointType = TouchpointType.WEB_PORTAL
    detected_language: str = "en"
    
    # Multi-Modal Analysis Results
    form_data: Optional[Dict[str, Any]] = None
    nlp_analysis: Optional[Dict[str, Any]] = None
    voice_analysis: Optional[Dict[str, Any]] = None
    fused_features: Optional[Dict[str, Any]] = None
    
    # Distress Score Engine
    distress_score: float = 0.0
    severity_level: DistressSeverity = DistressSeverity.LOW
    shap_explanations: Optional[Dict[str, Any]] = None
    
    # Temporal Trend Model
    temporal_trend: Optional[Dict[str, Any]] = None
    
    # Alert Engine
    alert_triggered: bool = False
    alert_details: Optional[Dict[str, Any]] = None
    
    # Recommendation Engine
    recommendations: Optional[Dict[str, Any]] = None
    
    # Health Observer Dashboard & Interventions
    assigned_observer_id: Optional[str] = None
    assigned_psychiatrist_id: Optional[str] = None
    status: ReportStatus = ReportStatus.PENDING
    observer_notes: Optional[str] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda dt: dt.isoformat()}


def serialize_report(doc: dict) -> dict:
    """Helper to serialize a MongoDB report document into an API response dict."""
    if not doc:
        return {}
    report_dict = dict(doc)
    report_dict["id"] = str(report_dict.pop("_id", ""))
    return report_dict
