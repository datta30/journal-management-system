#!/bin/bash
# ============================================
# Research Journal - Kubernetes Deployment Script
# ============================================

set -e

echo "🚀 Deploying Research Journal to Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

echo "📦 Building Docker images..."

# Build images
docker build -t research-journal/backend:latest ./backend
docker build -t research-journal/frontend:latest ./frontend
docker build -t research-journal/database:latest ./database

echo "✅ Docker images built successfully!"

# For Minikube, load images into Minikube's Docker daemon
if command -v minikube &> /dev/null; then
    echo "📤 Loading images into Minikube..."
    minikube image load research-journal/backend:latest
    minikube image load research-journal/frontend:latest
    echo "✅ Images loaded into Minikube!"
fi

echo "🔧 Applying Kubernetes configurations..."

# Apply configurations in order
kubectl apply -f k8s/namespace.yaml
echo "✅ Namespace created"

kubectl apply -f k8s/secrets.yaml
echo "✅ Secrets created"

kubectl apply -f k8s/configmaps.yaml
echo "✅ ConfigMaps created"

kubectl apply -f k8s/mysql-deployment.yaml
echo "✅ MySQL deployment created"

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
kubectl wait --for=condition=ready pod -l app=mysql -n research-journal --timeout=120s

kubectl apply -f k8s/backend-deployment.yaml
echo "✅ Backend deployment created"

# Wait for Backend to be ready
echo "⏳ Waiting for Backend to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n research-journal --timeout=180s

kubectl apply -f k8s/frontend-deployment.yaml
echo "✅ Frontend deployment created"

# Wait for Frontend to be ready
echo "⏳ Waiting for Frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend -n research-journal --timeout=60s

# Apply Ingress (optional - may fail if no ingress controller)
kubectl apply -f k8s/ingress.yaml 2>/dev/null || echo "⚠️  Ingress not applied (ingress controller may not be installed)"

# Apply HPA (optional)
kubectl apply -f k8s/hpa.yaml 2>/dev/null || echo "⚠️  HPA not applied (metrics-server may not be installed)"

echo ""
echo "============================================"
echo "🎉 Deployment Complete!"
echo "============================================"
echo ""
echo "📊 Deployment Status:"
kubectl get all -n research-journal
echo ""
echo "🌐 Access URLs (NodePort):"
echo "   Frontend: http://localhost:30000"
echo "   Backend:  http://localhost:30080"
echo "   MySQL:    localhost:30306"
echo ""
echo "For Minikube, run: minikube service frontend-nodeport -n research-journal"
