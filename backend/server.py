import uvicorn
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.config.config import settings

if __name__ == "__main__":
    print(f"Starting {settings.PROJECT_NAME}...")
    print(f"Server running at: http://{settings.HOST}:{settings.PORT}")
    print(f"Swagger Documentation at: http://{settings.HOST}:{settings.PORT}{settings.API_V1_PREFIX}/docs")
    print(f"Redoc Documentation at: http://{settings.HOST}:{settings.PORT}{settings.API_V1_PREFIX}/redoc")
    
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    uvicorn.run(
        "src.app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        reload_dirs=[backend_dir],
        log_level="info"
    )
