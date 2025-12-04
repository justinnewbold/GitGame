@echo off
REM
REM Setup Git Hooks for GitGame (Windows)
REM This script configures Git to use the custom hooks in .githooks/
REM

echo Setting up Git hooks for GitGame...

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Git not found. Please install Git first.
    exit /b 1
)

REM Configure Git to use .githooks directory
git config core.hooksPath .githooks

if %ERRORLEVEL% equ 0 (
    echo Git hooks configured successfully!
    echo.
    echo The following hooks are now active:
    echo   * pre-commit: Runs ESLint and tests before commits
    echo.
    echo To disable hooks temporarily, use: git commit --no-verify
) else (
    echo Failed to configure Git hooks
    exit /b 1
)
