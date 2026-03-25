import { useLocation, useNavigate } from "react-router-dom";

const Navbar = ({ user, darkMode, onToggleDark, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInitial = user?.name?.trim()?.[0]?.toUpperCase() || "U";

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar simple-nav">
      <div className="brand-title">
        <span>Complaint Tracker</span>
      </div>
      <div className="nav-links">
        <button
          type="button"
          className={`nav-link ${isActive("/") ? "active" : ""}`}
          onClick={() => navigate("/")}
        >
          Home
        </button>
        {user.role === "user" && (
          <button
            type="button"
            className={`nav-link ${isActive("/new") ? "active" : ""}`}
            onClick={() => navigate("/new")}
          >
            Add New Complaint
          </button>
        )}
        <button
          type="button"
          className={`nav-link ${isActive("/complaints") ? "active" : ""}`}
          onClick={() => navigate("/complaints")}
        >
          {user.role === "admin" ? "All Complaints" : "My Complaints"}
        </button>
        <button type="button" className="avatar-btn" aria-label="Profile menu">
          <span className="avatar-circle">{userInitial}</span>
          <span className="caret" />
        </button>
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleDark}
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
            </svg>
          )}
        </button>
        <button type="button" className="nav-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
