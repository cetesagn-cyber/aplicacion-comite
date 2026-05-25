@echo off
title Bill-e WEB — Produccion (Red Local)
chcp 65001 >nul

echo ============================================
echo   Bill-e WEB — Modo Produccion
echo ============================================
echo.

REM Verificar que existe el build del frontend
if not exist "C:\Developer\Bill-E WEB\frontend\dist\index.html" (
    echo [!] El build del frontend no existe. Ejecutando npm run build...
    cd /d "C:\Developer\Bill-E WEB\frontend"
    call npm run build
    if errorlevel 1 (
        echo [ERROR] Fallo el build del frontend.
        pause
        exit /b 1
    )
    cd /d "C:\Developer\Bill-E WEB"
)

echo [OK] Frontend build listo.
echo.
echo Iniciando servidor...
echo.
echo Cuando arranque, comparte esta URL con tus companeros:
echo   http://[IP-DE-ESTA-PC]:3001
echo.
echo (La IP exacta aparecera en la consola del servidor)
echo.

cd /d "C:\Developer\Bill-E WEB\backend"
node server.js
