import { Router } from "express";
import { z } from "zod";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { getWorkspaceForMember, getWorkspaceOwner, getProjectForMember } from "../services/access.js";

const router = Router();
router.use(requireAuth);

router.post("/", asyncHandler(async (req, res) => {
  const parsed = z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().max(2000).optional().default(""),
    workspaceId: z.string().min(1),
    status: z.enum(["planning", "active", "completed", "on-hold"]).optional()
  }).safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);
  await getWorkspaceForMember(parsed.data.workspaceId, req.user._id);
  const project = await Project.create({ name: parsed.data.name, description: parsed.data.description, workspace: parsed.data.workspaceId, createdBy: req.user._id, status: parsed.data.status || "active" });
  res.status(201).json({ project });
}));

router.get("/:projectId", asyncHandler(async (req, res) => {
  const project = await getProjectForMember(req.params.projectId, req.user._id);
  res.json({ project });
}));

router.patch("/:projectId", asyncHandler(async (req, res) => {
  const project = await getProjectForMember(req.params.projectId, req.user._id);
  const parsed = z.object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(["planning", "active", "completed", "on-hold"]).optional()
  }).strict().safeParse(req.body);
  if (!parsed.success || !Object.keys(parsed.data || {}).length) throw new HttpError(400, "Provide valid project fields to update");
  Object.assign(project, parsed.data);
  await project.save();
  res.json({ project });
}));

router.delete("/:projectId", asyncHandler(async (req, res) => {
  const project = await getProjectForMember(req.params.projectId, req.user._id);
  await getWorkspaceOwner(project.workspace, req.user._id);
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ message: "Project and its tasks deleted" });
}));

export default router;
