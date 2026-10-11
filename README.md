# ProjectFlow — Project Management SaaS

A full-stack project management app built with React, Node.js, Express, and MongoDB. Designed as a portfolio project to demonstrate end-to-end feature ownership, authentication, workspace membership, project/task workflows, API validation, and automated tests.

## Features

- JWT-based registration, login, and protected API routes
- Workspaces with owner/member roles
- Projects with descriptions and status
- Tasks with assignees, priority, status, due dates, search, filters, and pagination
- Task comments
- Dashboard metrics and task breakdowns
- Server-side validation and centralized error handling
- MongoDB indexes for common lookup patterns
- Responsive React UI
- API integration tests using an isolated test database URI
- Docker Compose setup for MongoDB, API, and frontend

## Stack

- **Frontend:** React, Vite, React Router, Axios, plain CSS
- **Backend:** Node.js, Express, Mongoose, JWT, bcryptjs, Zod
- **Testing:** Vitest, Supertest, mongodb-memory-server
- **Deployment support:** Docker, Docker Compose

## Requirements

- Node.js 20+
- npm 10+
- MongoDB 7+ locally, or Docker Desktop

## Run locally

1. Install dependencies at the repository root:

   ```bash
   npm install
   ```

2. Configure the API environment:

   ```bash
   cp server/.env.example server/.env
   ```

   On Windows PowerShell:

   ```powershell
   Copy-Item server/.env.example server/.env
   ```

3. Make sure MongoDB is running locally, or run only MongoDB with Docker:

   ```bash
   docker compose up -d mongo
   ```

4. Start the API and frontend from the root:

   ```bash
   npm run dev
   ```

5. Open <http://localhost:5173>. The API runs at <http://localhost:5000>.

The local API environment file should contain a unique, long `JWT_SECRET`. Never commit `.env` files or real secrets.

## Docker Compose

From the root, set `JWT_SECRET` to a strong value in your shell and run:

```bash
docker compose up --build
```

Open <http://localhost:8080>. The API health endpoint is <http://localhost:5000/api/health>.

The Docker frontend uses Nginx to proxy `/api` requests to the backend. This compose file is intended for local demonstration; configure HTTPS, managed secrets, backups, rate limits, and production-grade monitoring before real production use.

## API overview

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/health` | Health check | No |
| POST | `/auth/register` | Create account and workspace | No |
| POST | `/auth/login` | Log in | No |
| GET | `/auth/me` | Current user | Yes |
| GET/POST | `/workspaces` | List/create workspaces | Yes |
| GET/PATCH | `/workspaces/:workspaceId` | Read/update workspace | Yes |
| POST | `/workspaces/:workspaceId/members` | Add existing user by email | Owner |
| GET/POST | `/workspaces/:workspaceId/projects` | List/create projects | Member |
| GET/PATCH/DELETE | `/projects/:projectId` | Read/update/delete project | Member; delete owner |
| GET/POST | `/projects/:projectId/tasks` | List/create tasks | Member |
| GET/PATCH/DELETE | `/tasks/:taskId` | Read/update/delete task | Member |
| GET/POST | `/tasks/:taskId/comments` | List/create comments | Member |
| GET | `/dashboard?workspaceId=...` | Workspace metrics | Member |

Registration creates a personal workspace. To collaborate, register a second account and add its email from the workspace's Members API (see the API section below). The UI currently focuses on project/task workflows; member management is available through the API.

### Example: add a member

After logging in, use the returned bearer token:

```bash
curl -X POST http://localhost:5000/api/workspaces/WORKSPACE_ID/members \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"teammate@example.com","role":"member"}'
```

### Task filters and pagination

`GET /api/projects/:projectId/tasks?search=design&status=in-progress&priority=high&page=1&limit=10&sortBy=dueDate&order=asc`

Supported statuses: `todo`, `in-progress`, `done`. Priorities: `low`, `medium`, `high`.

## Tests

```bash
npm test
```

The test suite uses `mongodb-memory-server`, which may download a MongoDB binary the first time it runs. If that is blocked by your network, configure a dedicated `TEST_MONGODB_URI` pointing to an isolated test database. Never point tests at production data.

## Suggested GitHub setup

1. Create a public repository named `projectflow-mern`.
2. Extract this ZIP and open the extracted folder in VS Code.
3. Review the code, install dependencies, run the app, and run tests.
4. Initialize Git and push:

   ```bash
   git init
   git add .
   git commit -m "Build ProjectFlow MERN project management app"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/projectflow-mern.git
   git push -u origin main
   ```

5. Replace `YOUR-USERNAME` with your GitHub username. If GitHub CLI is installed and authenticated, you can instead create the repository with `gh repo create projectflow-mern --public --source=. --remote=origin --push`.

## Before sharing this as portfolio work

- Run the app and tests yourself.
- Add screenshots and a short demo video to this README.
- Add a live demo and API docs when deployed.
- Use sample data only; do not commit secrets or company code.
- Be prepared to explain the schema design, authorization checks, indexes, pagination, tests, and deployment choices in an interview.
