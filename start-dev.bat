@echo off
REM --- Avvia Vite nel frontend ---
cd /d "C:\Users\Carlo Durante\Desktop\gioco taury\MoriartyGameDesktop"
start cmd /k "npx vite"

REM --- Attendi 5 secondi per far partire Vite ---
timeout /t 5 /nobreak > nul

REM --- Avvia Tauri collegandosi alla porta 5173 ---
cd /d "C:\Users\Carlo Durante\Desktop\gioco taury\tauri-app"
set TAURI_DEV_HOST=localhost:5173
npm run tauri dev

pause
