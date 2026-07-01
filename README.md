# 🎓 Online Exam & Proctoring System

A full-stack online examination platform with AI-assisted proctoring, built for institutions to conduct secure, remotely-monitored exams with automated and manual grading.

🔗 **Live Demo:** [online-exam-system-fdhu.vercel.app](https://online-exam-system-fdhu.vercel.app)

---

## 📋 Overview

This system allows Teachers/Admins to create exams with MCQ, Short, and Long answer questions, while Students take exams under webcam and tab-switch monitoring. MCQs are auto-graded instantly; written answers are graded manually by teachers through a dedicated grading dashboard.

---

## ✨ Features

- 🔐 **JWT Authentication** with role-based access (Admin / Teacher / Student)
- 📝 **Exam Management** — create, edit, and manage exams with configurable duration, marks, and passing criteria
- ❓ **Multiple Question Types** — MCQ (auto-graded), Short Answer, and Long Answer (manually graded)
- 🎥 **AI-Assisted Proctoring** — webcam monitoring and tab-switch detection during exams
- 📊 **Auto-Grading Engine** — instant scoring for MCQs with real-time pass/fail calculation
- ✍️ **Manual Grading Dashboard** — teachers review and score written answers, auto-updates final results
- 📈 **Results & Analytics** — students view their scores; teachers view all submissions with violation logs
- ⏱️ **Timed Exams** — live countdown timer with auto-submission on timeout

---

## 🛠️ Tech Stack

**Backend**
- ASP.NET Core 10 Web API
- Entity Framework Core
- PostgreSQL
- JWT Bearer Authentication
- BCrypt (password hashing)

**Frontend**
- React + TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Axios

**Deployment**
- Backend: Railway (Docker)
- Database: Railway PostgreSQL
- Frontend: Vercel

---

## 🏗️ Architecture
OnlineExamSystem/
├── OnlineExam.API/              → ASP.NET Core Web API (Controllers, Program.cs)
├── OnlineExam.Core/              → Domain Models & Interfaces
├── OnlineExam.Infrastructure/    → EF Core DbContext & Repositories
└── exam-client/                  → React + TypeScript Frontend

Clean layered architecture separating API, Core (domain), and Infrastructure (data access) — following repository pattern with dependency injection.

---

## 🔑 Key Modules

| Module | Description |
|---|---|
| **Auth** | Register/Login with JWT tokens, role-based authorization |
| **Exam** | CRUD operations for exams, restricted to Teacher/Admin |
| **Question** | Add MCQ/Short/Long questions with options |
| **ExamSession** | Tracks student attempts, start/resume/submit logic |
| **Answer** | Auto-grades MCQs, stores answers for manual grading |
| **Proctoring** | Logs webcam/tab-switch violations per session |

---

## 🚀 Getting Started (Local Setup)

### Backend
```bash
cd OnlineExam.API
dotnet restore
dotnet ef database update --project ../OnlineExam.Infrastructure --startup-project .
dotnet run
```

### Frontend
```bash
cd exam-client
npm install
npm start
```

---

## 👨‍💻 Author

**Saim Imran**
Built as a full-stack learning project covering backend architecture, authentication, real-time proctoring, and cloud deployment.
