"""
Empathetic Chatbot Service for ANVAYA (SIH26094).
Integrates the NVIDIA NIM hosted openai/gpt-oss-20b model as ANVAYA Saathi:
a pure-hearted, compassionate companion providing comfort, soothing quotes,
hope, and gentle guidance, while strictly upholding safety crisis triggers.
"""

import re
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from pymongo.database import Database
from openai import OpenAI

logger = logging.getLogger(__name__)

# Direct NVIDIA NIM Configuration as requested
NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"
NVIDIA_API_KEY = "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"
NVIDIA_MODEL = "openai/gpt-oss-20b"

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

EMPATHIC_FALLBACKS = [
    "I hear how heavy things feel right now, and I want you to know you don't have to carry this alone. 'Even the darkest night will pass and the sun will rise.' Take a slow, gentle breath—I am right here with you.",
    "Thank you for sharing your heart with me. 'Peace comes from within, one breath at a time.' Whatever you are facing, please be kind to yourself today. You are stronger and more cherished than you know.",
    "I hear you, and your feelings are completely valid. 'In the middle of difficulty lies the strength you did not know you possessed.' Let's take things one quiet step at a time.",
    "You are not alone in this journey. 'Courage doesn’t always roar; sometimes courage is the quiet voice at the end of the day saying, I will try again tomorrow.' I am here to listen whenever you need.",
    "Take a gentle pause and let the tension in your shoulders melt away. You have survived every hard day so far, and you have the strength to heal. How can I best support you in this moment?"
]

SYSTEM_PROMPT = (
    "You are ANVAYA Saathi (अन्वय साथी), a pure-hearted, gentle, and deeply compassionate emotional support "
    "companion designed to support individuals going through psychological stress, trauma, loneliness, or emotional pain. "
    "\n"
    "Your core principles:\n"
    "1. Pure Compassion: Console the user with unconditional warmth, deep empathy, and genuine kindness.\n"
    "2. Soothing Hope & Motivation: Offer gentle, calming thoughts, brief motivational quotes, or words of wisdom "
    "to calm their racing mind and restore hope and self-worth.\n"
    "3. Sincere Answers: Answer questions with total honesty, warmth, and care.\n"
    "4. Concise & Non-Overwhelming: Keep responses brief (2 to 4 gentle sentences or a small paragraph) so the user "
    "never feels overwhelmed by large blocks of text.\n"
    "5. Language Harmony: If the user speaks in Hindi, Bengali, Tamil, Telugu, Marathi, or another Indian language, "
    "respond warmly in that same language. Otherwise, speak in warm, comforting English.\n"
    "6. Safe Space: Remind them gently of their innate strength and that they are safe and heard."
)


class ChatService:
    _client: Optional[OpenAI] = None

    @classmethod
    def get_openai_client(cls) -> OpenAI:
        if cls._client is None:
            cls._client = OpenAI(
                base_url=NVIDIA_BASE_URL,
                api_key=NVIDIA_API_KEY,
                timeout=50.0
            )
        return cls._client

    @classmethod
    def _fetch_conversation_history(
        cls,
        session_id: str,
        db: Optional[Database],
        limit: int = 4
    ) -> List[Dict[str, str]]:
        """
        Retrieves recent turns of conversation to provide multi-turn context.
        """
        if db is None or not session_id:
            return []

        try:
            records = list(
                db.chat_messages.find({"session_id": session_id})
                .sort("created_at", -1)
                .limit(limit)
            )
            records.reverse()
            history = []
            for rec in records:
                user_text = rec.get("user_message")
                bot_text = rec.get("bot_reply")
                if user_text:
                    history.append({"role": "user", "content": user_text})
                if bot_text:
                    history.append({"role": "assistant", "content": bot_text})
            return history
        except Exception as e:
            logger.warning(f"Error fetching chat history: {e}")
            return []

    @classmethod
    def _generate_ai_reply(
        cls,
        message: str,
        session_id: str,
        language: str = "en",
        db: Optional[Database] = None
    ) -> str:
        """
        Calls NVIDIA NIM openai/gpt-oss-20b with context and returns consoling response.
        Falls back smoothly if the endpoint times out or errors.
        """
        history = cls._fetch_conversation_history(session_id, db, limit=4)

        sys_content = SYSTEM_PROMPT
        if language and language not in ["en", "en-IN"]:
            lang_names = {
                "hi": "Hindi",
                "bn": "Bengali",
                "ta": "Tamil",
                "te": "Telugu",
                "mr": "Marathi"
            }
            target_lang = lang_names.get(language, language)
            sys_content += f"\nNote: The user prefers {target_lang}. Please reply in soothing, comforting {target_lang}."

        messages = [{"role": "system", "content": sys_content}]
        messages.extend(history)
        messages.append({"role": "user", "content": message})

        try:
            client = cls.get_openai_client()
            completion = client.chat.completions.create(
                model=NVIDIA_MODEL,
                messages=messages,
                temperature=0.7,
                max_tokens=300,
                stream=False
            )
            raw_reply = completion.choices[0].message.content
            if raw_reply and raw_reply.strip():
                return raw_reply.strip()
        except Exception as e:
            logger.warning(f"NVIDIA gpt-oss-20b generation exception: {e}")

        # Fallback to rich empathetic responses
        idx = abs(hash(message)) % len(EMPATHIC_FALLBACKS)
        return EMPATHIC_FALLBACKS[idx]

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
        and returns empathetic, pure-hearted AI response via gpt-oss-20b.
        """
        clean_text = message.strip()
        crisis_detected = any(regex.search(clean_text) for regex in COMPILED_CRISIS_REGEX)

        now = datetime.now(timezone.utc)
        resolved_session_id = session_id or f"CHAT-{uuid.uuid4().hex[:8].upper()}"

        if crisis_detected:
            # Create a high priority crisis alert in database
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
                except Exception as e:
                    logger.error(f"Failed to record crisis alert: {e}")

            reply = (
                "You are not alone. Thank you for telling me. Your life, peace, and safety matter deeply. "
                "I am pausing our conversation so you can connect directly with caring human support right now."
            )

            return {
                "session_id": resolved_session_id,
                "reply": reply,
                "crisis_flag": True,
                "action_required": "SHOW_CRISIS_SCREEN",
                "support_numbers": ["14566", "14416", "108"],
                "timestamp": now.isoformat()
            }

        # Generate consoling AI response from gpt-oss-20b
        reply = cls._generate_ai_reply(
            message=clean_text,
            session_id=resolved_session_id,
            language=language,
            db=db
        )

        # Log conversation securely if db available
        if db is not None:
            try:
                db.chat_messages.insert_one({
                    "session_id": resolved_session_id,
                    "user_id": user_id,
                    "user_message": clean_text,
                    "bot_reply": reply,
                    "model": NVIDIA_MODEL,
                    "crisis_flag": False,
                    "created_at": now
                })
            except Exception as e:
                logger.warning(f"Failed to persist chat message: {e}")

        return {
            "session_id": resolved_session_id,
            "reply": reply,
            "crisis_flag": False,
            "action_required": "CONTINUE",
            "timestamp": now.isoformat()
        }
