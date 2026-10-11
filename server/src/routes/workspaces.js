import { Router } from "express";
import { z } from "zod";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import Project from "../models/Project.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { getWorkspaceForMember, getWorkspaceOwner } from "../services/access.js";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ "members.user": req.user._id }).sort({ updatedAt: -1 });
  res.json({ workspaces: workspaces.map(w => ({ id: w._id, name: w.name, owner: w.owner, role: w.members.find(m => m.user.toString() === req.user._id.toString())?.role, memberCount: w.members.length })) });
}));

router.post("/", asyncHandler(async (req, res) => {
  const parsed = z.object({ name: z.string().trim().min(2).max(100) }).safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Workspace name must be 2-100 characters");
  const workspace = await Workspace.create({ name: parsed.data.name, owner: req.user._id, members: [{ user: req.user._id, role: "owner" }] });
  res.status(201).json({ workspace });
}));

router.get("/:workspaceId", asyncHandler(async (req, res) => {
  const w = await getWorkspaceForMember(req.params.workspaceId, req.user._id);
  res.json({ workspace: { id: w._id, name: w.name, owner: w.owner, members: w.members } });
}));

router.patch("/:workspaceId", asyncHandler(async (req, res) => {
  const parsed = z.object({ name: z.string().trim().min(2).max(100) }).safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Workspace name must be 2-100 characters");
  const w = await getWorkspaceOwner(req.params.workspaceId, req.user._id);
  w.name = parsed.data.name;
  await w.save();
  res.json({ workspace: { id: w._id, name: w.name } });
}));

router.post("/:workspaceId/members", asyncHandler(async (req, res) => {
  const parsed = z.object({ email: z.string().email(), role: z.enum(["member"]).default("member") }).safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Provide a valid email and member role");
  const w = await getWorkspaceOwner(req.params.workspaceId, req.user._id);
  const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (!user) throw new HttpError(404, "User not found. Ask them to register first.");
  if (w.members.some(m => m.user.toString() === user._id.toString())) throw new HttpError(409, "User is already a workspace member");
  w.members.push({ user: user._id, role: "member" });
  await w.save();
  res.status(201).json({ message: "Member added", member: { id: user._id, name: user.name, email: user.email, role: "member" } });
}));

router.get("/:workspaceId/projects", asyncHandler(async (req, res) => {
  await getWorkspaceForMember(req.params.workspaceId, req.user._id);
  const projects = await Project.find({ workspace: req.params.workspaceId }).sort({ updatedAt: -1 });
  res.json({ projects });
}));

export default router;
