import Workspace from "../models/Workspace.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { HttpError } from "../utils/httpError.js";

export async function getWorkspaceForMember(workspaceId, userId) {
  const workspace = await Workspace.findOne({ _id: workspaceId, "members.user": userId });
  if (!workspace) throw new HttpError(404, "Workspace not found");
  return workspace;
}

export async function getWorkspaceOwner(workspaceId, userId) {
  const workspace = await Workspace.findOne({ _id: workspaceId, owner: userId });
  if (!workspace) throw new HttpError(403, "Workspace owner permission required");
  return workspace;
}

export async function getProjectForMember(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) throw new HttpError(404, "Project not found");
  await getWorkspaceForMember(project.workspace, userId);
  return project;
}

export async function getTaskForMember(taskId, userId) {
  const task = await Task.findById(taskId);
  if (!task) throw new HttpError(404, "Task not found");
  const project = await getProjectForMember(task.project, userId);
  return { task, project };
}
