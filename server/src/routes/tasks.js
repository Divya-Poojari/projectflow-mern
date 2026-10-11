import { Router } from "express";
import { z } from "zod";
import Task from "../models/Task.js";
import Comment from "../models/Comment.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import {
  getProjectForMember,
  getTaskForMember,
  getWorkspaceForMember
} from "../services/access.js";
import Project from "../models/Project.js";
import Workspace from "../models/Workspace.js";

const router = Router();

router.use(requireAuth);

const taskFields = {
  title: z.string().trim().min(2).max(180),
  description: z.string().max(4000).optional(),
  assignee: z.string().nullable().optional(),
  status: z.enum(["todo", "in-progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.union([z.string(), z.null()]).optional()
};

// Dashboard metrics
router.get("/tasks/dashboard", asyncHandler(async (req, res) => {
  const parsed = z.string().min(1).safeParse(req.query.workspaceId);

  if (!parsed.success) {
    throw new HttpError(400, "workspaceId is required");
  }

  await getWorkspaceForMember(parsed.data, req.user._id);

  const projects = await Project.find({
    workspace: parsed.data
  }).select("_id");

  const projectIds = projects.map((project) => project._id);

  const [total, todo, inProgress, done, highPriority] = await Promise.all([
    Task.countDocuments({ project: { $in: projectIds } }),
    Task.countDocuments({ project: { $in: projectIds }, status: "todo" }),
    Task.countDocuments({ project: { $in: projectIds }, status: "in-progress" }),
    Task.countDocuments({ project: { $in: projectIds }, status: "done" }),
    Task.countDocuments({
      project: { $in: projectIds },
      priority: "high",
      status: { $ne: "done" }
    })
  ]);

  res.json({
    metrics: { total, todo, inProgress, done, highPriority }
  });
}));

// List tasks in a project
router.get("/projects/:projectId/tasks", asyncHandler(async (req, res) => {
  await getProjectForMember(req.params.projectId, req.user._id);

  const schema = z.object({
    search: z.string().optional(),
    status: z.enum(["todo", "in-progress", "done"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.enum([
      "createdAt",
      "updatedAt",
      "dueDate",
      "priority",
      "title"
    ]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc")
  }).safeParse(req.query);

  if (!schema.success) {
    throw new HttpError(400, "Invalid task filters");
  }

  const { search, status, priority, page, limit, sortBy, order } = schema.data;

  const filter = { project: req.params.projectId };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) filter.$text = { $search: search };

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Task.countDocuments(filter)
  ]);

  res.json({
    tasks,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Create a task
router.post("/projects/:projectId/tasks", asyncHandler(async (req, res) => {
  await getProjectForMember(req.params.projectId, req.user._id);

  const parsed = z.object(taskFields).safeParse(req.body);

  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0].message);
  }

  const data = parsed.data;

  const task = await Task.create({
    title: data.title,
    description: data.description || "",
    project: req.params.projectId,
    createdBy: req.user._id,
    assignee: data.assignee || null,
    status: data.status || "todo",
    priority: data.priority || "medium",
    dueDate: data.dueDate ? new Date(data.dueDate) : null
  });

  res.status(201).json({ task });
}));

// Get one task
router.get("/tasks/:taskId", asyncHandler(async (req, res) => {
  const { task } = await getTaskForMember(req.params.taskId, req.user._id);
  res.json({ task });
}));

// Update task fields, including status and priority
router.patch("/tasks/:taskId", asyncHandler(async (req, res) => {
  const { task, project } = await getTaskForMember(
    req.params.taskId,
    req.user._id
  );

  const schema = z.object({
    title: taskFields.title.optional(),
    description: taskFields.description,
    assignee: taskFields.assignee,
    status: taskFields.status,
    priority: taskFields.priority,
    dueDate: taskFields.dueDate
  }).strict().refine(
    (value) => Object.keys(value).length > 0,
    "Provide fields to update"
  );

  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    throw new HttpError(
      400,
      parsed.error.issues[0]?.message || "Invalid task update"
    );
  }

  if (parsed.data.assignee) {
    const workspace = await Workspace.findOne({
      _id: project.workspace,
      "members.user": parsed.data.assignee
    });

    if (!workspace) {
      throw new HttpError(400, "Assignee must be a workspace member");
    }
  }

  Object.assign(task, parsed.data);

  if (Object.hasOwn(parsed.data, "dueDate")) {
    task.dueDate = parsed.data.dueDate
      ? new Date(parsed.data.dueDate)
      : null;
  }

  await task.save();

  res.json({ task });
}));

// Delete a task
router.delete("/tasks/:taskId", asyncHandler(async (req, res) => {
  const { task } = await getTaskForMember(req.params.taskId, req.user._id);

  await Comment.deleteMany({ task: task._id });
  await task.deleteOne();

  res.json({ message: "Task deleted" });
}));

// Get task comments
router.get("/tasks/:taskId/comments", asyncHandler(async (req, res) => {
  await getTaskForMember(req.params.taskId, req.user._id);

  const comments = await Comment.find({ task: req.params.taskId })
    .populate("author", "name email")
    .sort({ createdAt: 1 });

  res.json({ comments });
}));

// Add a comment
router.post("/tasks/:taskId/comments", asyncHandler(async (req, res) => {
  await getTaskForMember(req.params.taskId, req.user._id);

  const parsed = z.object({
    body: z.string().trim().min(1).max(2000)
  }).safeParse(req.body);

  if (!parsed.success) {
    throw new HttpError(
      400,
      "Comment must be between 1 and 2000 characters"
    );
  }

  const comment = await Comment.create({
    task: req.params.taskId,
    author: req.user._id,
    body: parsed.data.body
  });

  await comment.populate("author", "name email");

  res.status(201).json({ comment });
}));

export default router;