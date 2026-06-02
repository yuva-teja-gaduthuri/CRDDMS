# CRDDMS — College Records Digitalization & Document Management System

A production-ready, full-stack university ERP-style platform for digitizing academic and administrative records with OCR, compliance management, and role-based access control.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([nodejs.org](https://nodejs.org))
- **Docker Desktop** ([docker.com](https://docker.com)) — for PostgreSQL

---

### Step 1 — Start the Database

```bash
docker compose up -d
```

This starts PostgreSQL on port 5432 and automatically runs the schema + seed data.

---

### Step 2 — Start the Backend

```bash
cd backend
npm install          # (already done if you followed setup)
npm run dev
```

Backend runs at: **http://localhost:5000**

---

### Step 3 — Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install          # (already done)
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@crddms.edu | Password@123 |
| Admin | admin@crddms.edu | Password@123 |
| Dept Head | ravi@crddms.edu | Password@123 |
| Faculty | priya@crddms.edu | Password@123 |
| Staff | suresh@crddms.edu | Password@123 |
| Compliance Reviewer | naac@crddms.edu | Password@123 |

---

## 📁 Project Structure

```
clgproject/
├── frontend/                  # React + Vite + Tailwind CSS
│   └── src/
│       ├── pages/             # 13 page components
│       ├── components/        # Shared UI (Sidebar, Modal, Badge…)
│       ├── layouts/           # MainLayout (sidebar + topbar)
│       ├── context/           # AuthContext (JWT state)
│       ├── routes/            # ProtectedRoute
│       └── services/          # api.js (Axios + interceptors)
│
├── backend/                   # Node.js + Express REST API
│   ├── controllers/           # Business logic (1 file per resource)
│   ├── routes/                # Express routers (1 file per resource)
│   ├── middleware/            # auth.js, upload.js, errorHandler.js
│   ├── services/              # ocr.service.js, audit.service.js
│   ├── config/                # db.js (pg Pool)
│   ├── db/                    # schema.sql, seed.sql
│   └── uploads/               # Uploaded files (organized by dept/year)
│
└── docker-compose.yml         # PostgreSQL 15
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | JWT login |
| POST | `/api/auth/register` | Create user |
| GET | `/api/departments` | List all departments |
| POST | `/api/documents/upload` | Upload a document |
| GET | `/api/documents` | List documents (with filters) |
| GET | `/api/documents/:id` | Get document details |
| PUT | `/api/documents/:id` | Update document |
| POST | `/api/ocr/process/:id` | Run OCR on document |
| GET | `/api/ocr/:id` | Get OCR result |
| GET | `/api/search` | Full-text + filter search |
| GET | `/api/compliance` | List compliance records |
| POST | `/api/compliance` | Map document to compliance |
| GET | `/api/archive` | List archives |
| POST | `/api/archive` | Archive a document |
| GET | `/api/audit` | Audit logs |
| GET | `/api/users` | List users (admin only) |
| GET | `/api/reports` | Full analytics |
| GET | `/api/reports/dashboard` | Dashboard stats |

---

## 🎨 UI Pages

1. **Login** — University-style professional login
2. **Dashboard** — Stats + 3 charts + recent uploads
3. **Department Vault** — Folder-browser by department
4. **Upload Document** — Drag-and-drop + metadata form
5. **Search Documents** — Full-text + OCR search
6. **OCR Results** — Text extraction viewer with confidence score
7. **Compliance Center** — NAAC/NBA/AICTE/UGC tabs with progress
8. **Approval Workflow** — Review/Approve/Reject documents
9. **Archive Center** — Historical records
10. **Audit Logs** — Immutable activity trail
11. **User Management** — RBAC user CRUD
12. **Reports & Analytics** — 4 Chart.js charts + KPIs
13. **Profile Settings** — Name + password change

---

## 🔒 Security Features

- JWT Bearer token authentication
- Role-Based Access Control (6 roles)
- Helmet.js HTTP security headers
- Rate limiting (200 req/15min)
- File type + size validation
- SQL injection protection (parameterized queries)
- CORS configured for frontend origin only

---

## 🗄️ Database Tables

`departments` · `users` · `students` · `faculty` · `uploaded_documents` · `ocr_extracted_text` · `accreditation_records` · `archive_records` · `audit_logs`

---

## ⚙️ Environment Variables

**backend/.env**
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crddms_db
DB_USER=crddms_user
DB_PASSWORD=crddms_pass
JWT_SECRET=<change-in-production>
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```
