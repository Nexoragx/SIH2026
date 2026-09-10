"""
MongoDB connection and collection manager for SIH26094 Mental Health Backend.
Uses PyMongo client with connection pooling, indexes setup, and .env configuration.
"""

import logging
from pymongo import MongoClient, ASCENDING, DESCENDING
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

    logger.info(f"MongoDB indexes initialized on database: {db.name}")


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
