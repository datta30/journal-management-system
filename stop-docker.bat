@echo off
REM ============================================
REM Research Journal - Stop Docker Compose (Windows)
REM ============================================

echo 🛑 Stopping Research Journal containers...

docker compose down

echo.
echo ✅ All containers stopped!
echo.

REM Optional: Remove volumes
set /p REMOVE_VOLUMES="Remove data volumes? (y/N): "
if /i "%REMOVE_VOLUMES%"=="y" (
    docker compose down -v
    echo ✅ Volumes removed!
)

pause
