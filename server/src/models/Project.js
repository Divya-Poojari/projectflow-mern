import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 2000, default: "" },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["planning", "active", "completed", "on-hold"], default: "active" },
  color: { type: String, default: "#6759e8", match: /^#[0-9A-Fa-f]{6}$/ }
}, { timestamps: true });

projectSchema.index({ workspace: 1, updatedAt: -1 });
export default mongoose.model("Project", projectSchema);
