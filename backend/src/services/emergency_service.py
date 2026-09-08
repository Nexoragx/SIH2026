"""
Emergency Service Abstraction for SIH26094.
Supports safe demonstration mode for presentations without contacting real live emergency services.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from pymongo.database import Database

logger = logging.getLogger("emergency_service")


class EmergencyService:
    DEMO_MODE: bool = True  # Production mode requires verified government 108 API credentials

    @classmethod
    def dispatch_emergency(
        cls,
        case_id: str,
        location: str,
        reason: str,
        caller_phone: Optional[str] = None,
        db: Optional[Database] = None
    ) -> Dict[str, Any]:
        """
        Dispatches emergency protocol. In DEMO MODE, securely logs the request
        and simulates immediate ambulance notification.
        """
        dispatch_id = f"DISP-108-{uuid.uuid4().hex[:8].upper()}"
        now = datetime.now(timezone.utc)

        record = {
            "dispatch_id": dispatch_id,
            "case_id": case_id,
            "location": location,
            "reason": reason,
            "caller_phone": caller_phone or "Confidential Survivor Line",
            "protocol": "108_CRISIS_DISPATCH",
            "is_demo": cls.DEMO_MODE,
            "status": "DISPATCH_CONFIRMED_DEMO" if cls.DEMO_MODE else "DISPATCH_TRANSMITTED",
            "eta_minutes": 12,
            "created_at": now
        }

        if db is not None:
            try:
                db.emergency_requests.insert_one(record)
                # Also log an alert in alerts collection
                alert_doc = {
                    "alert_id": f"ALT-{uuid.uuid4().hex[:6].upper()}",
                    "case_id": case_id,
                    "category": "CRISIS",
                    "priority": "P0_CRITICAL",
                    "reason": f"Emergency Assistance Dispatched: {reason}",
                    "location": location,
                    "status": "OPEN",
                    "created_at": now
                }
                db.alerts.insert_one(alert_doc)
            except Exception as e:
                logger.error(f"Error persisting emergency dispatch: {e}")

        logger.info(f"Emergency dispatch processed ({dispatch_id}) for case {case_id} [DEMO_MODE={cls.DEMO_MODE}]")

        return {
            "success": True,
            "dispatch_id": dispatch_id,
            "demo_mode": cls.DEMO_MODE,
            "message": "Emergency dispatch recorded successfully. Assistance is being coordinated.",
            "protocol": "National Emergency 108 Safety Net",
            "status": "DISPATCH_CONFIRMED",
            "eta_minutes": 12,
            "created_at": now.isoformat()
        }
