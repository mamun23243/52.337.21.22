import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";

/* =========================================================
   CONFIG
========================================================= */

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://523372122-production.up.railway.app";

/*
  IMPORTANT:
  এখানে তোমার আসল Adsterra / Monetag code বসাবে।
  Fake code ব্যবহার করলে ad show করবে না.
*/

const ADSTERRA_CODE = `
  <!-- PASTE YOUR REAL ADSTERRA CODE HERE -->
`;

const MONETAG_CODE = `
  <!-- PASTE YOUR REAL MONETAG CODE HERE -->
`;

/* =========================================================
   TYPES
========================================================= */

type User = {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
};

/* =========================================================
   HELPERS
========================================================= */

function getUser(): User | null {
  try {
    const value = localStorage.getItem("user");
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return Boolean(localStorage.getItem("token"));
}

/* =========================================================
   AD COMPONENT
========================================================= */

function AdSlot({
  provider,
  code,
}: {
  provider: "adsterra" | "monetag";
  code: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !code.trim()) return;

    ref.current.innerHTML = "";

    const doc = new DOMParser().parseFromString(code, "text/html");

    Array.from(doc.body.childNodes).forEach((node) => {
      if (node.nodeName.toLowerCase() === "script") {
        const oldScript = node as HTMLScriptElement;
        const script = document.createElement("script");

        Array.from(oldScript.attributes).forEach((attr) => {
          script.setAttribute(attr.name, attr.value);
        });

        script.textContent = oldScript.textContent || "";

        ref.current?.appendChild(script);
      } else {
        ref.current?.appendChild(node.cloneNode(true));
      }
    });

    return () => {
      if (ref.current) ref.current.innerHTML = "";
    };
  }, [code]);

  return (
    <div
      ref={ref}
      data-ad-provider={provider}
      className="my-8 min-h-[60px] w-full overflow-hidden"
    />
  );
}

/* =========================================================
   PUBLIC NAVBAR
========================================================= */

function Navbar() {
  const navigate = useNavigate();

  const logged = isLoggedIn();
  const user = getUser();

  function goDashboard() {
    if (user?.role === "USER") {
      navigate("/user/dashboard");
    } else {
      navigate("/admin/dashboard");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="text-2xl font-black text-white">
          Management
          <span className="text-blue-500">Pro</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            to="/"
            className="text-slate-300 transition hover:text-white"
          >
            Home
          </Link>

          <Link
            to="/pricing"
            className="text-slate-300 transition hover:text-white"
          >
            Pricing
          </Link>

          <a
            href="#features"
            className="text-slate-300 transition hover:text-white"
          >
            Features
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {logged ? (
            <>
              <button
                onClick={goDashboard}
                className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
              >
                Dashboard
              </button>

              <button
                onClick={logout}
                className="hidden rounded-xl border border-white/10 px-4 py-2 text-slate-300 hover:bg-white/10 sm:block"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-500"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   LANDING PAGE
========================================================= */

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-7 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
              Modern Management Platform
            </div>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              Manage Everything
              <span className="block text-blue-500">
                In One Place
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-400">
              Manage users, staff, departments, records, reports
              and notifications from one powerful management platform.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/login"
                className="rounded-xl bg-blue-600 px-8 py-4 font-bold hover:bg-blue-500"
              >
                Get Started
              </Link>

              <Link
                to="/pricing"
                className="rounded-xl border border-white/15 px-8 py-4 font-bold hover:bg-white/10"
              >
                View Pricing
              </Link>
            </div>
          </div>

          {/* ADSTERRA */}
          <div className="mx-auto mt-16 max-w-5xl">
            <AdSlot
              provider="adsterra"
              code={ADSTERRA_CODE}
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="border-y border-white/10 bg-slate-900/50"
      >
        <div className="mx-auto max-w-7xl px-5 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-black md:text-5xl">
              Powerful Features
            </h2>

            <p className="mt-5 text-slate-400">
              Everything you need to manage your organization.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <Feature
              icon="👥"
              title="User Management"
              text="Create, manage and control user accounts and access."
            />

            <Feature
              icon="🧑‍💼"
              title="Staff Management"
              text="Organize your staff and manage your team efficiently."
            />

            <Feature
              icon="🏢"
              title="Departments"
              text="Keep departments organized and easy to manage."
            />

            <Feature
              icon="📁"
              title="Records"
              text="Store and manage important records from one dashboard."
            />

            <Feature
              icon="📊"
              title="Reports"
              text="Monitor your data and generate useful reports."
            />

            <Feature
              icon="🔔"
              title="Notifications"
              text="Keep users informed with important notifications."
            />
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="text-center">
          <h2 className="text-4xl font-black md:text-5xl">
            Simple Pricing
          </h2>

          <p className="mt-5 text-slate-400">
            Choose the plan that works for you.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-4">
          <PriceCard
            name="Free"
            price="৳0"
            features={[
              "Basic Dashboard",
              "Basic Records",
              "User Account",
            ]}
          />

          <PriceCard
            name="Basic"
            price="৳499"
            popular
            features={[
              "Everything in Free",
              "Reports",
              "Notifications",
              "Advanced Records",
            ]}
          />

          <PriceCard
            name="Business"
            price="৳999"
            features={[
              "Everything in Basic",
              "Staff Management",
              "Departments",
              "Priority Support",
            ]}
          />

          <PriceCard
            name="Professional"
            price="৳1,999"
            features={[
              "Everything in Business",
              "Advanced Reports",
              "Premium Features",
              "Priority Support",
            ]}
          />
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/pricing"
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            See all pricing →
          </Link>
        </div>
      </section>

      {/* MONETAG */}
      <section className="mx-auto max-w-5xl px-5 pb-20">
        <AdSlot
          provider="monetag"
          code={MONETAG_CODE}
        />
      </section>

      {/* CTA */}
      <section className="border-y border-white/10 bg-blue-600">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center">
          <h2 className="text-4xl font-black md:text-5xl">
            Ready to Get Started?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-blue-100">
            Start managing your organization with a modern,
            centralized management system.
          </p>

          <Link
            to="/login"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-4 font-bold text-blue-700 hover:bg-slate-100"
          >
            Start Now
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 py-10 md:flex-row">
          <div>
            <div className="text-xl font-bold">
              Management<span className="text-blue-500">Pro</span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Modern management made simple.
            </p>
          </div>

          <div className="flex gap-6 text-sm text-slate-400">
            <Link to="/pricing">Pricing</Link>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =========================================================
   FEATURE
========================================================= */

function Feature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-7 transition hover:-translate-y-1 hover:border-blue-500/40">
      <div className="text-4xl">{icon}</div>

      <h3 className="mt-5 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-400">
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   PRICING CARD
========================================================= */

function PriceCard({
  name,
  price,
  features,
  popular = false,
}: {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-7 ${
        popular
          ? "border-blue-500 bg-blue-500/10"
          : "border-white/10 bg-slate-900"
      }`}
    >
      {popular && (
        <div className="absolute right-5 top-5 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold">
          POPULAR
        </div>
      )}

      <h3 className="text-xl font-bold">
        {name}
      </h3>

      <div className="mt-6 text-4xl font-black">
        {price}
      </div>

      {price !== "৳0" && (
        <div className="text-sm text-slate-500">
          per month
        </div>
      )}

      <ul className="mt-8 space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="text-sm text-slate-300"
          >
            ✓ {feature}
          </li>
        ))}
      </ul>

      <Link
        to="/login"
        className="mt-8 block rounded-xl bg-blue-600 px-5 py-3 text-center font-bold hover:bg-blue-500"
      >
        Get Started
      </Link>
    </div>
  );
}

/* =========================================================
   PRICING PAGE
========================================================= */

function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="mx-auto max-w-7xl px-5 py-24">
        <div className="text-center">
          <h1 className="text-5xl font-black">
            Choose Your Plan
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Flexible plans designed for individuals, teams and
            growing businesses.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-4">
          <PriceCard
            name="Free"
            price="৳0"
            features={[
              "Basic Dashboard",
              "Basic Records",
              "User Account",
            ]}
          />

          <PriceCard
            name="Basic"
            price="৳499"
            popular
            features={[
              "Everything in Free",
              "Reports",
              "Notifications",
              "Advanced Records",
            ]}
          />

          <PriceCard
            name="Business"
            price="৳999"
            features={[
              "Everything in Basic",
              "Staff Management",
              "Departments",
              "Priority Support",
            ]}
          />

          <PriceCard
            name="Professional"
            price="৳1,999"
            features={[
              "Everything in Business",
              "Advanced Reports",
              "Premium Features",
              "Priority Support",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LOGIN PAGE
========================================================= */

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Login failed"
        );
      }

      const token =
        data.token ||
        data.accessToken ||
        data.access_token;

      const user =
        data.user ||
        data.data?.user;

      if (!token) {
        throw new Error(
          "Login successful হলেও token পাওয়া যায়নি।"
        );
      }

      localStorage.setItem("token", token);

      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );
      }

      const role = user?.role;

      if (role === "USER") {
        navigate("/user/dashboard", {
          replace: true,
        });
      } else {
        navigate("/admin/dashboard", {
          replace: true,
        });
      }
    } catch (err: any) {
      setError(
        err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="text-3xl font-black"
          >
            Management
            <span className="text-blue-500">
              Pro
            </span>
          </Link>

          <h1 className="mt-8 text-3xl font-bold">
            Welcome Back
          </h1>

          <p className="mt-2 text-slate-400">
            Login to your account
          </p>
        </div>

        <form
          onSubmit={login}
          className="rounded-2xl border border-white/10 bg-slate-900 p-7 shadow-2xl"
        >
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-slate-300">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Enter your email"
            required
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
          />

          <label className="mt-5 block text-sm font-medium text-slate-300">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter your password"
            required
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-bold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <Link
            to="/"
            className="mt-5 block text-center text-sm text-slate-400 hover:text-white"
          >
            ← Back to website
          </Link>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   PROTECTED ROUTE
========================================================= */

function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: "ADMIN" | "USER";
}) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  const user = getUser();

  const isAdmin =
    user?.role === "SUPER_ADMIN" ||
    user?.role === "ADMIN";

  const actualRole = isAdmin ? "ADMIN" : "USER";

  if (actualRole !== allowedRole) {
    return (
      <Navigate
        to={
          actualRole === "ADMIN"
            ? "/admin/dashboard"
            : "/user/dashboard"
        }
        replace
      />
    );
  }

  return <>{children}</>;
}

/* =========================================================
   ADMIN PANEL
========================================================= */

function AdminDashboard() {
  const user = getUser();
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <PanelLayout
      title="Admin Dashboard"
      role="ADMIN"
      logout={logout}
    >
      <div className="grid gap-5 md:grid-cols-4">
        <Stat title="Total Users" value="0" />
        <Stat title="Staff" value="0" />
        <Stat title="Records" value="0" />
        <Stat title="Reports" value="0" />
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900 p-7">
        <h2 className="text-2xl font-bold">
          Welcome, {user?.name || user?.username || "Admin"}
        </h2>

        <p className="mt-3 text-slate-400">
          You are logged in as administrator.
        </p>
      </div>
    </PanelLayout>
  );
}

/* =========================================================
   USER PANEL
========================================================= */

function UserDashboard() {
  const user = getUser();
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <PanelLayout
      title="User Dashboard"
      role="USER"
      logout={logout}
    >
      <div className="grid gap-5 md:grid-cols-3">
        <Stat title="My Records" value="0" />
        <Stat title="My Reports" value="0" />
        <Stat title="Notifications" value="0" />
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900 p-7">
        <h2 className="text-2xl font-bold">
          Welcome, {user?.name || user?.username || "User"}
        </h2>

        <p className="mt-3 text-slate-400">
          Welcome to your personal dashboard.
        </p>
      </div>
    </PanelLayout>
  );
}

/* =========================================================
   PANEL LAYOUT
========================================================= */

function PanelLayout({
  title,
  role,
  logout,
  children,
}: {
  title: string;
  role: "ADMIN" | "USER";
  logout: () => void;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  const adminMenu = [
    ["Dashboard", "/admin/dashboard"],
    ["Users", "/admin/users"],
    ["Staff", "/admin/staff"],
    ["Departments", "/admin/departments"],
    ["Records", "/admin/records"],
    ["Reports", "/admin/reports"],
    ["Notifications", "/admin/notifications"],
    ["Settings", "/admin/settings"],
  ];

  const userMenu = [
    ["Dashboard", "/user/dashboard"],
    ["My Profile", "/user/profile"],
    ["My Records", "/user/records"],
    ["My Reports", "/user/reports"],
    ["Notifications", "/user/notifications"],
    ["Settings", "/user/settings"],
  ];

  const menu =
    role === "USER" ? userMenu : adminMenu;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-slate-900 p-5 lg:block">
        <Link
          to="/"
          className="block border-b border-white/10 pb-5 text-2xl font-black"
        >
          Management
          <span className="text-blue-500">
            Pro
          </span>
        </Link>

        <div className="mt-6 space-y-2">
          {menu.map(([label, path]) => (
            <Link
              key={path}
              to={path}
              className="block rounded-xl px-4 py-3 text-slate-300 transition hover:bg-blue-600 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </div>

        <button
          onClick={logout}
          className="absolute bottom-6 left-5 right-5 rounded-xl border border-white/10 px-4 py-3 text-slate-300 hover:bg-red-500/10 hover:text-red-300"
        >
          Logout
        </button>
      </aside>

      <main className="min-h-screen lg:ml-64">
        <header className="border-b border-white/10 bg-slate-950 px-5 py-5 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {title}
            </h1>

            <button
              onClick={() => navigate("/")}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
            >
              Website
            </button>
          </div>
        </header>

        <section className="p-5 md:p-8">
          {children}
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-3 text-3xl font-black">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   GENERIC PANEL PAGE
========================================================= */

function GenericPanelPage({
  title,
  role,
}: {
  title: string;
  role: "ADMIN" | "USER";
}) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <PanelLayout
      title={title}
      role={role}
      logout={logout}
    >
      <div className="rounded-2xl border border-white/10 bg-slate-900 p-8">
        <h2 className="text-2xl font-bold">
          {title}
        </h2>

        <p className="mt-3 text-slate-400">
          This section is ready for your backend functionality.
        </p>
      </div>
    </PanelLayout>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/pricing"
        element={<PricingPage />}
      />

      {/* LOGIN */}
      <Route
        path="/login"
        element={<LoginPage />}
      />

      {/* ADMIN */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <GenericPanelPage
              title="Users"
              role="ADMIN"
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/staff"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <GenericPanelPage
              title="Staff"
              role="ADMIN"
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <GenericPanelPage
              title="Departments"
              role="ADMIN"
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/records"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <GenericPanelPage
              title="Records"
              role="ADMIN"
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <GenericPanelPage
              title="Reports"
              role="ADMIN"
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <GenericPanelPage
              title="Notifications"
              role="ADMIN"
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <GenericPanelPage
              title="Settings"
              role="ADMIN"
            />
          </ProtectedRoute>
        }
      />

      {/* USER */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRole="USER">
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/profile"
        element={
          <ProtectedRoute allowedRole="USER">
            <GenericPanelPage
              title="My Profile"
              role="USER"
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/records"
        element={
          <ProtectedRoute allowedRole="USER">
            <GenericPanelPage
              title="My Records"
              role="USER"
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/reports"
        element={
          <ProtectedRoute allowedRole="USER">
            <GenericPanelPage
              title="My Reports"
              role="USER"
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/notifications"
        element={
          <ProtectedRoute allowedRole="USER">
            <GenericPanelPage
              title="Notifications"
              role="USER"
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/settings"
        element={
          <ProtectedRoute allowedRole="USER">
            <GenericPanelPage
              title="Settings"
              role="USER"
            />
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
