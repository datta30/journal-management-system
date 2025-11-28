# Research Journal Management System

A comprehensive full-stack application for managing academic research paper submissions, peer reviews, and publications.

## 🚀 Quick Start

### Using Docker Compose
```bash
git clone https://github.com/datta30/journal-management-system.git
cd journal-management-system
docker compose up -d
```

**Access URLs:**
- Frontend: http://localhost:3001
- Backend: http://localhost:8081
- MySQL: localhost:3307

### Using Pre-built Images from GitHub Container Registry
```bash
docker pull ghcr.io/datta30/research-journal-backend:latest
docker pull ghcr.io/datta30/research-journal-frontend:latest
docker pull ghcr.io/datta30/research-journal-database:latest
```

### GitHub Pages
Frontend Demo: https://datta30.github.io/journal-management-system/

## Features

### User Roles & Authentication
- **JWT-based Authentication** with role-based access control
- **Four User Roles:**
  - **Author**: Submit papers, track status, submit revisions
  - **Reviewer**: Review assigned papers, provide scores and recommendations
  - **Editor**: Manage papers, assign reviewers, make publication decisions
  - **Admin**: Full system access, user management

### Core Features
- **Paper Submission**: Authors can submit research papers with abstracts, keywords, and file uploads
- **Plagiarism Detection**: Automated plagiarism check on submission (simulated)
- **Peer Review Management**: Editors assign reviewers, reviewers provide detailed feedback
- **Revision Tracking**: Complete history of paper revisions with author responses
- **Publication Workflow**: Papers move through defined states (Submitted → Under Review → Revision Required → Accepted → Published)
- **Dashboard Analytics**: Statistics for editors and admins

## Tech Stack

### Backend
- **Java 21**
- **Spring Boot 3.2**
- **Spring Security** with JWT
- **Spring Data JPA**
- **MySQL**
- **Lombok**

### Frontend
- **React 18**
- **React Router v6**
- **Axios**
- **React Toastify**

## Project Structure

```
research-journal/
├── backend/
│   ├── src/main/java/com/researchjournal/
│   │   ├── config/          # Security & initialization config
│   │   ├── controller/      # REST API endpoints
│   │   ├── dto/             # Data transfer objects
│   │   ├── entity/          # JPA entities
│   │   ├── exception/       # Global exception handling
│   │   ├── repository/      # Data repositories
│   │   ├── security/        # JWT & security classes
│   │   └── service/         # Business logic
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── context/         # React context (Auth)
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   ├── App.jsx
    │   └── index.js
    └── package.json
```

## Setup Instructions

### Prerequisites
- Java 21 JDK
- Node.js 18+
- MySQL 8.0+
- Maven 3.8+

### Database Setup
1. Start MySQL server
2. The application will automatically create the database `research_journal`
3. Default credentials: username=`root`, password=`root`

### Backend Setup
```bash
cd backend

# Install dependencies and run
mvn clean install
mvn spring-boot:run
```
The backend will start on `http://localhost:8080`

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```
The frontend will start on `http://localhost:3000`

## Default Users

The system creates these default users on startup:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@journal.com | admin123 |
| Editor | editor@journal.com | editor123 |
| Reviewer | reviewer@journal.com | reviewer123 |
| Author | author@journal.com | author123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users` - Get all users (Admin/Editor)
- `PUT /api/users/{id}` - Update user
- `PUT /api/users/{id}/role` - Update user role (Admin)
- `DELETE /api/users/{id}` - Delete user (Admin)

### Papers
- `GET /api/papers` - Get all papers (Admin/Editor)
- `GET /api/papers/my-papers` - Get current user's papers
- `POST /api/papers` - Submit new paper
- `PUT /api/papers/{id}` - Update paper
- `POST /api/papers/{id}/revision` - Submit revision
- `PUT /api/papers/{id}/assign-editor/{editorId}` - Assign editor
- `PUT /api/papers/{id}/assign-reviewer/{reviewerId}` - Assign reviewer
- `PUT /api/papers/{id}/status` - Update paper status
- `DELETE /api/papers/{id}` - Delete paper

### Reviews
- `GET /api/reviews/my-reviews` - Get reviewer's assigned reviews
- `PUT /api/reviews/{id}/start` - Start a review
- `PUT /api/reviews/{id}/submit` - Submit review
- `DELETE /api/reviews/{id}` - Delete review

### Public
- `GET /api/public/published` - Get published papers
- `GET /api/public/search` - Search published papers

## Workflow

### Paper Submission Flow
1. Author submits paper → Status: `SUBMITTED`
2. System runs plagiarism check
3. Editor assigns reviewers → Status: `UNDER_REVIEW`
4. Reviewers complete reviews
5. Editor makes decision:
   - Accept → Status: `ACCEPTED` → Can publish
   - Revision Required → Status: `REVISION_REQUIRED`
   - Reject → Status: `REJECTED`
6. If revision required:
   - Author submits revision → Status: `REVISED`
   - Back to step 3 for re-review
7. When accepted, editor publishes → Status: `PUBLISHED`

### Review Process
- Reviewers score papers on: Quality, Originality, Clarity, Significance (1-10)
- Provide recommendation: Accept, Minor Revision, Major Revision, Reject
- Comments to author (visible) and confidential comments to editor

## Environment Configuration

### Backend (application.properties)
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/research_journal
spring.datasource.username=root
spring.datasource.password=root

# JWT
jwt.secret=YourSecretKey
jwt.expiration=86400000

# File Upload
file.upload-dir=./uploads
spring.servlet.multipart.max-file-size=50MB
```

### Frontend
Update `src/services/api.js` if backend URL differs:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});
```

## License

MIT License
