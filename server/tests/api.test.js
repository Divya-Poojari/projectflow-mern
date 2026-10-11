import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { createApp } from "../src/app.js";
import User from "../src/models/User.js";
import Workspace from "../src/models/Workspace.js";
import Project from "../src/models/Project.js";
import Task from "../src/models/Task.js";
import Comment from "../src/models/Comment.js";

let mongo;
let app;
let token;
let workspaceId;
let projectId;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-projectflow";
  process.env.JWT_EXPIRES_IN = "1h";
  process.env.CLIENT_URL = "http://localhost:5173";
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = createApp();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Workspace.deleteMany({}), Project.deleteMany({}), Task.deleteMany({}), Comment.deleteMany({})]);
  const response = await request(app).post("/api/auth/register").send({
    name: "Test User", email: "test@example.com", password: "correct-horse-battery"
  });
  token = response.body.token;
  workspaceId = response.body.workspace.id;
});

describe("ProjectFlow API", () => {
  it("reports health", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("registers and returns a workspace", async () => {
    const response = await request(app).get("/api/workspaces").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.workspaces).toHaveLength(1);
  });

  it("rejects protected routes without a token", async () => {
    const response = await request(app).get("/api/workspaces");
    expect(response.status).toBe(401);
  });

  it("creates a project and task, and supports status filtering", async () => {
    const p = await request(app).post("/api/projects").set("Authorization", `Bearer ${token}`)
      .send({ name: "Launch", workspaceId, description: "Ship the first version" });
    expect(p.status).toBe(201);
    projectId = p.body.project._id;

    const t = await request(app).post(`/api/projects/${projectId}/tasks`).set("Authorization", `Bearer ${token}`)
      .send({ title: "Write README", priority: "high", status: "todo" });
    expect(t.status).toBe(201);

    const list = await request(app).get(`/api/projects/${projectId}/tasks?status=todo&page=1&limit=10`)
      .set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.tasks).toHaveLength(1);
    expect(list.body.pagination.total).toBe(1);
  });

  it("rejects invalid task input", async () => {
    const p = await request(app).post("/api/projects").set("Authorization", `Bearer ${token}`)
      .send({ name: "Launch", workspaceId });
    const response = await request(app).post(`/api/projects/${p.body.project._id}/tasks`)
      .set("Authorization", `Bearer ${token}`).send({ title: "x" });
    expect(response.status).toBe(400);
  });
});
