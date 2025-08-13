@echo off
setlocal enabledelayedexpansion
REM Generate index.json for exam questions
REM This script scans the exam-questions directory and creates an index.json file
REM listing all the JSON question files.

echo Generating index.json...

REM Change to the exam-questions directory
cd exam-questions

REM Delete any existing temp file
if exist temp_index.json del temp_index.json

REM Create a temporary file with the JSON content
echo [ > temp_index.json

REM Find all JSON files (excluding index.json and temp files) and add them to the temp file
set count=0
for %%f in (*.json) do (
    if not "%%f"=="index.json" (
        if not "%%f"=="temp_index.json" (
            set /a count+=1
            if !count!==1 (
                echo   "%%f" >> temp_index.json
            ) else (
                echo   ,"%%f" >> temp_index.json
            )
        )
    )
)

REM Close the JSON array
echo ] >> temp_index.json

REM Move the temp file to index.json
move /y temp_index.json index.json >nul

echo Generated index.json successfully!
echo.
echo Files included:
for %%f in (*.json) do (
    if not "%%f"=="index.json" (
        echo   - %%f
    )
)

REM Go back to the parent directory
cd ..

echo.
echo Done! index.json has been generated in the exam-questions directory.
