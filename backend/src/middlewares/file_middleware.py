import os
import uuid
from fastapi import UploadFile, HTTPException, status
from src.config.config import settings

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "voice_samples")
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def validate_and_save_audio(file: UploadFile) -> str:
    """
    Validates uploaded voice/audio file for Voice Analysis engine (Whisper STT / Stress signals).
    Checks file extension and enforces size constraints.
    Returns the absolute path to the saved audio file.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must have a valid filename."
        )

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in settings.ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported audio format '{ext}'. Allowed formats: {settings.ALLOWED_AUDIO_EXTENSIONS}"
        )

    # Read content and check size limit
    content = await file.read()
    max_bytes = settings.MAX_AUDIO_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Audio file size exceeds the maximum limit of {settings.MAX_AUDIO_FILE_SIZE_MB}MB."
        )

    # Generate unique filename to avoid collision
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    saved_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save content synchronously using standard I/O (buffered)
    with open(saved_path, "wb") as f:
        f.write(content)

    # Reset file cursor in case further processing reads it
    await file.seek(0)

    return saved_path
