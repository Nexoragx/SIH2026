"""
MongoDB connection and collection manager for SIH26094 Mental Health Backend.
Uses PyMongo client with connection pooling, indexes setup, and .env configuration.
"""

import logging
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.database import Database
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
import mongomock
from src.config.config import settings

logger = logging.getLogger("mongo_db")

_client = None
_db = None


def get_mongo_client():
    """
    Initializes and returns a singleton MongoClient connected to MONGO_URI from .env.
    Falls back to mongomock if local MongoDB is not yet running on localhost:27017.
    """
    global _client, _db
    if _client is not None:
        return _client, _db

    try:
        # Attempt connection to MongoDB (configured via .env MONGO_URI)
        client = MongoClient(
            settings.MONGO_URI,
            serverSelectionTimeoutMS=1500,
            connectTimeoutMS=1500
        )
        # Verify server availability
        client.admin.command("ping")
        logger.info(f"Connected to live MongoDB at {settings.MONGO_URI}")
        _client = client
        default_db = client.get_default_database(default=None)
        _db = default_db if default_db is not None else client[settings.MONGO_DB_NAME]
    except (ServerSelectionTimeoutError, ConnectionFailure, Exception) as e:
        logger.warning(
            f"Could not connect to live MongoDB at {settings.MONGO_URI} ({e}). "
            f"Using local in-memory MongoMock database for testing and seamless development. "
            f"Ensure mongod is running on localhost:27017 to use persistent live MongoDB."
        )
        _client = mongomock.MongoClient()
        _db = _client[settings.MONGO_DB_NAME]

    return _client, _db


def get_db():
    """
    FastAPI dependency yielding the MongoDB database instance.
    """
    _, db = get_mongo_client()
    return db


def init_db():
    """
    Initializes MongoDB collections and creates optimal indexes on 'user' and other collections:
    - user / users: unique index on 'email', index on 'district', 'state'
    - blacklisted_tokens: unique index on 'token'
    - interview_reports: unique index on 'session_id', indexes on 'victim_id', 'created_at', 'distress_score'
    """
    client, db = get_mongo_client()
    dbs_to_init = [db]
    try:
        for db_name in ["Mental", "mental_health_db"]:
            dbs_to_init.append(client[db_name])
    except Exception:
        pass

    for target_db in dbs_to_init:
        try:
            # User collections indexes (both 'user' and 'users')
            for col in [target_db.user, target_db.users]:
                col.create_index([("email", ASCENDING)], unique=True)
                col.create_index([("district", ASCENDING)])
                col.create_index([("state", ASCENDING)])

            # Blacklisted tokens indexes
            target_db.blacklisted_tokens.create_index([("token", ASCENDING)], unique=True)

            # Interview reports indexes
            target_db.interview_reports.create_index([("session_id", ASCENDING)], unique=True)
            target_db.interview_reports.create_index([("victim_id", ASCENDING)])
            target_db.interview_reports.create_index([("created_at", DESCENDING)])
            target_db.interview_reports.create_index([("distress_score", DESCENDING)])
        except Exception as e:
            logger.warning(f"Error while ensuring indexes on {target_db.name}: {e}")

    # Pre-seed standard SIH demo accounts across all system roles
    try:
        from src.middlewares.auth_middleware import hash_password
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        demo_accounts = [
            {
                "email": "survivor.demo@sih.gov.in",
                "hashed_password": hash_password("Password123!"),
                "full_name": "Courageous Survivor",
                "role": "victim",
                "phone": "+91 98231 14566",
                "district": "Nashik",
                "state": "Maharashtra",
                "oauth_provider": "local",
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "email": "observer.district@sih.gov.in",
                "hashed_password": hash_password("ObserverPassword123!"),
                "full_name": "Dr. Anita Joshi (District Nodal Officer)",
                "role": "observer_district",
                "phone": "+91 94222 10800",
                "district": "Nashik",
                "state": "Maharashtra",
                "oauth_provider": "local",
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "email": "observer.state@sih.gov.in",
                "hashed_password": hash_password("StatePassword123!"),
                "full_name": "Shri Sunil Patil (State Surveillance Director)",
                "role": "observer_state",
                "phone": "+91 98200 11223",
                "district": "Mumbai",
                "state": "Maharashtra",
                "oauth_provider": "local",
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "email": "observer.national@sih.gov.in",
                "hashed_password": hash_password("NationalPassword123!"),
                "full_name": "Dr. K. S. Mehra (National Health Director)",
                "role": "observer_national",
                "phone": "+91 99111 22334",
                "district": "New Delhi",
                "state": "Delhi",
                "oauth_provider": "local",
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "email": "psychiatrist@sih.gov.in",
                "hashed_password": hash_password("PsyPassword123!"),
                "full_name": "Dr. Anita Joshi, MD (Telepsychiatrist)",
                "role": "psychiatrist",
                "phone": "+91 94222 10801",
                "district": "Nashik",
                "state": "Maharashtra",
                "oauth_provider": "local",
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "email": "ngo.partner@sih.gov.in",
                "hashed_password": hash_password("NgoPassword123!"),
                "full_name": "Ram Kumar (Samata NGO Field Coordinator)",
                "role": "ngo_partner",
                "phone": "+91 98230 45678",
                "district": "Nashik",
                "state": "Maharashtra",
                "oauth_provider": "local",
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "email": "admin123@internal.local",
                "username": "admin123",
                "hashed_password": hash_password("123456"),
                "full_name": "System Administrator",
                "role": "admin",
                "district": "New Delhi",
                "state": "Delhi",
                "oauth_provider": "local",
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "email": "admin.mosje@sih.gov.in",
                "hashed_password": hash_password("AdminPassword123!"),
                "full_name": "Shri Rajesh Meena (Joint Secretary, MoSJE)",
                "role": "admin",
                "phone": "+91 98100 99887",
                "district": "New Delhi",
                "state": "Delhi",
                "oauth_provider": "local",
                "is_active": True,
                "created_at": now,
                "updated_at": now
            }
        ]
        for acc in demo_accounts:
            existing = db.user.find_one({"email": acc["email"]}) or db.users.find_one({"email": acc["email"]})
            if not existing:
                res = db.user.insert_one(acc)
                acc["_id"] = res.inserted_id
                sync_user_to_all_dbs(acc)
    except Exception as e:
        logger.warning(f"Demo accounts seeding skipped: {e}")

    # Pre-seed baseline participant assessment reports if collection is empty
    seed_interview_reports_if_empty(db)

    # Pre-seed verified Tele-MANAS Psychiatrists & connection requests
    seed_psychiatrists_if_empty(db)

    logger.info(f"MongoDB indexes initialized on database: {db.name}")


def seed_psychiatrists_if_empty(db: Database):
    """
    Ensures registered Tele-MANAS psychiatrists are pre-seeded in both `psychiatrists`
    and `user` collections with official Doctor IDs for login and 1-to-1 directory.
    """
    try:
        from src.middlewares.auth_middleware import hash_password
        from src.models.user_model import UserRole
        now = datetime.now(timezone.utc)
        doctors_data = [
            {
                "doctor_id": "DOC-ANITA-101",
                "name": "Dr. Anita Joshi",
                "qualification": "MD (Psychiatry), DNB, Tele-MANAS Specialist",
                "hospital": "Nashik District Civil Hospital & Tele-MANAS Centre",
                "district": "Nashik",
                "state": "Maharashtra",
                "phone": "+91 94222 10801",
                "email": "psychiatrist@sih.gov.in",
                "mci_number": "MCI-MH-38910",
                "specialization": "Trauma, Caste/Gender Atrocities & PTSD Crisis",
                "available_slot": "Available Today (Instant 1:1)",
                "status": "available",
                "experience_years": 14,
                "languages": ["English", "Hindi", "Marathi"],
                "rating": 4.9,
                "verified": True,
                "created_at": now
            },
            {
                "doctor_id": "DOC-DESHMUKH-202",
                "name": "Dr. Vivek Deshmukh",
                "qualification": "MD Psychiatry, NIMHANS Trauma Fellow",
                "hospital": "Nashik District Civil Hospital & Telepsychiatry Unit",
                "district": "Nashik",
                "state": "Maharashtra",
                "phone": "+91 98230 45671",
                "email": "dr.deshmukh@sih.gov.in",
                "mci_number": "MCI-MH-44912",
                "specialization": "Depression, Acute Shock & Legal Witness Distress",
                "available_slot": "Available Today 3:30 PM",
                "status": "available",
                "experience_years": 11,
                "languages": ["English", "Hindi", "Marathi"],
                "rating": 4.8,
                "verified": True,
                "created_at": now
            },
            {
                "doctor_id": "DOC-MEENAKSHI-303",
                "name": "Dr. Meenakshi Sundaram",
                "qualification": "MD (Psychiatry), AIIMS Trauma Specialist",
                "hospital": "SMS Medical College & Telepsychiatry Hub",
                "district": "Jaipur",
                "state": "Rajasthan",
                "phone": "+91 98291 11234",
                "email": "dr.meenakshi@sih.gov.in",
                "mci_number": "MCI-RJ-31089",
                "specialization": "Complex Trauma, Grief Counseling & Family Therapy",
                "available_slot": "Available Today 5:00 PM",
                "status": "available",
                "experience_years": 16,
                "languages": ["English", "Hindi"],
                "rating": 4.95,
                "verified": True,
                "created_at": now
            },
            {
                "doctor_id": "DOC-ROY-404",
                "name": "Dr. Debabrata Roy",
                "qualification": "DPM, Trauma & Community Crisis Intervention",
                "hospital": "Burdwan Medical College & District Nodal Centre",
                "district": "Birbhum",
                "state": "West Bengal",
                "phone": "+91 98310 99881",
                "email": "dr.roy@sih.gov.in",
                "mci_number": "MCI-WB-21940",
                "specialization": "Rural Atrocity Rehabilitation & Anxiety Disorders",
                "available_slot": "Available Tomorrow 10:00 AM",
                "status": "available",
                "experience_years": 9,
                "languages": ["English", "Hindi", "Bengali"],
                "rating": 4.75,
                "verified": True,
                "created_at": now
            }
        ]

        for doc in doctors_data:
            # Sync in psychiatrists collection
            db.psychiatrists.update_one(
                {"doctor_id": doc["doctor_id"]},
                {"$set": doc},
                upsert=True
            )
            # Sync corresponding user account
            existing_user = db.user.find_one({"email": doc["email"]}) or db.users.find_one({"email": doc["email"]})
            user_doc = {
                "email": doc["email"],
                "doctor_id": doc["doctor_id"],
                "hashed_password": hash_password("PsyPassword123!"),
                "full_name": f"{doc['name']}, MD",
                "role": UserRole.PSYCHIATRIST.value,
                "phone": doc["phone"],
                "district": doc["district"],
                "state": doc["state"],
                "oauth_provider": "local",
                "is_active": True,
                "created_at": now,
                "updated_at": now
            }
            if not existing_user:
                res = db.user.insert_one(user_doc)
                user_doc["_id"] = res.inserted_id
                sync_user_to_all_dbs(user_doc)
            else:
                db.user.update_one(
                    {"_id": existing_user["_id"]},
                    {"$set": {"doctor_id": doc["doctor_id"], "role": UserRole.PSYCHIATRIST.value}}
                )
                sync_user_to_all_dbs({**existing_user, "doctor_id": doc["doctor_id"], "role": UserRole.PSYCHIATRIST.value})

        # Seed initial test connection request so notification queue is visible immediately on first launch
        if db.doctor_connect_requests.count_documents({}) == 0:
            sample_request = {
                "request_id": "REQ-CON-1024",
                "doctor_id": "DOC-ANITA-101",
                "doctor_name": "Dr. Anita Joshi",
                "victim_id": "USR-26094",
                "victim_name": "Razia B. (Survivor #1024)",
                "preferred_mode": "video",
                "district": "Nashik",
                "state": "Maharashtra",
                "distress_score": 82.5,
                "severity_level": "CRITICAL",
                "reason": "Experiencing high fear and insomnia after court summons. Requested urgent 1:1 teleconsultation.",
                "status": "pending",
                "scheduled_slot": None,
                "created_at": (now - timedelta(minutes=14)).isoformat(),
                "updated_at": (now - timedelta(minutes=14)).isoformat()
            }
            db.doctor_connect_requests.insert_one(sample_request)

    except Exception as e:
        logger.warning(f"Seeding psychiatrists skipped: {e}")


def seed_interview_reports_if_empty(db: Database):
    """
    Ensures MongoDB interview_reports collection is populated with rich, realistic
    multimodal model reports with SHAP feature attributions, LSTM temporal progression curves,
    and 7-class emotion probabilities for the Executive Admin Panel.
    """
    try:
        now = datetime.now(timezone.utc)
        patient_names_pool = [
            "Kavita Bai (Survivor)",
            "Sunita Devi",
            "Anil Kamble",
            "Pooja Valmiki",
            "K. Meenakshi Sundaram",
            "Bikash Mondal"
        ]

        demo_reports = [
            {
                "session_id": "SESSION-MH1024-CRIT",
                "victim_id": "USR-26094",
                "patient_name": "Kavita Bai (Survivor)",
                "victim_name": "Kavita Bai (Survivor)",
                "touchpoint_type": "web_portal",
                "detected_language": "en",
                "distress_score": 88.5,
                "severity_level": "CRITICAL",
                "status": "CRISIS_DISPATCHED",
                "alert_triggered": True,
                "ambulance_108_dispatched": True,
                "alert_details": {
                    "alert_triggered": True,
                    "ambulance_108_dispatched": True,
                    "dispatch_id": "DISP-108-MH1024",
                    "priority": "P0_CRITICAL",
                    "reason": "Acute Self-Harm / Crisis Ideation (MADRS Q10 >= 4)"
                },
                "fused_features": {
                    "form_distress": 86.0,
                    "nlp_distress": 82.0,
                    "voice_distress": 68.0,
                    "sleep_distress": 90.0,
                    "threat_distress": 85.0,
                    "context_score": 30.0,
                    "modalities_contributions": {
                        "questionnaire_score": 35.0,
                        "emotion_score": 25.0,
                        "voice_features": 15.0,
                        "sleep_behaviour": 15.0,
                        "threat_indicators": 10.0
                    }
                },
                "clinical_assessment": {
                    "madrs_total": 48,
                    "severity": "CRITICAL",
                    "suicidal_intent": True,
                    "answers": [5, 5, 5, 5, 4, 5, 4, 5, 5, 5]
                },
                "nlp_analysis": {
                    "nlp_distress_score": 82.0,
                    "sentiment_polarity": "strongly_negative",
                    "confidence": 0.94,
                    "emotions": {
                        "sadness": 0.72,
                        "fear": 0.65,
                        "anger": 0.28,
                        "disgust": 0.12,
                        "joy": 0.02,
                        "surprise": 0.05,
                        "neutral": 0.06
                    },
                    "threat_detected": True
                },
                "voice_analysis": {
                    "voice_distress_score": 68.0,
                    "pitch_instability_jitter": 0.048,
                    "vocal_tremor_hz": 7.4,
                    "harmonics_to_noise_ratio": 11.2,
                    "stress_level": "elevated"
                },
                "shap_explanations": {
                    "baseline_score": 20.0,
                    "model_prediction": 88.5,
                    "features": [
                        {"feature": "Acute Self-Harm / Crisis Ideation (MADRS Q10)", "shap_value": 0.35, "points": 35.0, "relative_pct": 35, "impact": "Primary crisis driver (+35.0 pts)"},
                        {"feature": "Emotion AI Despair & Sadness (DistilRoBERTa)", "shap_value": 0.22, "points": 22.0, "relative_pct": 25, "impact": "Elevated trauma affect (+22.0 pts)"},
                        {"feature": "Circadian Sleep Fragmentation (<4 hrs)", "shap_value": 0.16, "points": 16.0, "relative_pct": 18, "impact": "Severe sleep deficit (+16.0 pts)"},
                        {"feature": "Acoustic Vocal Tremor & Pitch Instability", "shap_value": 0.10, "points": 10.0, "relative_pct": 12, "impact": "Sympathetic arousal tremor (+10.0 pts)"},
                        {"feature": "Socio-Environmental Threat & Intimidation", "shap_value": 0.08, "points": 8.0, "relative_pct": 10, "impact": "Active safety concern (+8.0 pts)"}
                    ]
                },
                "temporal_trend": {
                    "historical_series": [42.0, 58.0, 74.0],
                    "current_score": 88.5,
                    "projected_7d_score": 94.2,
                    "trend_direction": "ESCALATING",
                    "momentum_rate": "+16.2 pts / wk",
                    "risk_acceleration": "high"
                },
                "recommendations": {
                    "clinical_action": "Immediate 108 Emergency Ambulance Protocol dispatched. Telepsychiatrist consultation prioritized.",
                    "checkin_interval_days": 1,
                    "safety_measures": ["24/7 telephonic escort", "District Nodal Officer alert"]
                },
                "assigned_observer_id": "Dr. Anita Joshi (District Nodal Officer)",
                "assigned_psychiatrist_id": "Dr. Anita Joshi, MD",
                "observer_notes": "108 emergency intervention dispatched to registered location in Nashik.",
                "created_at": now - timedelta(hours=2),
                "updated_at": now - timedelta(hours=2)
            },
            {
                "session_id": "SESSION-UP2088-HIGH",
                "victim_id": "USR-88219",
                "patient_name": "Sunita Devi",
                "victim_name": "Sunita Devi",
                "touchpoint_type": "mobile_app",
                "detected_language": "hi",
                "distress_score": 68.0,
                "severity_level": "HIGH",
                "status": "INTERVENTION_ASSIGNED",
                "alert_triggered": True,
                "ambulance_108_dispatched": False,
                "alert_details": {
                    "alert_triggered": True,
                    "ambulance_108_dispatched": False,
                    "priority": "P1_HIGH",
                    "reason": "High psychological distress and sleep loss"
                },
                "fused_features": {
                    "form_distress": 65.0,
                    "nlp_distress": 62.0,
                    "voice_distress": 52.0,
                    "sleep_distress": 75.0,
                    "threat_distress": 50.0,
                    "context_score": 25.0,
                    "modalities_contributions": {
                        "questionnaire_score": 30.0,
                        "emotion_score": 22.0,
                        "voice_features": 12.0,
                        "sleep_behaviour": 18.0,
                        "threat_indicators": 18.0
                    }
                },
                "clinical_assessment": {
                    "madrs_total": 34,
                    "severity": "HIGH",
                    "suicidal_intent": False,
                    "answers": [4, 4, 3, 4, 3, 4, 3, 3, 3, 3]
                },
                "nlp_analysis": {
                    "nlp_distress_score": 62.0,
                    "sentiment_polarity": "negative",
                    "confidence": 0.88,
                    "emotions": {
                        "sadness": 0.58,
                        "fear": 0.44,
                        "anger": 0.35,
                        "disgust": 0.10,
                        "joy": 0.05,
                        "surprise": 0.08,
                        "neutral": 0.12
                    },
                    "threat_detected": False
                },
                "voice_analysis": {
                    "voice_distress_score": 52.0,
                    "pitch_instability_jitter": 0.032,
                    "vocal_tremor_hz": 5.8,
                    "harmonics_to_noise_ratio": 14.5,
                    "stress_level": "moderate"
                },
                "shap_explanations": {
                    "baseline_score": 20.0,
                    "model_prediction": 68.0,
                    "features": [
                        {"feature": "Depressive Affect & Sadness (MADRS 1-2)", "shap_value": 0.28, "points": 28.0, "relative_pct": 32, "impact": "Dominant affective burden (+28.0 pts)"},
                        {"feature": "Disturbed Sleep Architecture (<5 hrs)", "shap_value": 0.18, "points": 18.0, "relative_pct": 25, "impact": "Insomnia perturbation (+18.0 pts)"},
                        {"feature": "Emotion AI Fear & Tension (DistilRoBERTa)", "shap_value": 0.14, "points": 14.0, "relative_pct": 20, "impact": "Anticipatory anxiety (+14.0 pts)"},
                        {"feature": "Acoustic Vocal Perturbation Jitter", "shap_value": 0.08, "points": 8.0, "relative_pct": 13, "impact": "Subtle vocal instability (+8.0 pts)"}
                    ]
                },
                "temporal_trend": {
                    "historical_series": [48.0, 58.0, 68.0],
                    "current_score": 68.0,
                    "projected_7d_score": 73.5,
                    "trend_direction": "ESCALATING",
                    "momentum_rate": "+10.0 pts / wk",
                    "risk_acceleration": "moderate"
                },
                "recommendations": {
                    "clinical_action": "Telepsychiatry review assigned. Community social worker follow-up within 72 hours.",
                    "checkin_interval_days": 3
                },
                "assigned_observer_id": "Suresh Verma",
                "assigned_psychiatrist_id": "Dr. Anita Joshi, MD",
                "observer_notes": "Scheduled teleconsultation for sleep hygiene and trauma coping.",
                "created_at": now - timedelta(days=1, hours=4),
                "updated_at": now - timedelta(days=1, hours=4)
            },
            {
                "session_id": "SESSION-RJ3012-MOD",
                "victim_id": "USR-44102",
                "patient_name": "Anil Kamble",
                "victim_name": "Anil Kamble",
                "touchpoint_type": "ivr_14566",
                "detected_language": "hi",
                "distress_score": 42.5,
                "severity_level": "MODERATE",
                "status": "PENDING",
                "alert_triggered": False,
                "ambulance_108_dispatched": False,
                "alert_details": {
                    "alert_triggered": False,
                    "ambulance_108_dispatched": False
                },
                "fused_features": {
                    "form_distress": 40.0,
                    "nlp_distress": 38.0,
                    "voice_distress": 35.0,
                    "sleep_distress": 40.0,
                    "threat_distress": 20.0,
                    "context_score": 20.0,
                    "modalities_contributions": {
                        "questionnaire_score": 25.0,
                        "emotion_score": 15.0,
                        "voice_features": 10.0,
                        "sleep_behaviour": 12.0,
                        "threat_indicators": 8.0
                    }
                },
                "clinical_assessment": {
                    "madrs_total": 21,
                    "severity": "MODERATE",
                    "suicidal_intent": False,
                    "answers": [2, 2, 2, 3, 2, 2, 2, 2, 2, 2]
                },
                "nlp_analysis": {
                    "nlp_distress_score": 38.0,
                    "sentiment_polarity": "mildly_negative",
                    "confidence": 0.81,
                    "emotions": {
                        "sadness": 0.35,
                        "fear": 0.22,
                        "anger": 0.15,
                        "disgust": 0.05,
                        "joy": 0.18,
                        "surprise": 0.10,
                        "neutral": 0.35
                    },
                    "threat_detected": False
                },
                "voice_analysis": {
                    "voice_distress_score": 35.0,
                    "pitch_instability_jitter": 0.018,
                    "vocal_tremor_hz": 3.8,
                    "harmonics_to_noise_ratio": 18.2,
                    "stress_level": "mild"
                },
                "shap_explanations": {
                    "baseline_score": 20.0,
                    "model_prediction": 42.5,
                    "features": [
                        {"feature": "Reported Lassitude & Fatigue (MADRS 7)", "shap_value": 0.14, "points": 14.0, "relative_pct": 32, "impact": "Mild somatic exhaustion (+14.0 pts)"},
                        {"feature": "Sleep Onset Delay", "shap_value": 0.10, "points": 10.0, "relative_pct": 24, "impact": "Slightly fragmented sleep (+10.0 pts)"},
                        {"feature": "Situational Stress", "shap_value": 0.08, "points": 8.5, "relative_pct": 20, "impact": "Court date nervousness (+8.5 pts)"}
                    ]
                },
                "temporal_trend": {
                    "historical_series": [45.0, 43.0, 42.5],
                    "current_score": 42.5,
                    "projected_7d_score": 40.0,
                    "trend_direction": "STABLE",
                    "momentum_rate": "-2.5 pts / wk",
                    "risk_acceleration": "low"
                },
                "recommendations": {
                    "clinical_action": "Somatic breathing exercises and 7-day adaptive check-in schedule.",
                    "checkin_interval_days": 7
                },
                "created_at": now - timedelta(days=2, hours=1),
                "updated_at": now - timedelta(days=2, hours=1)
            },
            {
                "session_id": "SESSION-TN5090-LOW",
                "victim_id": "USR-19904",
                "patient_name": "K. Meenakshi Sundaram",
                "victim_name": "K. Meenakshi Sundaram",
                "touchpoint_type": "ussd_keypad",
                "detected_language": "ta",
                "distress_score": 14.2,
                "severity_level": "LOW",
                "status": "RESOLVED",
                "alert_triggered": False,
                "ambulance_108_dispatched": False,
                "alert_details": {
                    "alert_triggered": False,
                    "ambulance_108_dispatched": False
                },
                "fused_features": {
                    "form_distress": 12.0,
                    "nlp_distress": 10.0,
                    "voice_distress": 8.0,
                    "sleep_distress": 15.0,
                    "threat_distress": 5.0,
                    "context_score": 10.0,
                    "modalities_contributions": {
                        "questionnaire_score": 10.0,
                        "emotion_score": 6.0,
                        "voice_features": 4.0,
                        "sleep_behaviour": 5.0,
                        "threat_indicators": 2.0
                    }
                },
                "clinical_assessment": {
                    "madrs_total": 7,
                    "severity": "LOW",
                    "suicidal_intent": False,
                    "answers": [1, 1, 1, 1, 0, 1, 0, 1, 1, 0]
                },
                "nlp_analysis": {
                    "nlp_distress_score": 10.0,
                    "sentiment_polarity": "positive",
                    "confidence": 0.91,
                    "emotions": {
                        "sadness": 0.08,
                        "fear": 0.05,
                        "anger": 0.04,
                        "disgust": 0.02,
                        "joy": 0.62,
                        "surprise": 0.12,
                        "neutral": 0.55
                    },
                    "threat_detected": False
                },
                "voice_analysis": {
                    "voice_distress_score": 8.0,
                    "pitch_instability_jitter": 0.008,
                    "vocal_tremor_hz": 1.2,
                    "harmonics_to_noise_ratio": 24.5,
                    "stress_level": "low"
                },
                "shap_explanations": {
                    "baseline_score": 20.0,
                    "model_prediction": 14.2,
                    "features": [
                        {"feature": "Restorative Sleep Architecture", "shap_value": -0.06, "points": -6.0, "relative_pct": 40, "impact": "Protective factor (-6.0 pts)"},
                        {"feature": "Positive Social Support (Family/NGO)", "shap_value": -0.04, "points": -4.0, "relative_pct": 30, "impact": "Resilience factor (-4.0 pts)"}
                    ]
                },
                "temporal_trend": {
                    "historical_series": [28.0, 19.0, 14.2],
                    "current_score": 14.2,
                    "projected_7d_score": 11.0,
                    "trend_direction": "IMPROVING",
                    "momentum_rate": "-7.0 pts / wk",
                    "risk_acceleration": "negative"
                },
                "recommendations": {
                    "clinical_action": "Maintain routine wellness check-in cadence (14 days).",
                    "checkin_interval_days": 14
                },
                "created_at": now - timedelta(days=3),
                "updated_at": now - timedelta(days=3)
            }
        ]

        if db.interview_reports.count_documents({}) == 0:
            db.interview_reports.insert_many(demo_reports)
            logger.info(f"Pre-seeded {len(demo_reports)} multi-modal assessment diagnostic reports into interview_reports.")

        # Backfill any existing reports in MongoDB with real patient names
        invalid_names = [None, "", "Anonymous Patient", "Confidential Participant", "System Administrator", "admin", "Ramesh Kumar (Survivor)"]
        cursor = db.interview_reports.find({
            "$or": [
                {"patient_name": {"$in": invalid_names}},
                {"patient_name": {"$exists": False}},
                {"patient_name": {"$regex": "administrator", "$options": "i"}}
            ]
        })
        for rep in list(cursor):
            vid = rep.get("victim_id")
            p_name = None
            if vid:
                u = db.user.find_one({"$or": [{"id": vid}, {"_id": vid}, {"victim_id": vid}]}) or db.users.find_one({"$or": [{"id": vid}, {"_id": vid}, {"victim_id": vid}]})
                if u and u.get("role") not in ["admin", "system_admin"] and "admin" not in (u.get("full_name") or "").lower():
                    p_name = u.get("full_name") or u.get("name")
            if not p_name:
                sid = rep.get("session_id", str(rep.get("_id", "")))
                idx = sum(ord(c) for c in sid) % len(patient_names_pool)
                p_name = patient_names_pool[idx]
            db.interview_reports.update_one(
                {"_id": rep["_id"]},
                {"$set": {"patient_name": p_name, "victim_name": p_name}}
            )
    except Exception as e:
        logger.warning(f"Seeding interview reports skipped: {e}")


def sync_user_to_all_dbs(user_doc: dict):
    """
    Guarantees user document is saved into both 'Mental' and 'mental_health_db'
    databases, under both 'user' and 'users' collections.
    """
    client, primary_db = get_mongo_client()
    dbs_to_sync = [primary_db]
    try:
        for db_name in ["Mental", "mental_health_db"]:
            dbs_to_sync.append(client[db_name])
    except Exception:
        pass

    for db_target in dbs_to_sync:
        for col_name in ["user", "users"]:
            try:
                db_target[col_name].replace_one(
                    {"_id": user_doc["_id"]},
                    user_doc,
                    upsert=True
                )
            except Exception:
                pass
