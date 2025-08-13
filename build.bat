@echo off
echo Building Terraform Quiz Application...

echo.
echo Building Docker image (index.json will be generated automatically)...
docker build -t terraform-quiz .

echo.
echo Build complete! You can now run:
echo   docker run -p 8080:80 terraform-quiz
echo.
echo The application will be available at http://localhost:8080
echo.
echo Note: index.json is now generated automatically during the Docker build process.
