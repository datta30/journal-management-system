@echo off
REM ============================================
REM Research Journal - Kubernetes Deployment Script (Windows)
REM ============================================

echo 🚀 Deploying Research Journal to Kubernetes...

REM Check if kubectl is available
where kubectl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ kubectl is not installed. Please install kubectl first.
    exit /b 1
)

REM Check if Docker is available
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

echo 📦 Building Docker images...

REM Build images
docker build -t research-journal/backend:latest ./backend
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to build backend image
    exit /b 1
)

docker build -t research-journal/frontend:latest ./frontend
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to build frontend image
    exit /b 1
)

docker build -t research-journal/database:latest ./database
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to build database image
    exit /b 1
)

echo ✅ Docker images built successfully!

REM For Minikube, load images
where minikube >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo 📤 Loading images into Minikube...
    minikube image load research-journal/backend:latest
    minikube image load research-journal/frontend:latest
    echo ✅ Images loaded into Minikube!
)

echo 🔧 Applying Kubernetes configurations...

kubectl apply -f k8s/namespace.yaml
echo ✅ Namespace created

kubectl apply -f k8s/secrets.yaml
echo ✅ Secrets created

kubectl apply -f k8s/configmaps.yaml
echo ✅ ConfigMaps created

kubectl apply -f k8s/mysql-deployment.yaml
echo ✅ MySQL deployment created

echo ⏳ Waiting for MySQL to be ready...
kubectl wait --for=condition=ready pod -l app=mysql -n research-journal --timeout=120s

kubectl apply -f k8s/backend-deployment.yaml
echo ✅ Backend deployment created

echo ⏳ Waiting for Backend to be ready...
kubectl wait --for=condition=ready pod -l app=backend -n research-journal --timeout=180s

kubectl apply -f k8s/frontend-deployment.yaml
echo ✅ Frontend deployment created

echo ⏳ Waiting for Frontend to be ready...
kubectl wait --for=condition=ready pod -l app=frontend -n research-journal --timeout=60s

kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

echo.
echo ============================================
echo 🎉 Deployment Complete!
echo ============================================
echo.
echo 📊 Deployment Status:
kubectl get all -n research-journal
echo.
echo 🌐 Access URLs (NodePort):
echo    Frontend: http://localhost:30000
echo    Backend:  http://localhost:30080
echo    MySQL:    localhost:30306
echo.
echo For Minikube, run: minikube service frontend-nodeport -n research-journal

pause
