import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthPage({ mode = "login" }) {
  const isRegister = mode === "register";
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/app" replace />;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
      navigate("/app");
    } catch (err) {
      setError(err.response?.data?.message || "Could not connect. Check that the API is running.");
    } finally { setBusy(false); }
  };

  return <div className="auth-page">
    <div className="auth-decoration"><div className="auth-orb orb-one"/><div className="auth-orb orb-two"/><div className="auth-brand"><div className="brand-mark"><Sparkles size={20}/></div> projectflow</div><div className="auth-quote"><span className="eyebrow light">PLAN BETTER. SHIP FASTER.</span><h1>Good work happens<br/>in a state of <em>flow.</em></h1><p>One calm place to plan projects, bring your team together, and make meaningful progress.</p><div className="quote-footer"><div className="avatar-stack"><span>D</span><span>A</span><span>M</span></div><small>Built for teams that make things happen.</small></div></div><div className="auth-decoration-footer">A little more clarity. A lot more momentum.</div></div>
    <div className="auth-form-side"><div className="auth-mobile-brand"><div className="brand-mark"><Sparkles size={19}/></div> projectflow</div><div className="auth-form-wrap"><span className="eyebrow">{isRegister ? "GET STARTED FOR FREE" : "WELCOME BACK"}</span><h2>{isRegister ? "Create your account" : "Sign in to ProjectFlow"}</h2><p className="auth-subtitle">{isRegister ? "Start turning your team's plans into progress." : "Your projects are waiting right where you left them."}</p>
      <form onSubmit={submit} className="form-stack">
        {isRegister && <label>Full name<input name="name" value={form.name} onChange={change} placeholder="Alex Morgan" required minLength="2" maxLength="80"/></label>}
        <label>Email address<input name="email" type="email" value={form.email} onChange={change} placeholder="you@company.com" required autoComplete="email"/></label>
        <label>Password<input name="password" type="password" value={form.password} onChange={change} placeholder={isRegister ? "At least 8 characters" : "Enter your password"} required minLength={isRegister ? 8 : 1} autoComplete={isRegister ? "new-password" : "current-password"}/></label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="button primary full" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"} <ArrowRight size={17}/></button>
      </form>
      <p className="auth-switch">{isRegister ? "Already have an account?" : "New to ProjectFlow?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p><p className="terms">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
    </div></div>
  </div>;
}
