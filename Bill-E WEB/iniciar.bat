@echo off
title Bill-e WEB — Inicio de Servicios

echo ========================================
echo   Bill-e WEB — Iniciando servicios...
echo ========================================
echo.

echo [1/2] Iniciando Backend (puerto 3001)...
start "Bill-e Backend" cmd /k "cd /d "C:\Developer\Bill-E WEB\backend" && node server.js"

timeout /t 2 /nobreak >nul

echo [2/2] Iniciando Frontend (puerto 5173)...
start "Bill-e Frontend" cmd /k "cd /d "C:\Developer\Bill-E WEB\frontend" && npm run dev"

echo.
echo ========================================
echo   Servicios iniciados correctamente
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3001
echo ========================================
echo.
pause
