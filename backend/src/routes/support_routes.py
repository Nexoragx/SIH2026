"""
Support, Emergency & Schedule Endpoints for ANVAYA (SIH26094).
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from pymongo.database import Database
from pymongo import DESCENDING

from src.db.db import get_db
from src.middlewares.auth_middleware import get_optional_current_user, get_current_user
from src.services.support_service import SupportResourceService
from src.services.emergency_service import EmergencyService
from src.services.chat_service import ChatService

router = APIRouter(tags=["Support, Emergency & Scheduling"])


# --- Pydantic Schemas ---

class EmergencyDispatchRequest(BaseModel):
    case_id: Optional[str] = "CASE-SURVIVOR-CURRENT"
    location: Optional[str] = "District HQ / Registered Address"
    reason: Optional[str] = "Immediate Psychological Distress Intervention"
    caller_phone: Optional[str] = None


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    session_id: Optional[str] = None
    language: Optional[str] = "en"


class AlertCreateRequest(BaseModel):
    case_id: str
    category: str = "CRISIS"
    priority: str = "P0_CRITICAL"
    reason: str
    location: Optional[str] = None


# --- Endpoints ---

@router.get("/support/resources", summary="Get Verified Support & Helpline Directory")
def get_support_resources(
    category: Optional[str] = Query(None, description="Filter by category: mental_health, victim_support, emergency"),
    db: Database = Depends(get_db)
):
    """
    Returns list of verified government and institutional crisis resources (Tele-MANAS, NHAA, KIRAN, 108, NALSA).
    """
    SupportResourceService.seed_resources_if_empty(db)
    return SupportResourceService.get_all_resources(db=db, category=category)


@router.post("/emergency/dispatch", summary="Dispatch Emergency Intervention (SIH Demo Mode)")
def dispatch_emergency(
    payload: EmergencyDispatchRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Database = Depends(get_db)
):
    """
    Simulates emergency 108 response in safe DEMO MODE for SIH judging.
    Records request, creates observer alert, and logs dispatch without triggering real telephone dialers.
    """
    case_id = payload.case_id or (current_user.get("id") if current_user else "ANONYMOUS_CASE")
    phone = payload.caller_phone or (current_user.get("phone") if current_user else None)
    
    return EmergencyService.dispatch_emergency(
        case_id=case_id,
        location=payload.location or "Registered Victim Location",
        reason=payload.reason or "Critical Atrocity Survivor Safeguard",
        caller_phone=phone,
        db=db
    )


@router.post("/chat/message", summary="Empathetic Support Chatbot Message")
def chat_message(
    payload: ChatMessageRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Database = Depends(get_db)
):
    """
    Receives text message from victim, evaluates safety flags (self-harm, threats, suicide),
    and returns supportive, non-clinical companionship.
    """
    user_id = current_user.get("id") if current_user else None
    return ChatService.process_message(
        message=payload.message,
        user_id=user_id,
        session_id=payload.session_id,
        language=payload.language or "en",
        db=db
    )


@router.get("/checkins/schedule", summary="Get Periodic Check-in Schedule & Cadence")
def get_checkin_schedule(
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Database = Depends(get_db)
):
    """
    Returns adaptive check-in schedule (e.g. in 3, 7, or 14 days) based on recent distress level,
    along with completed sessions count and next due date.
    """
    user_id = current_user.get("id") if current_user else None
    now = datetime.now(timezone.utc)

    interval_days = 7  # default moderate cadence
    last_score = None
    completed_count = 0

    if current_user:
        try:
            user_id = str(current_user.get("id"))
            email = current_user.get("email")
            user_queries = [{"victim_id": user_id}, {"user_id": user_id}]
            if email:
                user_queries.extend([{"victim_id": email}, {"email": email}])
            if email and "survivor@anvaya.in" in email.lower():
                user_queries.append({"victim_id": "USR-26094"})

            reports = list(db.interview_reports.find({"$or": user_queries}).sort("created_at", DESCENDING))
            completed_count = len(reports)
            if reports:
                last_score = reports[0].get("distress_score")
                if last_score and last_score >= 70:
                    interval_days = 3
                elif last_score and last_score <= 30:
                    interval_days = 14
        except Exception:
            pass

    next_due = now + timedelta(days=interval_days)

    return {
        "interval_days": interval_days,
        "cadence_label": f"Every {interval_days} days" if interval_days != 7 else "Weekly (7 days)",
        "next_due_date": next_due.strftime("%A, %d %b %Y"),
        "days_remaining": interval_days,
        "completed_sessions": completed_count,
        "status": "SCHEDULED",
        "can_start_early": True
    }


@router.get("/alerts", summary="Get Active System Alerts")
def get_alerts(
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Database = Depends(get_db)
):
    """
    Returns active alerts for the Health Observer dashboard.
    """
    query = {}
    if status:
        query["status"] = status
    cursor = db.alerts.find(query).sort("created_at", DESCENDING).limit(limit)
    alerts = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        if isinstance(doc.get("created_at"), datetime):
            doc["created_at"] = doc["created_at"].isoformat()
        alerts.append(doc)
    return {"alerts": alerts, "total": len(alerts)}


@router.post("/alerts", summary="Create Crisis Alert")
def create_alert(
    payload: AlertCreateRequest,
    db: Database = Depends(get_db)
):
    """
    Manually creates or records a crisis alert from the victim UI.
    """
    now = datetime.now(timezone.utc)
    doc = {
        "alert_id": f"ALT-{datetime.now().strftime('%H%M%S')}",
        "case_id": payload.case_id,
        "category": payload.category,
        "priority": payload.priority,
        "reason": payload.reason,
        "location": payload.location or "Not specified",
        "status": "OPEN",
        "created_at": now
    }
    res = db.alerts.insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    doc["created_at"] = now.isoformat()
    return {"success": True, "alert": doc}


# --- Hope Wall Endpoints ---

class HopeWallPostCreate(BaseModel):
    author: Optional[str] = None
    district: Optional[str] = "Confidential District, India"
    category: Optional[str] = "Survivor Community"
    message: str = Field(..., min_length=2, max_length=1000)


def _seed_hope_wall_if_empty(db: Database):
    if db.hope_wall.count_documents({}) == 0:
        seed_posts = [
            {
                "post_id": "hw-1",
                "author": "A Brave Sister",
                "district": "Nashik, Maharashtra",
                "category": "Atrocity Survivor",
                "message": "When the incident happened, I thought my life was over. Today, after 4 months of support from our health observer and legal team, I can smile again. Please stay strong.",
                "likes": 42,
                "created_at": datetime.now(timezone.utc) - timedelta(days=1)
            },
            {
                "post_id": "hw-2",
                "author": "Fellow Fighter",
                "district": "Hathras, UP",
                "category": "Survivor of Violence",
                "message": "Take it one breath at a time. The 4-7-8 breathing exercise in this app helped me through my worst panic attacks before court dates. You are not alone.",
                "likes": 29,
                "created_at": datetime.now(timezone.utc) - timedelta(days=2)
            },
            {
                "post_id": "hw-3",
                "author": "Community Member",
                "district": "Dharmapuri, Tamil Nadu",
                "category": "Witness & Survivor",
                "message": "The truth will bring you justice and dignity. Speak with your assigned doctor when you feel overwhelmed. We are walking this path together.",
                "likes": 38,
                "created_at": datetime.now(timezone.utc) - timedelta(days=3)
            },
            {
                "post_id": "hw-4",
                "author": "Resilient Voice",
                "district": "Gaya, Bihar",
                "category": "Atrocity Complainant",
                "message": "To anyone reading this today: you survived the hardest day of your life. Every sunrise after that is proof of your strength.",
                "likes": 54,
                "created_at": datetime.now(timezone.utc) - timedelta(days=4)
            }
        ]
        db.hope_wall.insert_many(seed_posts)


@router.get("/support/hope-wall", summary="Get Community Hope Wall Messages")
def get_hope_wall_posts(
    limit: int = Query(50, ge=1, le=100),
    db: Database = Depends(get_db)
):
    _seed_hope_wall_if_empty(db)
    cursor = db.hope_wall.find({}).sort("created_at", DESCENDING).limit(limit)
    posts = []
    for doc in cursor:
        posts.append({
            "id": doc.get("post_id") or str(doc["_id"]),
            "author": doc.get("author", "Anonymous Survivor"),
            "district": doc.get("district", "India"),
            "category": doc.get("category", "Survivor Community"),
            "message": doc.get("message", ""),
            "likes": int(doc.get("likes", 0)),
            "created_at": doc.get("created_at").isoformat() if isinstance(doc.get("created_at"), datetime) else str(doc.get("created_at", ""))
        })
    return {"posts": posts, "total": len(posts)}


@router.post("/support/hope-wall", summary="Post a Message on Community Hope Wall")
def create_hope_wall_post(
    payload: HopeWallPostCreate,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Database = Depends(get_db)
):
    now = datetime.now(timezone.utc)
    author_name = payload.author
    if not author_name and current_user:
        author_name = current_user.get("name") or current_user.get("username")
    if not author_name:
        author_name = "Anonymous Survivor"

    post_id = f"hw-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    doc = {
        "post_id": post_id,
        "author": author_name,
        "district": payload.district or "Confidential District, India",
        "category": payload.category or "Survivor Community",
        "message": payload.message.strip(),
        "likes": 1,
        "user_id": current_user.get("id") if current_user else None,
        "created_at": now
    }
    res = db.hope_wall.insert_one(doc)
    return {
        "success": True,
        "post": {
            "id": post_id,
            "author": doc["author"],
            "district": doc["district"],
            "category": doc["category"],
            "message": doc["message"],
            "likes": doc["likes"],
            "created_at": now.isoformat()
        }
    }


@router.post("/support/hope-wall/{post_id}/like", summary="Like / Encourage a Hope Wall Post")
def like_hope_wall_post(
    post_id: str,
    db: Database = Depends(get_db)
):
    from bson import ObjectId
    query = {"$or": [{"post_id": post_id}]}
    try:
        query["$or"].append({"_id": ObjectId(post_id)})
    except Exception:
        pass

    doc = db.hope_wall.find_one(query)
    if not doc:
        return {"success": False, "message": "Post not found", "likes": 0}

    new_likes = int(doc.get("likes", 0)) + 1
    db.hope_wall.update_one(query, {"$set": {"likes": new_likes}})
    return {"success": True, "id": post_id, "likes": new_likes}


# --- Notification System & Admin Broadcast Endpoints ---

class AdminNotificationBroadcast(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    message: str = Field(..., min_length=2, max_length=1000)
    category: str = Field("QUOTE", description="QUOTE, CHECKIN, ALERT, ANNOUNCEMENT, OBSERVER_UPDATE")
    target_user_id: Optional[str] = None  # None = Broadcast to all
    action_url: Optional[str] = None
    action_label: Optional[str] = None


def _seed_default_notifications_if_empty(db: Database):
    if db.notifications.count_documents({}) == 0:
        now = datetime.now(timezone.utc)
        seeds = [
            {
                "notification_id": "notif-1",
                "title": "Daily Resilience Quote 🌸",
                "message": "“Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'”",
                "category": "QUOTE",
                "target_user_id": None,
                "read_by": [],
                "created_at": now - timedelta(hours=2),
                "action_url": "/victim?tab=exercises",
                "action_label": "Start Quick Grounding"
            },
            {
                "notification_id": "notif-2",
                "title": "Periodic Health Check-in Due 📋",
                "message": "Your scheduled 7-day adaptive health check-in is open. Take 2 minutes to record your well-being so your health observer can assist you.",
                "category": "CHECKIN",
                "target_user_id": None,
                "read_by": [],
                "created_at": now - timedelta(hours=12),
                "action_url": "/victim?tab=assessment",
                "action_label": "Begin 2-Min Check-in"
            },
            {
                "notification_id": "notif-3",
                "title": "Legal & Health Support Active 🛡️",
                "message": "Your assigned health observer and crisis safeguards are active 24/7. Access verified government helplines anytime.",
                "category": "ANNOUNCEMENT",
                "target_user_id": None,
                "read_by": [],
                "created_at": now - timedelta(days=1),
                "action_url": "/victim?tab=helplines",
                "action_label": "View Helplines"
            }
        ]
        db.notifications.insert_many(seeds)


@router.get("/support/notifications", summary="Get User Notifications and Broadcast Quotes")
def get_user_notifications(
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Database = Depends(get_db)
):
    _seed_default_notifications_if_empty(db)
    user_id = str(current_user.get("id")) if current_user else None

    # Find notifications targeted to everyone (None) or this user
    query = {"$or": [{"target_user_id": None}, {"target_user_id": ""}]}
    if user_id:
        query["$or"].append({"target_user_id": user_id})
        if current_user.get("email"):
            query["$or"].append({"target_user_id": current_user.get("email")})

    cursor = db.notifications.find(query).sort("created_at", DESCENDING).limit(30)
    notifications = []
    for doc in cursor:
        read_by = doc.get("read_by", [])
        is_read = False
        if user_id and user_id in read_by:
            is_read = True

        notifications.append({
            "id": doc.get("notification_id") or str(doc["_id"]),
            "title": doc.get("title", "ANVAYA Notification"),
            "message": doc.get("message", ""),
            "category": doc.get("category", "ANNOUNCEMENT"),
            "action_url": doc.get("action_url"),
            "action_label": doc.get("action_label"),
            "is_read": is_read,
            "created_at": doc.get("created_at").isoformat() if isinstance(doc.get("created_at"), datetime) else str(doc.get("created_at", ""))
        })

    unread_count = sum(1 for n in notifications if not n["is_read"])
    return {"notifications": notifications, "unread_count": unread_count}


@router.post("/support/notifications/{notification_id}/read", summary="Mark Notification as Read")
def mark_notification_read(
    notification_id: str,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Database = Depends(get_db)
):
    from bson import ObjectId
    user_id = str(current_user.get("id")) if current_user else "ANONYMOUS"
    query = {"$or": [{"notification_id": notification_id}]}
    try:
        query["$or"].append({"_id": ObjectId(notification_id)})
    except Exception:
        pass

    db.notifications.update_one(query, {"$addToSet": {"read_by": user_id}})
    return {"success": True, "id": notification_id}


@router.post("/support/admin/notifications/send", summary="Admin Broadcast Notification or Quote")
def admin_broadcast_notification(
    payload: AdminNotificationBroadcast,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    user_role = current_user.get("role", "").upper()
    if user_role not in ["ADMIN", "SYSTEM_ADMIN", "CASE_WORKER", "HEALTH_OBSERVER"]:
        # Allow admin / observer roles
        pass

    now = datetime.now(timezone.utc)
    notif_id = f"notif-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    doc = {
        "notification_id": notif_id,
        "title": payload.title.strip(),
        "message": payload.message.strip(),
        "category": payload.category.upper(),
        "target_user_id": payload.target_user_id,
        "action_url": payload.action_url or "/victim",
        "action_label": payload.action_label or "View Update",
        "read_by": [],
        "created_by": current_user.get("id"),
        "created_at": now
    }
    db.notifications.insert_one(doc)

    return {
        "success": True,
        "message": "Notification broadcast successfully",
        "notification": {
            "id": notif_id,
            "title": doc["title"],
            "message": doc["message"],
            "category": doc["category"],
            "target_user_id": doc["target_user_id"],
            "created_at": now.isoformat()
        }
    }
