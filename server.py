import os
import sys

# Ensure backend directory is on sys.path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import uvicorn
from src.config.config import settings

if __name__ == "__main__":
    print(f"Starting {settings.PROJECT_NAME}...")
    print(f"Server running at: http://{settings.HOST}:{settings.PORT}")
    print(f"Swagger Documentation at: http://{settings.HOST}:{settings.PORT}{settings.API_V1_PREFIX}/docs")
    print(f"Redoc Documentation at: http://{settings.HOST}:{settings.PORT}{settings.API_V1_PREFIX}/redoc")
    
    uvicorn.run(
        "src.app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        reload_dirs=[backend_dir],
        log_level="info"
    )
