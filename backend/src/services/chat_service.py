"""
Empathetic Chatbot Service for ANVAYA (SIH26094).
Provides gentle, non-clinical companionship and strict safety keyword triggers.
"""

import re
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from pymongo.database import Database

CRISIS_KEYWORDS = [
    r"\bsuicide\b",
    r"\bkill myself\b",
    r"\bend my life\b",
    r"\bwant to die\b",
    r"\bself[- ]?harm\b",
    r"\bcut myself\b",
    r"\bhang myself\b",
    r"\bjana chahta hu\b",
    r"\bmar jaunga\b",
    r"\bkhatam karna\b",
    r"\battack\b",
    r"\bviolent\b",
    r"\bviolence\b",
    r"\bforced\b",
    r"\bunsafe\b",
    r"\bthey are outside\b",
    r"\bthreatening me\b"
]

COMPILED_CRISIS_REGEX = [re.compile(pattern, re.IGNORECASE) for pattern in CRISIS_KEYWORDS]

EMPATHIC_RESPONSES = [
    "Thank you for sharing this with me. I hear how heavy this feels right now. You don't have to carry it alone.",
    "I'm sorry things have felt difficult. Would you like to take a slow, gentle breath together or talk a little more?",
    "It takes courage to notice how you are feeling. Whatever you're going through, your safety and peace matter.",
    "I'm here with you. Take things one moment at a time. Is there something small that brought you a moment of comfort today?",
    "Thank you for trusting me with your thoughts. Remember that gentle support is always available whenever you are ready."
]


class ChatService:

    @classmethod
    def process_message(
        cls,
        message: str,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        language: str = "en",
        db: Optional[Database] = None
    ) -> Dict[str, Any]:
        """
        Processes chat message, checks for safety concerns, logs interaction,
        and returns non-clinical supportive reply.
        """
        clean_text = message.strip()
        crisis_detected = any(regex.search(clean_text) for regex in COMPILED_CRISIS_REGEX)

        now = datetime.now(timezone.utc)
        resolved_session_id = session_id or f"CHAT-{uuid.uuid4().hex[:8].upper()}"

        if crisis_detected:
            # Create a high priority alert in database
            if db is not None:
                try:
                    db.alerts.insert_one({
                        "alert_id": f"ALT-{uuid.uuid4().hex[:6].upper()}",
                        "case_id": user_id or "ANONYMOUS",
                        "category": "CRISIS",
                        "priority": "P0_CRITICAL",
                        "reason": f"Safety concern detected in support chat: {clean_text[:120]}...",
                        "status": "OPEN",
                        "source": "CHATBOT_SAFETY_FILTER",
                        "created_at": now
                    })
                except Exception:
                    pass

            reply = (
                "You are not alone. Thank you for telling me. Your life and safety matter deeply. "
                "I am pausing our conversation so you can connect directly with caring support right now."
            )

            return {
                "session_id": resolved_session_id,
                "reply": reply,
                "crisis_flag": True,
                "action_required": "SHOW_CRISIS_SCREEN",
                "support_numbers": ["14566", "14416", "108"],
                "timestamp": now.isoformat()
            }

        # Select empathetic response based on message tone
        lower_msg = clean_text.lower()
        if any(w in lower_msg for w in ["sleep", "tired", "exhausted", "night"]):
            reply = "Rest can feel so elusive when our minds are carrying a lot. It's completely okay to rest quietly without forcing anything."
        elif any(w in lower_msg for w in ["alone", "nobody", "lonely"]):
            reply = "Feeling alone can be one of the hardest feelings. Please know that you are heard, and our support team is right here with you."
        elif any(w in lower_msg for w in ["scared", "fear", "anxious", "nervous"]):
            reply = "It is completely natural to feel anxious after what you've experienced. Would you like to try a short grounding exercise together?"
        else:
            # Cycle through empathetic responses
            idx = abs(hash(clean_text)) % len(EMPATHIC_RESPONSES)
            reply = EMPATHIC_RESPONSES[idx]

        # Log conversation securely if db available
        if db is not None:
            try:
                db.chat_messages.insert_one({
                    "session_id": resolved_session_id,
                    "user_id": user_id,
                    "user_message": clean_text,
                    "bot_reply": reply,
                    "crisis_flag": False,
                    "created_at": now
                })
            except Exception:
                pass

        return {
            "session_id": resolved_session_id,
            "reply": reply,
            "crisis_flag": False,
            "action_required": "CONTINUE",
            "timestamp": now.isoformat()
        }
