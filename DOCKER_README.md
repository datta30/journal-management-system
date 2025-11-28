# Research Journal - Docker & Kubernetes Setup

## Quick Start Options

### Option 1: Docker Compose (Recommended for Development)

```bash
# Start all services
.\start-docker.bat

# Or manually:
docker compose up --build -d

# Stop all services
.\stop-docker.bat
```

**Access URLs (Docker Compose):**
| Service  | URL                    | Internal Port |
|----------|------------------------|---------------|
| Frontend | http://localhost:3001  | 80            |
| Backend  | http://localhost:8081  | 8080          |
| MySQL    | localhost:3307         | 3306          |

### Option 2: Kubernetes Deployment

**Prerequisites:**
- Docker Desktop with Kubernetes enabled, OR
- Minikube installed

```bash
# Deploy to Kubernetes
.\deploy-k8s.bat

# Or using kubectl directly:
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmaps.yaml
kubectl apply -f k8s/mysql-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

**Access URLs (Kubernetes NodePort):**
| Service  | URL                    | NodePort |
|----------|------------------------|----------|
| Frontend | http://localhost:30000 | 30000    |
| Backend  | http://localhost:30080 | 30080    |
| MySQL    | localhost:30306        | 30306    |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │              research-journal namespace          │   │
│  │                                                  │   │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐    │   │
│  │  │ Frontend │   │ Backend  │   │  MySQL   │    │   │
│  │  │ (Nginx)  │──▶│ (Spring) │──▶│   DB     │    │   │
│  │  │  :80     │   │  :8080   │   │  :3306   │    │   │
│  │  │ 2 pods   │   │ 2 pods   │   │  1 pod   │    │   │
│  │  └────┬─────┘   └────┬─────┘   └────┬─────┘    │   │
│  │       │              │              │          │   │
│  │  ┌────▼─────┐   ┌────▼─────┐   ┌────▼─────┐    │   │
│  │  │ NodePort │   │ NodePort │   │ NodePort │    │   │
│  │  │  30000   │   │  30080   │   │  30306   │    │   │
│  │  └──────────┘   └──────────┘   └──────────┘    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Container Details

### Frontend Container
- **Base Image:** nginx:alpine
- **Port:** 80
- **Features:**
  - Serves React build files
  - Proxies /api requests to backend
  - Gzip compression enabled
  - Static asset caching

### Backend Container
- **Base Image:** eclipse-temurin:21-jre-alpine
- **Port:** 8080
- **Features:**
  - Spring Boot 3.2 with Java 21
  - JWT Authentication
  - JPA/Hibernate for database
  - Multi-stage Docker build

### Database Container
- **Base Image:** mysql:8.0
- **Port:** 3306
- **Features:**
  - Persistent volume for data
  - Health checks configured
  - Automatic database initialization

## Kubernetes Resources

| Resource Type | Name              | Description                    |
|--------------|-------------------|--------------------------------|
| Namespace    | research-journal  | Isolated environment           |
| Secret       | mysql-secrets     | Database credentials           |
| Secret       | jwt-secrets       | JWT signing key                |
| ConfigMap    | backend-config    | Backend configuration          |
| ConfigMap    | frontend-config   | Frontend configuration         |
| PVC          | mysql-pvc         | 5Gi persistent storage         |
| Deployment   | mysql             | 1 replica                      |
| Deployment   | backend           | 2 replicas (auto-scales to 5) |
| Deployment   | frontend          | 2 replicas (auto-scales to 5) |
| Service      | mysql-service     | ClusterIP for internal access  |
| Service      | backend-service   | ClusterIP for internal access  |
| Service      | frontend-service  | ClusterIP for internal access  |
| Service      | *-nodeport        | NodePort for external access   |
| Ingress      | research-journal  | Optional HTTP routing          |
| HPA          | backend-hpa       | Auto-scaling (70% CPU)         |
| HPA          | frontend-hpa      | Auto-scaling (70% CPU)         |

## Useful Commands

```bash
# View all resources
kubectl get all -n research-journal

# View logs
kubectl logs -f deployment/backend -n research-journal
kubectl logs -f deployment/frontend -n research-journal

# Scale deployments
kubectl scale deployment backend --replicas=3 -n research-journal

# Port forward for debugging
kubectl port-forward svc/backend-service 8080:8080 -n research-journal

# Delete everything
kubectl delete namespace research-journal

# Docker Compose logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f database
```

## Test Accounts

| Role     | Email                    | Password    |
|----------|--------------------------|-------------|
| Editor   | testeditor@journal.com   | password123 |
| Author   | testauthor@journal.com   | password123 |
| Reviewer | reviewer@journal.com     | password123 |
| Reviewer | reviewer2@journal.com    | password123 |
