import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128)
});
const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(128)
});

function issueToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}
function safeUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

router.post("/register", asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);
  const { name, email, password } = parsed.data;
  if (await User.exists({ email: email.toLowerCase() })) throw new HttpError(409, "An account with this email already exists");
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12) });
  const workspace = await Workspace.create({ name: `${name.trim()}'s workspace`, owner: user._id, members: [{ user: user._id, role: "owner" }] });
  res.status(201).json({ token: issueToken(user), user: safeUser(user), workspace: { id: workspace._id, name: workspace.name } });
}));

router.post("/login", asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Please provide a valid email and password");
  const user = await User.findOne({ email: parsed.data.email.toLowerCase() }).select("+passwordHash");
  if (!user || !(await user.comparePassword(parsed.data.password))) throw new HttpError(401, "Email or password is incorrect");
  res.json({ token: issueToken(user), user: safeUser(user) });
}));

router.get("/me", requireAuth, asyncHandler(async (req, res) => {
  res.json({ user: safeUser(req.user) });
}));

export default router;
