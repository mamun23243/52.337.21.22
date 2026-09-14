import { useEffect, useState } from "react";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  Activity, BarChart3, Bell, Building2, ChevronLeft, ChevronRight, ClipboardList,
  CreditCard, FileText, LayoutDashboard, LogOut, Menu, Moon, Search, Settings,
  Shield, Sun, UserRound, Users, X, UserCog
} from "lucide-react";
import { api } from "./api";
import type { Dashboard, User } from "./types";

function getStoredUser(): User | null {
  try { return JSON.parse(localStorage.getItem("ms_user") || "null"); } catch { return null; }
}

function Login() {
  const nav = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!identifier || !password) return setError("Username/email and password are required.");
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", {
        identifier,
        email: identifier,
        username: identifier,
        password,
        remember
      });
      if (data.user) {
        localStorage.setItem("ms_user", JSON.stringify(data.user));
      }
      const user = data.user as User;
      nav(user?.role === "USER" ? "/user/dashboard" : "/admin/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-glow glow-a" />
      <div className="login-glow glow-b" />
      <form className="login-card" onSubmit={submit}>
        <div className="brand-mark"><Shield size={30} /></div>
        <div className="eyebrow">SECURE ACCESS</div>
        <h1>Account Login</h1>
        <p className="muted">Sign in to your management portal</p>

        {error && <div className="alert error">{error}</div>}

        <label>Username or Email</label>
        <input value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="Enter username or email" autoComplete="username" />

        <label>Password</label>
        <div className="password-wrap">
          <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" autoComplete="current-password" />
          <button type="button" className="ghost-icon" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
        </div>

        <div className="login-options">
          <label className="check"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Remember me</label>
          <span className="linkish">Forgot password?</span>
        </div>

        <button className="primary big" disabled={loading}>{loading ? "Signing in..." : "LOGIN"}</button>
        <div className="login-foot">Protected management system • Secure session</div>
      </form>
    </div>
  );
}

const menu = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/staff", label: "Staff", icon: UserCog },
  { to: "/admin/departments", label: "Departments", icon: Building2 },
  { to: "/admin/records", label: "Records", icon: ClipboardList },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/activity-logs", label: "Activity Logs", icon: Activity },
  { to: "/admin/profile", label: "Profile", icon: UserRound },
  { to: "/admin/settings", label: "Settings", icon: Settings }
];

function Shell({ children }: { children: React.ReactNode }) {
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(true);
  const [dark, setDark] = useState(localStorage.getItem("ms_theme") === "dark");
  const user = getStoredUser();

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("ms_theme", dark ? "dark" : "light");
  }, [dark]);

  async function logout() {
    try { await api.post("/api/auth/logout"); } catch {}
    localStorage.removeItem("ms_user");
    nav("/login", { replace: true });
  }

  const title = menu.find(m => loc.pathname === m.to)?.label || "Dashboard";

  return (
    <div className="app-shell">
      <aside className={"sidebar " + (open ? "" : "collapsed")}>
        <div className="sidebar-brand">
          <div className="brand-mini"><Shield size={22} /></div>
          {open && <div><strong>Management</strong><span>CONTROL PANEL</span></div>}
          <button className="collapse-btn" onClick={() => setOpen(!open)}>{open ? <ChevronLeft /> : <ChevronRight />}</button>
        </div>

        <div className="profile-mini">
          <div className="avatar">{(user?.name || user?.username || "A").slice(0,1).toUpperCase()}</div>
          {open && <div><strong>{user?.name || user?.username || "Administrator"}</strong><span>{user?.role || "ADMIN"}</span></div>}
        </div>

        <nav className="side-nav">
          {menu.map(item => {
            const Icon = item.icon;
            return <NavLink key={item.to} to={item.to} className={({isActive}) => "nav-item " + (isActive ? "active" : "")}>
              <Icon size={19} /> {open && <span>{item.label}</span>}
            </NavLink>;
          })}
        </nav>

        <button className="nav-item logout" onClick={logout}><LogOut size={19}/>{open && <span>Logout</span>}</button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="top-left">
            <button className="mobile-menu" onClick={() => setOpen(!open)}><Menu /></button>
            <div><span className="crumb">Admin Portal</span><h2>{title}</h2></div>
          </div>
          <div className="top-actions">
            <div className="search"><Search size={17}/><input placeholder="Search..." /></div>
            <button className="icon-btn" onClick={() => setDark(!dark)}>{dark ? <Sun size={19}/> : <Moon size={19}/>}</button>
            <button className="icon-btn"><Bell size={19}/><i /></button>
            <div className="top-user">{(user?.name || user?.username || "A").slice(0,1).toUpperCase()}</div>
          </div>
        </header>
        <section className="content">{children}</section>
      </main>
    </div>
  );
}

function Protected({ children, userOnly=false }: { children: React.ReactNode, userOnly?: boolean }) {
  const user = getStoredUser();
  if (!user) return <Navigate to="/login" replace />;
  if (userOnly && user.role !== "USER") return <Navigate to="/admin/dashboard" replace />;
  if (!userOnly && user.role === "USER") return <Navigate to="/user/dashboard" replace />;
  return <Shell>{children}</Shell>;
}

function StatCard({ title, value, icon: Icon, tone }: any) {
  return <div className={"stat-card " + tone}><div className="stat-icon"><Icon size={22}/></div><div><span>{title}</span><strong>{value}</strong></div></div>;
}

function AdminDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/dashboard").then(r => setData(r.data.data || r.data)).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  const d = data || { totalUsers: 0, activeUsers: 0, inactiveUsers: 0, totalStaff: 0, departments: 0, todaysActivity: 0, pendingItems: 0, systemStatus: "Online", recentActivity: [] };

  return <div>
    <div className="page-heading"><div><h1>Dashboard</h1><p>Overview of your management system</p></div><div className="status-pill"><span/> System {d.systemStatus}</div></div>
    {loading && <div className="loading-card">Loading live dashboard data...</div>}
    <div className="stats-grid">
      <StatCard title="Total Users" value={d.totalUsers} icon={Users} tone="blue"/>
      <StatCard title="Active Users" value={d.activeUsers} icon={UserRound} tone="green"/>
      <StatCard title="Inactive Users" value={d.inactiveUsers} icon={Shield} tone="amber"/>
      <StatCard title="Total Staff" value={d.totalStaff} icon={UserCog} tone="purple"/>
      <StatCard title="Departments" value={d.departments} icon={Building2} tone="cyan"/>
      <StatCard title="Today's Activity" value={d.todaysActivity} icon={Activity} tone="rose"/>
      <StatCard title="Pending Items" value={d.pendingItems} icon={ClipboardList} tone="orange"/>
      <StatCard title="System Status" value={d.systemStatus} icon={Shield} tone="green"/>
    </div>

    <div className="dashboard-grid">
      <div className="panel large">
        <div className="panel-head"><div><h3>Activity Overview</h3><span>Recent administrative activity</span></div><BarChart3 size={20}/></div>
        <div className="bars">
          {[38,55,42,72,60,83,66,91,75,88,70,96].map((n,i)=><div className="bar-col" key={i}><div className="bar" style={{height:n+"%"}}/><small>{i+1}</small></div>)}
        </div>
      </div>
      <div className="panel">
        <div className="panel-head"><div><h3>Quick Actions</h3><span>Common management tasks</span></div></div>
        <div className="quick-actions">
          <NavLink to="/admin/users"><Users/> Manage Users</NavLink>
          <NavLink to="/admin/staff"><UserCog/> Manage Staff</NavLink>
          <NavLink to="/admin/reports"><BarChart3/> View Reports</NavLink>
          <NavLink to="/admin/settings"><Settings/> System Settings</NavLink>
        </div>
      </div>
    </div>

    <div className="panel">
      <div className="panel-head"><div><h3>Recent Activity</h3><span>Live records from the database</span></div><Activity size={20}/></div>
      <div className="table-wrap">
        <table><thead><tr><th>User</th><th>Action</th><th>Description</th><th>IP</th><th>Date</th></tr></thead>
        <tbody>
          {d.recentActivity?.length ? d.recentActivity.map(a => <tr key={a.id}><td>{a.user || "System"}</td><td><span className="tag">{a.action}</span></td><td>{a.description}</td><td>{a.ipAddress || "—"}</td><td>{new Date(a.createdAt).toLocaleString()}</td></tr>) : <tr><td colSpan={5} className="empty">No activity records yet.</td></tr>}
        </tbody></table>
      </div>
    </div>
  </div>;
}

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ username:"", email:"", name:"", password:"", role:"USER" });
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const r = await api.get("/api/users");
      const value = r.data.data || r.data.users || r.data;
      setUsers(Array.isArray(value) ? value : []);
    } catch {}
  }
  useEffect(() => { load(); }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault(); setMessage("");
    try {
      await api.post("/api/users", form);
      setShowAdd(false); setForm({username:"",email:"",name:"",password:"",role:"USER"});
      setMessage("User created successfully."); load();
    } catch (err:any) { setMessage(err?.response?.data?.message || "Could not create user."); }
  }

  async function toggle(u: User) {
    try { await api.put(`/api/users/${u.id}`, { status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }); load(); }
    catch {}
  }

  async function remove(u: User) {
    if (!confirm(`Delete ${u.username || u.email}?`)) return;
    try { await api.delete(`/api/users/${u.id}`); load(); } catch {}
  }

  const filtered = users.filter(u => `${u.username||""} ${u.email} ${u.name||""}`.toLowerCase().includes(search.toLowerCase()));

  return <div>
    <div className="page-heading"><div><h1>User Management</h1><p>Create accounts, activate users and control access.</p></div><button className="primary" onClick={() => setShowAdd(true)}>+ Add User</button></div>
    {message && <div className="alert success">{message}</div>}
    <div className="panel">
      <div className="toolbar"><div className="search wide"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users..." /></div><span className="muted">{filtered.length} users</span></div>
      <div className="table-wrap"><table><thead><tr><th>Username</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
      <tbody>{filtered.map(u=><tr key={u.id}><td><strong>{u.username || "—"}</strong></td><td>{u.name || "—"}</td><td>{u.email}</td><td><span className="tag">{u.role}</span></td><td><span className={"status "+(u.status==="ACTIVE"?"on":"off")}>{u.status || "UNKNOWN"}</span></td><td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}</td><td><div className="actions"><button onClick={()=>toggle(u)}>{u.status==="ACTIVE"?"Deactivate":"Activate"}</button><button className="danger-text" onClick={()=>remove(u)}>Delete</button></div></td></tr>)}</tbody></table></div>
    </div>
    {showAdd && <div className="modal-backdrop"><form className="modal" onSubmit={createUser}><div className="modal-head"><h3>Create User</h3><button type="button" onClick={()=>setShowAdd(false)}><X/></button></div>
      <div className="form-grid"><div><label>Username</label><input required value={form.username} onChange={e=>setForm({...form,username:e.target.value})}/></div><div><label>Full Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div><div><label>Email</label><input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div><div><label>Password</label><input type="password" required minLength={8} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div><div><label>Role</label><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option>USER</option><option>STAFF</option><option>MANAGER</option><option>ADMIN</option></select></div></div>
      <div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowAdd(false)}>Cancel</button><button className="primary">Create User</button></div>
    </form></div>}
  </div>;
}

function GenericPage({title, subtitle, icon: Icon}: any) {
  return <div><div className="page-heading"><div><h1>{title}</h1><p>{subtitle}</p></div></div><div className="empty-page"><Icon size={48}/><h2>{title}</h2><p>This module is wired into the protected admin navigation. Connect its CRUD endpoints when its backend module is enabled.</p></div></div>;
}

function UserDashboard() {
  const user=getStoredUser();
  return <div><div className="page-heading"><div><h1>Welcome, {user?.name || user?.username || "User"}</h1><p>Your account dashboard</p></div></div><div className="stats-grid"><StatCard title="Account Status" value={user?.status || "ACTIVE"} icon={Shield} tone="green"/><StatCard title="Role" value={user?.role || "USER"} icon={UserRound} tone="blue"/><StatCard title="Department" value={user?.department || "—"} icon={Building2} tone="purple"/></div><div className="panel"><div className="panel-head"><div><h3>Your account</h3><span>Basic account information</span></div></div><div className="account-grid"><div><span>Name</span><strong>{user?.name || "—"}</strong></div><div><span>Username</span><strong>{user?.username || "—"}</strong></div><div><span>Email</span><strong>{user?.email || "—"}</strong></div><div><span>Role</span><strong>{user?.role || "USER"}</strong></div></div></div></div>;
}

function App() {
  return <Routes>
    <Route path="/login" element={<Login/>}/>
    <Route path="/" element={<Navigate to="/login" replace/>}/>
    <Route path="/admin/dashboard" element={<Protected><AdminDashboard/></Protected>}/>
    <Route path="/admin/users" element={<Protected><UsersPage/></Protected>}/>
    <Route path="/admin/staff" element={<Protected><GenericPage title="Staff Management" subtitle="Manage staff and employee records." icon={UserCog}/></Protected>}/>
    <Route path="/admin/departments" element={<Protected><GenericPage title="Departments" subtitle="Manage departments and managers." icon={Building2}/></Protected>}/>
    <Route path="/admin/records" element={<Protected><GenericPage title="Records" subtitle="Search, filter and manage system records." icon={ClipboardList}/></Protected>}/>
    <Route path="/admin/reports" element={<Protected><GenericPage title="Reports" subtitle="Generate reports and export operational data." icon={FileText}/></Protected>}/>
    <Route path="/admin/notifications" element={<Protected><GenericPage title="Notifications" subtitle="Review system notifications." icon={Bell}/></Protected>}/>
    <Route path="/admin/activity-logs" element={<Protected><GenericPage title="Activity Logs" subtitle="Review the administrative audit trail." icon={Activity}/></Protected>}/>
    <Route path="/admin/profile" element={<Protected><GenericPage title="Profile" subtitle="Manage your account profile." icon={UserRound}/></Protected>}/>
    <Route path="/admin/settings" element={<Protected><GenericPage title="Settings" subtitle="Configure system and security settings." icon={Settings}/></Protected>}/>
    <Route path="/user/dashboard" element={<Protected userOnly><UserDashboard/></Protected>}/>
    <Route path="*" element={<Navigate to="/login" replace/>}/>
  </Routes>;
}

export default App;
