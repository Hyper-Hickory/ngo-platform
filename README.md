# 🌍 NGO Platform

A full-stack web application for managing NGO operations — volunteers, events, attendance, certificates, and announcements — built with a modern React frontend and a Node.js/Express backend.

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Event Lifecycle](#event-lifecycle)
- [Default Credentials](#default-credentials)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 About the Project

The **NGO Platform** is a comprehensive volunteer management system designed to streamline NGO operations. It provides role-based dashboards for admins, coordinators, and volunteers, enabling efficient event management, attendance tracking, and certificate generation.

---

## ✨ Features

- 🔐 **Authentication & Authorization** — JWT-based secure login with role-based access control
- 👥 **Volunteer Management** — Register, manage, and track volunteer profiles
- 📅 **Event Management** — Create and manage events with volunteer limits and recurring schedules
- ✅ **Attendance Tracking** — Real-time attendance marking for events
- 🏅 **Certificate Generation** — Automatic digital certificates for event participants
- 📢 **Announcements** — Broadcast important updates to all volunteers
- 🎭 **Event Coordinator Role** — Dedicated coordinator dashboard and permissions
- 📊 **Event Reports** — Generate reports for completed events
- 🔄 **Event Lifecycle** — Automatic status updates: `upcoming → ongoing → completed`
- 🌐 **Modern Homepage** — Redesigned NGO-themed landing page with social media integration placeholders
- 🔒 **Rate Limiting** — API protection against abuse

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI Framework |
| Vite | Build Tool & Dev Server |
| React Router v6 | Client-side Routing |
| Tailwind CSS | Styling |
| Axios | HTTP Client |
| Context API | State Management |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime Environment |
| Express.js | Web Framework |
| PostgreSQL | Database |
| JWT | Authentication |
| bcrypt | Password Hashing |
| express-rate-limit | Rate Limiting |
| morgan | HTTP Logging |
| node-cron | Scheduled Tasks |

---

## 📁 Project Structure

```
ngo-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & DB configuration
│   │   ├── controllers/     # Route controller logic
│   │   ├── middleware/      # Auth, error handling middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # Express route definitions
│   │   │   ├── auth.routes.js
│   │   │   ├── event.routes.js
│   │   │   ├── volunteer.routes.js
│   │   │   ├── attendance.routes.js
│   │   │   ├── certificate.routes.js
│   │   │   ├── announcement.routes.js
│   │   │   └── coordinator.routes.js
│   │   ├── services/        # Business logic & event lifecycle
│   │   ├── utils/           # Utility helpers
│   │   └── server.js        # App entry point
│   ├── migrations/          # Database migration scripts
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context (AuthContext)
│   │   ├── pages/
│   │   │   ├── Home.jsx     # Landing page
│   │   │   ├── Login.jsx    # Login page
│   │   │   ├── Register.jsx # Registration page
│   │   │   └── dashboard/   # Role-based dashboards
│   │   ├── services/        # API service calls
│   │   ├── utils/           # Frontend utilities
│   │   ├── App.jsx          # App root with routing
│   │   └── main.jsx         # Entry point
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── docs/                    # Additional documentation
├── mobile/                  # Mobile app (future)
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **PostgreSQL** v14 or higher — [Download](https://www.postgresql.org/)
- **npm** v9 or higher (comes with Node.js)
- **Git** — [Download](https://git-scm.com/)

---

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ngo-platform.git
   cd ngo-platform
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

---

### Environment Variables

#### Backend — `backend/.env`

Create a `.env` file in the `backend/` directory using the example:

```bash
cp backend/.env.example backend/.env
```

Then edit the values:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ngo_platform
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

### Database Setup

1. Create the PostgreSQL database:
   ```sql
   CREATE DATABASE ngo_platform;
   ```

2. Run migrations:
   ```bash
   cd backend
   node migrations/run.js
   ```

---

### Running the App

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Runs on `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Runs on `http://localhost:5173`

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/me` | Get current user | Authenticated |

### Events
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/events` | List all events | Public |
| POST | `/api/events` | Create event | Admin |
| GET | `/api/events/:id` | Get event details | Public |
| PUT | `/api/events/:id` | Update event | Admin |
| DELETE | `/api/events/:id` | Delete event | Admin |
| POST | `/api/events/:id/register` | Register for event | Volunteer |
| GET | `/api/events/:id/report` | Get event report | Admin/Coordinator |

### Volunteers
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/volunteers` | List volunteers | Admin |
| GET | `/api/volunteers/:id` | Get volunteer profile | Admin/Self |
| PUT | `/api/volunteers/:id` | Update profile | Admin/Self |

### Attendance
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/attendance/mark` | Mark attendance | Admin/Coordinator |
| GET | `/api/attendance/event/:id` | Get event attendance | Admin/Coordinator |

### Certificates
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/certificates/verify/:number` | Verify certificate | Public |
| GET | `/api/certificates/my` | My certificates | Volunteer |

### Announcements
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/announcements` | List announcements | Authenticated |
| POST | `/api/announcements` | Create announcement | Admin |

### Coordinator
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/coordinator/events` | Coordinator's events | Coordinator |
| POST | `/api/coordinator/attendance` | Mark attendance | Coordinator |

---

## 👤 User Roles

| Role | Permissions |
|---|---|
| **Admin** | Full access — manage everything |
| **Event Coordinator** | Manage assigned events & mark attendance |
| **Volunteer** | View events, register, view own certificates |

---

## 🔄 Event Lifecycle

Events automatically transition through states:

```
upcoming  ──→  ongoing  ──→  completed
(before        (during        (after
start date)    event)         end date)
```

The lifecycle is updated automatically on server startup and via scheduled checks.

---

## 🔑 Default Credentials

> ⚠️ **Change these immediately in production!**

| Field | Value |
|---|---|
| Email | `admin@ngo.com` |
| Password | `Admin@123` |

---

## 🌐 Health Check

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-03-15T..."
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

Built with ❤️ for NGO community management.

---

> **Note:** This project is under active development. Features may change. Always refer to this README for the latest setup instructions.

----
all sql codes are in migrations folder just run them u are done with it 
------

