import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Check, Circle, MessageSquare, Plus, Search, SlidersHorizontal, Trash2, UserRound, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../api.js";
import Modal from "../components/Modal.jsx";

const initial = { title: "", description: "", status: "todo", priority: "medium", dueDate: "" };

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(initial);
  const [commentsTask, setCommentsTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadTasks = () => {
    const params = new URLSearchParams({ page, limit: 10, sortBy: "createdAt", order: "desc" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    api.get(`/projects/${projectId}/tasks?${params}`).then(({ data }) => { setTasks(data.tasks); setPages(Math.max(1, data.pagination.pages)); }).catch(err => setError(err.response?.data?.message || "Could not load tasks."));
  };

  useEffect(() => { api.get(`/projects/${projectId}`).then(({ data }) => setProject(data.project)).catch(() => setError("Could not load this project.")); }, [projectId]);
  useEffect(() => { loadTasks(); }, [projectId, page, status, priority, search]);

  const createTask = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      await api.post(`/projects/${projectId}/tasks`, { ...form, dueDate: form.dueDate || null });
      setShowCreate(false); setForm(initial); loadTasks();
    } catch (err) { setError(err.response?.data?.message || "Could not create task."); }
    finally { setBusy(false); }
  };

  const updateTask = async (task, patch) => {
    try {
      const { data } = await api.patch(`/tasks/${task._id}`, patch);
      setTasks(tasks.map(t => t._id === task._id ? { ...t, ...data.task } : t));
    } catch (err) { setError(err.response?.data?.message || "Could not update task."); }
  };

  const deleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    try { await api.delete(`/tasks/${task._id}`); loadTasks(); }
    catch (err) { setError(err.response?.data?.message || "Could not delete task."); }
  };

  const openComments = async (task) => {
    setCommentsTask(task); setCommentBody("");
    try { const { data } = await api.get(`/tasks/${task._id}/comments`); setComments(data.comments); }
    catch { setComments([]); }
  };

  const addComment = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/tasks/${commentsTask._id}/comments`, { body: commentBody });
      setComments([...comments, data.comment]); setCommentBody("");
    } catch (err) { setError(err.response?.data?.message || "Could not add comment."); }
  };

  if (!project) return <div className="page-loading">{error || "Loading project…"}</div>;

  return <div className="detail-page">
    <Link to="/app/projects" className="back-link"><ArrowLeft size={16}/> All projects</Link>
    <div className="page-heading detail-heading"><div><span className="eyebrow">PROJECT WORKSPACE</span><h1>{project.name}</h1><p>{project.description || "Plan, collaborate, and keep the work moving."}</p></div><button className="button primary" onClick={() => setShowCreate(true)}><Plus size={17}/> Add task</button></div>
    {error && <div className="inline-error">{error}<button onClick={() => setError("")} aria-label="Dismiss error"><X size={14}/></button></div>}
    <div className="task-toolbar"><div className="search-box"><Search size={16}/><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search tasks…" aria-label="Search tasks"/></div><div className="filter-controls"><select aria-label="Filter status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option><option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option></select><select aria-label="Filter priority" value={priority} onChange={e => { setPriority(e.target.value); setPage(1); }}><option value="">All priorities</option><option value="high">High priority</option><option value="medium">Medium priority</option><option value="low">Low priority</option></select></div></div>
    <div className="task-table-wrap"><table className="task-table"><thead><tr><th>Task</th><th>Status</th><th>Priority</th><th>Due date</th><th>Discussion</th><th></th></tr></thead><tbody>{tasks.map(task => <tr key={task._id}><td><div className="table-task-title"><span className={`task-status ${task.status}`}><Circle size={16}/></span><div><strong>{task.title}</strong>{task.description && <small>{task.description}</small>}</div></div></td><td><select className={`status-select ${task.status}`} aria-label={`Status for ${task.title}`} value={task.status} onChange={e => updateTask(task, { status: e.target.value })}><option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option></select></td><td><select className={`priority-select ${task.priority}`} aria-label={`Priority for ${task.title}`} value={task.priority} onChange={e => updateTask(task, { priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></td><td><span className="due-date"><CalendarDays size={14}/>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</span></td><td><button className="comment-button" onClick={() => openComments(task)}><MessageSquare size={15}/> Discuss</button></td><td><button className="icon-button danger-icon" title="Delete task" onClick={() => deleteTask(task)}><Trash2 size={15}/></button></td></tr>)}</tbody></table>
      {!tasks.length && <div className="empty-state table-empty"><div className="empty-icon"><Check size={22}/></div><strong>No tasks found</strong><p>Add a task or adjust your filters.</p><button className="button secondary" onClick={() => setShowCreate(true)}><Plus size={15}/> Add task</button></div>}
    </div>
    <div className="pagination"><span>Page {page} of {pages}</span><div><button className="button secondary small-button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><button className="button secondary small-button" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></div></div>

    {showCreate && <Modal title="Add a task" onClose={() => setShowCreate(false)}><form className="form-stack modal-form" onSubmit={createTask}><label>Task title<input autoFocus value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="What needs to get done?" minLength="2" maxLength="180" required/></label><label>Description <span className="optional">(optional)</span><textarea rows="2" value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Add a little context…" maxLength="4000"/></label><div className="form-row"><label>Priority<select value={form.priority} onChange={e => setForm({...form, priority:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Due date<input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate:e.target.value})}/></label></div><div className="modal-actions"><button type="button" className="button secondary" onClick={() => setShowCreate(false)}>Cancel</button><button className="button primary" disabled={busy}>{busy ? "Adding…" : "Add task"} <Plus size={16}/></button></div></form></Modal>}

    {commentsTask && <Modal title={`Discussion · ${commentsTask.title}`} onClose={() => setCommentsTask(null)}><div className="comments-list">{comments.length ? comments.map(c => <div className="comment" key={c._id}><div className="avatar small">{(c.author?.name || "?")[0].toUpperCase()}</div><div><strong>{c.author?.name || "Member"}</strong><small>{new Date(c.createdAt).toLocaleString()}</small><p>{c.body}</p></div></div>) : <p className="muted-copy">No comments yet. Start the conversation.</p>}</div><form className="comment-form" onSubmit={addComment}><textarea rows="2" value={commentBody} onChange={e => setCommentBody(e.target.value)} placeholder="Write a comment…" required maxLength="2000"/><button className="button primary" disabled={!commentBody.trim()}><MessageSquare size={15}/> Comment</button></form></Modal>}
  </div>;
}
