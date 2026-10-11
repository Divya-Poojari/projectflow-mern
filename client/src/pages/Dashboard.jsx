import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Circle, Clock3, FolderKanban, Plus, Search, Sparkles, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api.js";
import Modal from "../components/Modal.jsx";

const emptyForm = { name: "", description: "" };

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [projects, setProjects] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, todo: 0, inProgress: 0, done: 0, highPriority: 0 });
  const [tasks, setTasks] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get("/workspaces").then(({ data }) => {
    setWorkspaces(data.workspaces);
    if (data.workspaces[0]) setWorkspaceId(data.workspaces[0].id);
  }).catch(() => setError("Unable to load workspace.")); }, []);

  useEffect(() => {
    if (!workspaceId) return;
    Promise.all([
      api.get(`/workspaces/${workspaceId}/projects`),
      api.get(`/dashboard?workspaceId=${workspaceId}`).catch(() => api.get(`/dashboard?workspaceId=${workspaceId}`))
    ]).then(([p, m]) => {
      setProjects(p.data.projects);
      setMetrics(m.data.metrics);
    }).catch(() => {});
  }, [workspaceId]);

  useEffect(() => {
    if (!projects.length) { setTasks([]); return; }
    api.get(`/projects/${projects[0]._id}/tasks?limit=5&sortBy=createdAt&order=desc`)
      .then(({ data }) => setTasks(data.tasks)).catch(() => setTasks([]));
  }, [projects]);

  const createProject = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const { data } = await api.post("/projects", { ...form, workspaceId });
      setProjects([data.project, ...projects]); setShowCreate(false); setForm(emptyForm);
    } catch (err) { setError(err.response?.data?.message || "Could not create project."); }
    finally { setBusy(false); }
  };

  const cards = [
    { label: "Total tasks", value: metrics.total, note: "Across your workspace", icon: Circle, tone: "purple" },
    { label: "In progress", value: metrics.inProgress, note: "Work underway", icon: Clock3, tone: "blue" },
    { label: "Completed", value: metrics.done, note: metrics.total ? `${Math.round(metrics.done / metrics.total * 100)}% of all tasks` : "Ready when you are", icon: CheckCircle2, tone: "green" },
    { label: "High priority", value: metrics.highPriority, note: "Needs attention", icon: Target, tone: "orange" }
  ];

  return <div className="dashboard-page">
    <div className="page-heading"><div><span className="eyebrow">MONDAY, LET'S MAKE IT COUNT</span><h1>Good things are in motion <span className="wave">✳</span></h1><p>Here's what's happening across your workspace.</p></div><button className="button primary" onClick={() => setShowCreate(true)}><Plus size={17}/> New project</button></div>
    {error && <div className="inline-error">{error}</div>}
    <section className="welcome-banner"><div className="welcome-copy"><span className="banner-tag"><Sparkles size={13}/> YOUR WORKSPACE, AT A GLANCE</span><h2>Make space for<br/>your best work.</h2><p>Every big result starts with a clear next step.<br/>Let's find yours.</p><button className="button white" onClick={() => setShowCreate(true)}>Create a project <ArrowUpRight size={16}/></button></div><div className="banner-art"><div className="art-circle circle-a"/><div className="art-circle circle-b"/><div className="art-card art-card-one"><div className="art-card-icon"><CheckCircle2 size={16}/></div><div><strong>Design review</strong><small>Completed just now</small></div><span className="art-check">✓</span></div><div className="art-card art-card-two"><div className="art-progress"><span/></div><div><strong>Product launch</strong><small>Progress · 68%</small></div><div className="mini-avatars"><i>A</i><i>M</i><i>+</i></div></div><div className="art-spark">✳</div></div></section>
    <div className="section-heading"><div><h2>Workspace pulse</h2><p>A little snapshot of your progress.</p></div><select className="select-small" value={workspaceId} onChange={e => setWorkspaceId(e.target.value)} aria-label="Select workspace">{workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
    <section className="stats-grid">{cards.map(card => <article className="stat-card" key={card.label}><div className="stat-top"><span>{card.label}</span><div className={`stat-icon ${card.tone}`}><card.icon size={17}/></div></div><div className="stat-value">{card.value}</div><div className="stat-note">{card.note}</div></article>)}</section>
    <section className="lower-grid"><article className="panel projects-panel"><div className="panel-heading"><div><h2>Your projects</h2><p>Keep the big picture in view.</p></div><Link to="/app/projects" className="text-link">View all <ArrowUpRight size={15}/></Link></div>
      {projects.length ? <div className="project-list">{projects.slice(0, 4).map((p, i) => <Link className="project-row" to={`/app/projects/${p._id}`} key={p._id}><div className={`project-symbol color-${i % 4}`}><FolderKanban size={18}/></div><div className="project-info"><strong>{p.name}</strong><small>{p.description || "No description yet"}</small></div><span className={`pill ${p.status}`}>{p.status}</span><ArrowUpRight className="row-arrow" size={16}/></Link>)}</div> : <div className="empty-state"><div className="empty-icon"><FolderKanban size={23}/></div><strong>Your next great project starts here.</strong><p>Create a project to organize tasks and track progress.</p><button className="button secondary" onClick={() => setShowCreate(true)}><Plus size={16}/> Create project</button></div>}
    </article>
    <article className="panel tasks-panel"><div className="panel-heading"><div><h2>Recently created tasks</h2><p>A quick look at what's on the list.</p></div><div className="heading-icon"><Clock3 size={17}/></div></div>
      {tasks.length ? <div className="task-list">{tasks.map(t => <div className="task-row" key={t._id}><span className={`task-status ${t.status}`}><Circle size={17}/></span><div className="task-info"><strong>{t.title}</strong><small>{t.dueDate ? `Due ${new Date(t.dueDate).toLocaleDateString()}` : "No due date"}</small></div><span className={`priority ${t.priority}`}>{t.priority}</span></div>)}</div> : <div className="empty-state compact"><div className="empty-icon"><CheckCircle2 size={22}/></div><strong>Nothing on the list yet</strong><p>Create a project, then add your first task.</p></div>}
    </article></section>
    {showCreate && <Modal title="Create a project" onClose={() => { setShowCreate(false); setError(""); }}><form className="form-stack modal-form" onSubmit={createProject}><label>Project name<input autoFocus value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="e.g. Website redesign" minLength="2" maxLength="120" required/></label><label>Description <span className="optional">(optional)</span><textarea rows="3" value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="What are you building?" maxLength="2000"/></label>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="button secondary" onClick={() => setShowCreate(false)}>Cancel</button><button className="button primary" disabled={busy || !workspaceId}>{busy ? "Creating…" : "Create project"} <Plus size={16}/></button></div></form></Modal>}
  </div>;
}
