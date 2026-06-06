# RecruiTech - AI-Powered Recruitment Platform

RecruiTech is an end-to-end technical recruiting platform that brings job posting, candidate evaluation, and live AI-led interviews into a single cohesive workflow. The platform automates candidate screening through CrewAI agents orchestrated by Apache Airflow and Kafka, enriching profiles from resumes, GitHub, and LeetCode without manual effort. gRPC handles typed communication between the backend and interview service, and GraphQL serves as the primary API contract. Live AI interviews run over WebSockets and WebRTC, with real-time Whisper transcription and GPT-4o scoring.

![RecruiTech](https://img.shields.io/badge/RecruiTech-v1.0.0-blue)
![Node](https://img.shields.io/badge/Node.js-v20+-green)
![React](https://img.shields.io/badge/React-v19+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-v8+-green)

## Features

### For Candidates

- Quick signup with email/password or Google OAuth
- Profile management with resume upload (S3), GitHub, LeetCode, and portfolio links
- Browse and apply to job postings with cover letter
- Take live AI video interviews with real-time transcription
- View interview results and rejection feedback (when released by recruiter)
- Track application status across all applied jobs

### For Recruiters

- Company creation and management with domain verification
- Post jobs with detailed requirements, skills, salary, and experience level
- View AI-generated evaluation reports (radar charts, dimension scores, strength/concern tags)
- Send AI interviews to shortlisted candidates via gRPC
- Watch interview recordings and review per-question scores
- Release interview results to candidates
- Shortlist, reject, or hire candidates with automated email notifications

### Authentication

- Email/password authentication with bcrypt + JWT
- Google OAuth 2.0 one-click signup
- Role-based access control (candidate / recruiter)
- Protected routes with role-specific redirects

## Tech Stack

### Frontend
- **React 19** with Vite 7
- **React Router 7** for client-side routing
- **Apollo Client 4** for GraphQL
- **Socket.IO Client** for real-time interview communication
- **recharts** for radar charts and score visualizations
- **Lucide React** for icons
- Custom CSS with dark theme

### Backend
- **Node.js 20** with Express 4
- **Apollo Server 3** (GraphQL API)
- **Mongoose 8** (MongoDB ODM)
- **Passport.js** with Google OAuth 2.0 strategy
- **JWT** for token-based authentication
- **KafkaJS** for event publishing
- **@grpc/grpc-js** for interview service communication
- **AWS SDK** for S3 resume uploads
- **Helmet** for security headers, **CORS** for origin control

### Interview Service
- **Express** with **Socket.IO 4** (WebSocket server)
- **werift** for server-side WebRTC peer connections
- **OpenAI GPT-4o** for question generation and answer scoring
- **OpenAI Whisper** (`whisper-1`) for real-time audio transcription
- **gRPC server** for backend-initiated interview creation
- **Multer** for recording file uploads

### AI Evaluation Pipeline
- **Apache Airflow 2.10** with LocalExecutor
- **CrewAI 1.9.3** for multi-agent orchestration
- **OpenAI GPT-4o-mini** for agent LLM calls
- **boto3** for S3 resume loading
- **pypdf** for PDF parsing
- **pymongo** for direct MongoDB writes
- **kafka-python-ng** for Kafka messaging
- **google-api-python-client** for Gmail API (OAuth 2.0)

### Infrastructure
- **Apache Kafka 3.7** (KRaft mode) as event bus
- **MongoDB** as primary data store
- **PostgreSQL** for Airflow metadata
- **AWS S3** for resume storage
- **Docker** and **Docker Compose** for local orchestration
- **Railway** for cloud deployment

## Project Structure

```
RecruiTech/
├── backend/
│   ├── src/
│   │   ├── config/          # database.js, passport.js
│   │   ├── features/
│   │   │   ├── user/        # auth, registration, user management
│   │   │   ├── candidate/   # candidate profiles
│   │   │   ├── recruiter/   # recruiter profiles
│   │   │   ├── company/     # company management
│   │   │   ├── job/         # job posting and search
│   │   │   ├── application/ # job applications and status tracking
│   │   │   ├── evaluation/  # AI evaluation reports (read from Airflow)
│   │   │   ├── interview/   # interview management via gRPC
│   │   │   └── feedback/    # rejection feedback queries
│   │   ├── models/          # Mongoose schemas (7 collections)
│   │   ├── routes/          # auth.routes.js, upload.routes.js
│   │   ├── utils/           # kafkaProducer.js, commNotificationProducer.js, jwt.js
│   │   ├── clients/         # interviewControlGrpc.js
│   │   └── index.js         # Express + Apollo server entry point
│   ├── proto/               # interview_control.proto
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── common/      # Landing, Login, Signup, JobDetails
│   │   │   ├── candidate/   # Home, Onboarding, Jobs, InterviewRoom
│   │   │   └── recruiter/   # Home, Onboarding, JobApplicants, AIAnalysisReport
│   │   ├── context/         # AuthContext.jsx
│   │   ├── utils/           # graphql.js
│   │   ├── App.jsx          # Route definitions
│   │   └── main.jsx
│   ├── Dockerfile
│   └── package.json
│
├── interview-service/
│   ├── src/
│   │   ├── grpc/            # gRPC server (CreateInterviewSession, GetInterviewStatus, SubmitAnswerForScoring)
│   │   ├── socket/          # interviewHandler.js, webrtcHandler.js
│   │   ├── services/        # aiService.js, transcriptionService.js, interviewSessionActions.js
│   │   ├── routes/          # interview.routes.js (recording upload, interview queries)
│   │   ├── constants/       # interviewLimits.js
│   │   └── index.js         # Express + Socket.IO entry point
│   ├── recordings/          # Local recording storage
│   ├── proto/               # interview_control.proto
│   ├── Dockerfile
│   └── package.json
│
├── airflow/
│   ├── dags/
│   │   ├── candidate_evaluation_dag.py   # 6-task evaluation pipeline
│   │   ├── comm_notification_dag.py      # Email notifications
│   │   ├── rejection_feedback_dag.py     # AI-generated rejection feedback
│   │   ├── agents/
│   │   │   ├── github_agent.py           # GitHub profile analyzer (CrewAI)
│   │   │   ├── leetcode_agent.py         # LeetCode stats analyzer (CrewAI)
│   │   │   ├── ats_scorer_agent.py       # Resume vs JD scorer (OpenAI direct)
│   │   │   ├── consolidation_agent.py    # Weighted merge + synthesis (CrewAI)
│   │   │   └── feedback_agent.py         # Rejection feedback generator (CrewAI)
│   │   ├── tools/
│   │   │   ├── github_graphql_tool.py    # GitHub GraphQL API client
│   │   │   └── leetcode_graphql_tool.py  # LeetCode GraphQL API client
│   │   └── utils/
│   │       ├── scorer.py                 # ATS scoring prompt + parsing
│   │       ├── schemas.py                # Pydantic models (AgentResult, ConsolidatedReport)
│   │       ├── s3_resume_loader.py       # S3 PDF download + text extraction
│   │       ├── gmail_sender.py           # Gmail API sender (OAuth 2.0)
│   │       ├── email_templates.py        # HTML email templates
│   │       └── config.py                 # Environment variable loading
│   ├── Dockerfile
│   ├── docker-compose.yaml
│   └── requirements.txt
│
├── kafka/
│   ├── docker-compose.yaml               # Kafka + Kafka UI + kafka-trigger
│   ├── kafka_trigger.py                   # Kafka consumer → Airflow DAG trigger
│   ├── Dockerfile.trigger
│   └── requirements.txt
│
├── README.md
├── QUICKSTART.md
├── RAILWAY_DEPLOYMENT.md
├── package.json              # Root workspace (concurrently)
└── start.sh                  # Automated startup script
```

## Getting Started

### Prerequisites

- Node.js (v20+)
- MongoDB (v8+)
- Docker & Docker Compose
- npm

### Quick Start

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp interview-service/.env.example interview-service/.env
cp airflow/.env.example airflow/.env

# Edit .env files with your credentials (OpenAI API key, Gmail credentials, etc.)

# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd interview-service && npm install && cd ..

# Start all services
./start.sh

# To stop all services
./start.sh --stop
```

The script starts:
- Kafka (Docker) on port 9092
- Backend on port 4000
- Interview Service on port 5001
- Frontend on port 5173
- Airflow (Docker) on port 8080

### Manual Installation

See [QUICKSTART.md](QUICKSTART.md) for step-by-step manual setup instructions.

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend GraphQL | http://localhost:4000/graphql |
| Interview Service | http://localhost:5001 |
| Airflow UI | http://localhost:8080 (airflow/airflow) |
| Kafka UI | http://localhost:8081 |

## Database Schema

### MongoDB Collections

| Collection | Purpose |
|------------|---------|
| `users` | Auth accounts (email, password_hash, google_id, role, is_admin) |
| `candidates` | Candidate profiles (name, resume_url, github_url, leetcode_url, skills, work_experiences, educations) |
| `recruiters` | Recruiter profiles (name, company_id, verification_status) |
| `companies` | Employer companies (name, domain, is_verified) |
| `jobs` | Job postings (title, description, skills, salary, employment_type, experience_level, deadline) |
| `applications` | Job applications (job_id, candidate_id, status: pending/reviewed/shortlisted/rejected/hired) |
| `interviews` | AI interview sessions (questions, scores, recording_url, overall_score, status) |
| `evaluations` | Agent evaluation reports (written by Airflow, read by backend) |
| `candidate_feedback` | Rejection feedback (generated by feedback agent) |

## API Surface

### GraphQL (Apollo Server at `/graphql`)

**Queries:** `me`, `user`, `users`, `candidate`, `myCandidateProfile`, `candidates`, `recruiter`, `myRecruiterProfile`, `recruiters`, `company`, `companies`, `jobs`, `searchJobs`, `job`, `myJobPosts`, `myApplications`, `applicationsForJob`, `applicationCountForJob`, `myApplicationCount`, `hasApplied`, `evaluation`, `evaluationScores`, `myInterviews`, `interviewForApplication`, `rejectionFeedback`

**Mutations:** `register`, `login`, `updateUserRole`, `deleteUser`, `createCandidate`, `updateCandidate`, `deleteCandidate`, `createRecruiter`, `updateRecruiter`, `deleteRecruiter`, `updateRecruiterVerification`, `createCompany`, `updateCompany`, `deleteCompany`, `createJob`, `applyToJob`, `updateApplicationStatus`, `withdrawApplication`, `triggerEvaluation`, `sendAiInterview`, `releaseInterviewResults`

### REST Endpoints

| Method | Path | Service |
|--------|------|---------|
| GET | `/health` | Backend |
| GET | `/auth/google` | Backend |
| GET | `/auth/google/callback` | Backend |
| POST | `/auth/google/register` | Backend |
| POST | `/upload` | Backend (S3) |
| POST | `/api/interviews/create` | Interview Service |
| GET | `/api/interviews/recordings/:filename` | Interview Service |
| GET | `/api/interviews/token/:token` | Interview Service |
| GET | `/api/interviews/application/:appId` | Interview Service |
| GET | `/api/interviews/my-interviews` | Interview Service |

### gRPC (`interview_control.proto`)

| RPC | Direction |
|-----|-----------|
| `CreateInterviewSession` | Backend → Interview Service |
| `GetInterviewStatus` | Backend → Interview Service |
| `SubmitAnswerForScoring` | Backend → Interview Service |

### Kafka Topics

| Topic | Producer | Consumer |
|-------|----------|----------|
| `candidate-evaluation-request` | Backend | kafka-trigger → Airflow |
| `comm-notification` | Backend | kafka-trigger → Airflow |
| `evaluation-complete` | Airflow | Backend |
| `rejection-feedback` | Airflow | kafka-trigger → Airflow |

## Google OAuth Setup

1. Create project in [Google Cloud Console](https://console.cloud.google.com/)
2. Configure OAuth consent screen (External, add `userinfo.email` and `userinfo.profile` scopes)
3. Create OAuth client ID (Web application)
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:4000/auth/google/callback`
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `backend/.env`

## Deployment

See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for full Railway deployment guide.

All 8 services deploy to Railway from a single GitHub repo using root directory settings. Railway auto-deploys on push to main.

## Security

- Password hashing with bcrypt
- JWT token-based authentication
- Google OAuth 2.0
- Role-based access control
- Helmet security headers
- CORS configured for specific origins
- Input validation on all GraphQL resolvers

## Authors

- **RecruiTech Team**

## License

This project is licensed under the MIT License.
