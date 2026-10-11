import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Activity, FolderKanban, LayoutDashboard, LogOut, Plus, Settings, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.name || "PF").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Sparkles size={19}/></div><span>projectflow</span></div>
      <div className="workspace-switch"><div className="workspace-icon">P</div><div><strong>Personal workspace</strong><small>Free plan</small></div><span className="chevron">⌄</span></div>
      <div className="nav-label">WORKSPACE</div>
      <nav className="main-nav">
        <NavLink to="/app" end><LayoutDashboard size={17}/> Overview</NavLink>
        <NavLink to="/app/projects"><FolderKanban size={17}/> Projects</NavLink>
      </nav>
      <div className="sidebar-bottom">
        <div className="nav-label">WORKSPACE</div>
        <a href="https://github.com" target="_blank" rel="noreferrer"><Activity size={17}/> GitHub</a>
        <div className="user-card"><div className="avatar">{initials}</div><div className="user-meta"><strong>{user?.name}</strong><small>{user?.email}</small></div><button className="icon-button" title="Log out" onClick={() => { logout(); navigate("/login"); }}><LogOut size={16}/></button></div>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div><div className="topbar-right"><span className="status-dot"/> All systems operational <div className="avatar small">{initials}</div></div></header>
      <div className="content"><Outlet /></div>
    </main>
  </div>;
}
