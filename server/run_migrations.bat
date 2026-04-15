@echo off
REM Run database migrations for Neon DB
echo Running database migrations...

cd /d "%~dp0"

REM Load environment variables and run migration
call .venv\Scripts\activate.bat
alembic upgrade head

echo.
echo ✅ Migrations complete!
pause
