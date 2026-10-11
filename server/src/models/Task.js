import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, trim: true, maxlength: 4000, default: "" },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo", index: true },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium", index: true },
  dueDate: { type: Date, default: null }
}, { timestamps: true });

taskSchema.index({ project: 1, status: 1, priority: 1, dueDate: 1 });
taskSchema.index({ project: 1, title: "text", description: "text" });
export default mongoose.model("Task", taskSchema);
