import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";

export default function App() {
  return <Routes>
    <Route path="/" element={<Navigate to="/app" replace/>}/>
    <Route path="/login" element={<AuthPage mode="login"/>}/>
    <Route path="/register" element={<AuthPage mode="register"/>}/>
    <Route element={<ProtectedRoute/>}>
      <Route path="/app" element={<Layout/>}>
        <Route index element={<Dashboard/>}/>
        <Route path="projects" element={<Projects/>}/>
        <Route path="projects/:projectId" element={<ProjectDetail/>}/>
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/app" replace/>}/>
  </Routes>;
}
