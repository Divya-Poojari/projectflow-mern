import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["owner", "member"], default: "member" },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  members: { type: [memberSchema], default: [] }
}, { timestamps: true });

workspaceSchema.index({ "members.user": 1, updatedAt: -1 });

export default mongoose.model("Workspace", workspaceSchema);
