"""
Support Resource Service for ANVAYA (SIH26094).
Manages verified helplines, telepsychiatry, and legal assistance networks.
"""

from typing import List, Dict, Any, Optional
from pymongo.database import Database

DEFAULT_SUPPORT_RESOURCES = [
    {
        "id": "res-1",
        "category": "mental_health",
        "name": "Tele-MANAS (Government of India)",
        "number": "14416",
        "alt_number": "1800-891-4416",
        "availability": "24x7 • Toll-Free",
        "languages": "20+ Regional Languages",
        "description": "Comprehensive psychological counselling and psychiatric crisis tele-support run by the Ministry of Health.",
        "region": "National",
        "verified": True
    },
    {
        "id": "res-2",
        "category": "victim_support",
        "name": "National Helpline Against Atrocities (NHAA)",
        "number": "14566",
        "alt_number": "1800-202-1989",
        "availability": "24x7 • Toll-Free",
        "languages": "Hindi, English & Scheduled Languages",
        "description": "Statutory support under SC/ST (PoA) Act for atrocity victims, legal protection, FIR filing, and compensation tracking.",
        "region": "National • MoSJE",
        "verified": True
    },
    {
        "id": "res-3",
        "category": "mental_health",
        "name": "KIRAN Mental Health Helpline",
        "number": "1800-599-0019",
        "alt_number": None,
        "availability": "24x7 • Toll-Free",
        "languages": "13 Regional Languages",
        "description": "Early screening, first-aid, psychological support, distress management, and mental wellbeing referrals.",
        "region": "National • DEPwD",
        "verified": True
    },
    {
        "id": "res-4",
        "category": "emergency",
        "name": "National Emergency Ambulance Network",
        "number": "108",
        "alt_number": "112",
        "availability": "24x7 • Immediate Response",
        "languages": "All States",
        "description": "Critical emergency medical transport and immediate crisis intervention dispatch.",
        "region": "All States & UTs",
        "verified": True
    },
    {
        "id": "res-5",
        "category": "victim_support",
        "name": "NALSA Free Legal Services Helpline",
        "number": "15100",
        "alt_number": None,
        "availability": "Working Hours & Urgent Callback",
        "languages": "English, Hindi & State Benches",
        "description": "Free legal aid, advocate appointment, and court representation for marginalized communities and atrocity victims.",
        "region": "National Legal Services Authority",
        "verified": True
    }
]


class SupportResourceService:

    @staticmethod
    def get_all_resources(db: Optional[Database] = None, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Retrieves verified support resources from MongoDB or fallback baseline.
        """
        if db is not None:
            try:
                query = {}
                if category:
                    query["category"] = category
                cursor = db.support_resources.find(query, {"_id": 0})
                resources = list(cursor)
                if resources:
                    return resources
            except Exception:
                pass

        if category:
            return [r for r in DEFAULT_SUPPORT_RESOURCES if r["category"] == category]
        return DEFAULT_SUPPORT_RESOURCES

    @staticmethod
    def seed_resources_if_empty(db: Database):
        """
        Seeds baseline verified resources into database if collection is empty.
        """
        try:
            if db.support_resources.count_documents({}) == 0:
                db.support_resources.insert_many(DEFAULT_SUPPORT_RESOURCES)
        except Exception:
            pass
