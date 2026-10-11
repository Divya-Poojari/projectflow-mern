import { useEffect, useState } from "react";
import { FolderKanban, Plus, Search, ArrowUpRight, CircleDot } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api.js";
import Modal from "../components/Modal.jsx";

export default function Projects() {
  const [workspaceId, setWorkspaceId] = useState("");
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get("/workspaces").then(({ data }) => {
    const w = data.workspaces[0];
    if (w) setWorkspaceId(w.id);
  }).catch(() => setError("Unable to load workspaces.")); }, []);

  useEffect(() => { if (workspaceId) api.get(`/workspaces/${workspaceId}/projects`).then(({ data }) => setProjects(data.projects)).catch(() => setError("Unable to load projects.")); }, [workspaceId]);

  const createProject = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const { data } = await api.post("/projects", { ...form, workspaceId });
      setProjects([data.project, ...projects]); setShowCreate(false); setForm({ name: "", description: "" });
    } catch (err) { setError(err.response?.data?.message || "Could not create project."); }
    finally { setBusy(false); }
  };

  const filtered = projects.filter(p => `${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase()));

  return <div className="projects-page">
    <div className="page-heading"><div><span className="eyebrow">YOUR WORK, ORGANIZED</span><h1>Projects</h1><p>All your team's ambitions, in one place.</p></div><button className="button primary" onClick={() => setShowCreate(true)}><Plus size={17}/> New project</button></div>
    {error && <div className="inline-error">{error}</div>}
    <div className="project-toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…" aria-label="Search projects"/></div><span className="result-count">{filtered.length} {filtered.length === 1 ? "project" : "projects"}</span></div>
    {filtered.length ? <div className="projects-grid">{filtered.map((p, i) => <Link to={`/app/projects/${p._id}`} className="project-card" key={p._id}><div className="project-card-top"><div className={`project-symbol large color-${i % 4}`}><FolderKanban size={20}/></div><span className={`pill ${p.status}`}>{p.status}</span></div><h3>{p.name}</h3><p>{p.description || "A new project, full of possibility."}</p><div className="project-card-footer"><span><CircleDot size={14}/> Updated {new Date(p.updatedAt).toLocaleDateString()}</span><ArrowUpRight size={17}/></div></Link>)}</div> : <div className="empty-state page-empty"><div className="empty-icon"><FolderKanban size={24}/></div><strong>{search ? "No matching projects" : "Your project space is full of potential."}</strong><p>{search ? "Try a different search term." : "Create your first project and give your ideas a home."}</p>{!search && <button className="button primary" onClick={() => setShowCreate(true)}><Plus size={16}/> Create project</button>}</div>}
    {showCreate && <Modal title="Create a project" onClose={() => setShowCreate(false)}><form className="form-stack modal-form" onSubmit={createProject}><label>Project name<input autoFocus value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="e.g. Website redesign" minLength="2" maxLength="120" required/></label><label>Description <span className="optional">(optional)</span><textarea rows="3" value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="What are you building?" maxLength="2000"/></label>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="button secondary" onClick={() => setShowCreate(false)}>Cancel</button><button className="button primary" disabled={busy || !workspaceId}>{busy ? "Creating…" : "Create project"} <Plus size={16}/></button></div></form></Modal>}
  </div>;
}
