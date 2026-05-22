@echo off
title ExamTech Starter
echo ===================================================
echo               EXAMTECH - INICIALIZADOR
echo ===================================================
echo.
echo Iniciando dependencias e inicializando os servidores...
echo.

:: Abre o backend Flask em uma nova janela de terminal
echo [1/2] Iniciando API Backend (Flask)...
start "ExamTech Backend API" cmd /k "cd backend && python -m pip install -r requirements.txt && python app.py"

:: Aguarda 3 segundos para o backend iniciar e criar o DB
timeout /t 3 /nobreak >nul

:: Abre o frontend React em outra janela
echo [2/2] Iniciando Frontend (React + Vite)...
start "ExamTech Frontend UI" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ===================================================
echo   SERVIDORES INICIADOS COM SUCESSO!
echo.
echo   API Backend: http://localhost:5000
echo   Interface UI: http://localhost:5173
echo ===================================================
echo.
pause
