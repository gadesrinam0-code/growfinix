import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  const [page, setPage] = useState(
    localStorage.getItem("token") ? "dashboard" : "login"
  );

  const handleLogin = () => {
    setPage("dashboard");
  };

  const handleLogout = () => {
    setPage("login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {page === "login" && (
        <Login
          onLogin={handleLogin}
          onRegister={() => setPage("register")}
        />
      )}

      {page === "register" && (
        <Register
          onLogin={() => setPage("login")}
        />
      )}

      {page === "dashboard" && (
        <Dashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;