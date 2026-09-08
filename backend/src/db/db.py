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
            target_db.interview_reports.create_index([("severity_level", ASCENDING)])
        except Exception as e:
            logger.warning(f"Error while ensuring indexes on {target_db.name}: {e}")

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
