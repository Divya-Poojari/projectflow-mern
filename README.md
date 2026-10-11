# ProjectFlow — MERN Project Management App

ProjectFlow is a full-stack project management application built with MongoDB, Express.js, React, and Node.js. It helps teams organize workspaces, manage projects, track tasks, assign responsibilities, and collaborate through task discussions.

## Features

- JWT-based user authentication
- Workspace and project management
- Task creation, editing, and deletion
- Task status tracking: To Do, In Progress, and Done
- Task priority management: Low, Medium, and High
- Task assignment to workspace members
- Task comments and discussions
- Task search, filtering, sorting, and pagination
- Dashboard metrics
- Protected API routes, input validation, security headers, and rate limiting

## Tech Stack

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Node.js, Express.js, REST API
- **Database:** MongoDB, Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Validation:** Zod

## Project Structure

```text
ProjectFlow/
├── client/                 # React frontend
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.js
│   └── .env.example
├── package.json
├── package-lock.json
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js and npm
- MongoDB Atlas account or local MongoDB instance
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Divya-Poojari/projectflow-mern.git
cd projectflow-mern
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `server/.env` using `server/.env.example` as a reference.

Configure the following variables with your own values:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret_at_least_32_characters
```

**Security:** Never commit real database credentials, JWT secrets, or access tokens.

### 4. Run the application

From the project root:

```bash
npm run dev
```

The application should be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API health check: http://localhost:5000/api/health

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | API health check |
| GET | `/api/projects/:projectId/tasks` | List project tasks |
| POST | `/api/projects/:projectId/tasks` | Create a task |
| GET | `/api/tasks/:taskId` | Get a task |
| PATCH | `/api/tasks/:taskId` | Update task status, priority, or other fields |
| DELETE | `/api/tasks/:taskId` | Delete a task |
| GET | `/api/tasks/:taskId/comments` | Get task comments |
| POST | `/api/tasks/:taskId/comments` | Add a task comment |

Protected endpoints require authentication. See the source code for additional workspace, project, and authentication endpoints.

## Future Improvements

- Kanban board with drag-and-drop
- Real-time collaboration
- Notifications
- File attachments
- Automated testing and CI/CD
- Cloud deployment

## Author

**Divya Poojari**

GitHub: [Divya-Poojari](https://github.com/Divya-Poojari)

## License

A license can be added if the project is intended for open-source distribution.
