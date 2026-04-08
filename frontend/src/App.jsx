import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import NewComplaintPage from "./pages/NewComplaintPage";
import ComplaintsPage from "./pages/ComplaintsPage";

const DEFAULT_API_BASE = "http://localhost:5000/api";
const API_BASE = import.meta.env.VITE_API_BASE || DEFAULT_API_BASE;
const API_HOST = API_BASE.replace("/api", "");

const getStoredAuth = () => {
  const token = localStorage.getItem("cts_token");
  const userRaw = localStorage.getItem("cts_user");

  if (!token || !userRaw) {
    return { token: "", user: null };
  }

  try {
    return { token, user: JSON.parse(userRaw) };
  } catch {
    return { token: "", user: null };
  }
};

const statusClassName = (status) => {
  switch (status) {
    case "Resolved":
      return "resolved";
    case "In Progress":
      return "in-progress";
    case "Rejected":
      return "rejected";
    default:
      return "pending";
  }
};

function App() {
  const stored = getStoredAuth();

  const [token, setToken] = useState(stored.token);
  const [user, setUser] = useState(stored.user);
  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const [complaintText, setComplaintText] = useState("");
  const [category, setCategory] = useState("General");
  const [complaintImage, setComplaintImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterState, setFilterState] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const [editingId, setEditingId] = useState("");
  const [editingText, setEditingText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [detailsId, setDetailsId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const saveAuth = (nextToken, nextUser) => {
    localStorage.setItem("cts_token", nextToken);
    localStorage.setItem("cts_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem("cts_token");
    localStorage.removeItem("cts_user");
    setToken("");
    setUser(null);
    setComplaints([]);
    setMessage("");
    setEditingId("");
    setEditingText("");
    navigate("/login");
  };

  const request = async (path, options = {}) => {
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...(options.headers || {}),
      ...authHeaders,
    };

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || "Request failed.");
      error.status = response.status;
      error.payload = data;
      throw error;
    }

    return data;
  };

  const loadData = async () => {
    if (!token || !user) {
      return;
    }

    try {
      if (user.role === "admin") {
        const allComplaints = await request("/complaints");
        setComplaints(allComplaints);
      } else {
        const myComplaints = await request("/complaints/my");
        setComplaints(myComplaints);
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, user]);

  useEffect(() => {
    if (!complaintImage) {
      setImagePreview("");
      return;
    }
    const url = URL.createObjectURL(complaintImage);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [complaintImage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterState, filterCity, searchTerm, sortOrder]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const handleAuth = async (event) => {
    event.preventDefault();
    setAuthMessage("");
    setOtpMessage("");

    if (!email || !password || (authMode === "signup" && !name)) {
      setAuthMessage("Please fill all required fields.");
      return;
    }

    if (!/^[A-Z0-9._%+-]+@gmail\.com$/i.test(email)) {
      setAuthMessage("Please use a valid Gmail address.");
      return;
    }

    setLoading(true);

    try {
      const payload =
        authMode === "signup"
          ? { name, email, password, role }
          : { email, password };
      const endpoint = authMode === "signup" ? "/auth/signup" : "/auth/login";
      const data = await request(endpoint, {
        method: "POST",
        headers: {},
        body: JSON.stringify(payload),
      });

      if (authMode === "signup") {
        setPendingEmail(email);
        setAuthMessage(data.message || "OTP sent to your email.");
        setOtpCode("");
        setAuthMode("otp");
      } else {
        saveAuth(data.token, data.user);
        setName("");
        setEmail("");
        setPassword("");
        setRole("user");
        setPendingEmail("");
        setAuthMessage("Login successful.");
        navigate("/");
      }
    } catch (error) {
      const needsVerification =
        error?.payload?.needsVerification ||
        error?.status === 403 ||
        error.message?.includes("Email not verified");
      if (authMode === "login" && needsVerification) {
        setPendingEmail(email);
        setAuthMode("otp");
        setOtpMessage(error.message || "Email not verified. Please verify with OTP.");
      } else {
        setAuthMessage(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setOtpMessage("");

    if (!pendingEmail) {
      setOtpMessage("Email is missing. Please login or signup again.");
      return;
    }

    if (!otpCode.trim()) {
      setOtpMessage("Please enter the OTP.");
      return;
    }

    setLoading(true);
    try {
      const data = await request("/auth/verify-otp", {
        method: "POST",
        headers: {},
        body: JSON.stringify({ email: pendingEmail, otp: otpCode }),
      });
      saveAuth(data.token, data.user);
      setOtpCode("");
      setOtpMessage("");
      setPendingEmail("");
      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
      setAuthMode("login");
      navigate("/");
    } catch (error) {
      setOtpMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpMessage("");

    if (!pendingEmail) {
      setOtpMessage("Email is missing. Please login or signup again.");
      return;
    }

    setLoading(true);
    try {
      const data = await request("/auth/resend-otp", {
        method: "POST",
        headers: {},
        body: JSON.stringify({ email: pendingEmail }),
      });
      setOtpMessage(data.message || "OTP resent to your email.");
    } catch (error) {
      setOtpMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitComplaint = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!complaintText.trim()) {
      setMessage("Description is required.");
      return;
    }

    if (
      !stateValue.trim() ||
      !city.trim() ||
      !address.trim() ||
      !pincode.trim()
    ) {
      setMessage("Please fill all location fields.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("complaintText", complaintText);
      formData.append("category", category);
      formData.append("state", stateValue);
      formData.append("city", city);
      formData.append("address", address);
      formData.append("pincode", pincode);
      if (complaintImage) {
        formData.append("image", complaintImage);
      }

      await request("/complaints", {
        method: "POST",
        body: formData,
      });
      setComplaintText("");
      setCategory("General");
      setComplaintImage(null);
      setStateValue("");
      setCity("");
      setAddress("");
      setPincode("");
      setMessage("Complaint submitted successfully.");
      await loadData();
      navigate("/complaints");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setMessage("");
    try {
      await request(`/complaints/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setMessage(`Complaint status updated to ${status}.`);
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditingText(item.complaintText || "");
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditingText("");
  };

  const saveEdit = async (id) => {
    setMessage("");

    if (!editingText.trim()) {
      setMessage("Description is required.");
      return;
    }

    setSavingEdit(true);
    try {
      await request(`/complaints/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ complaintText: editingText }),
      });
      setMessage("Complaint updated.");
      cancelEdit();
      await loadData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteComplaint = async (id) => {
    setMessage("");
    const confirmed = window.confirm("Delete this complaint?");
    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    try {
      await request(`/complaints/${id}`, {
        method: "DELETE",
      });
      setMessage("Complaint deleted.");
      if (editingId === id) {
        cancelEdit();
      }
      await loadData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setDeletingId("");
    }
  };

  const toggleDetails = (id) => {
    setDetailsId((prev) => (prev === id ? "" : id));
  };

  const stateOptions = useMemo(() => {
    const options = complaints
      .map((item) => item.location?.state)
      .filter(Boolean);
    return Array.from(new Set(options));
  }, [complaints]);

  const cityOptions = useMemo(() => {
    const options = complaints
      .map((item) => item.location?.city)
      .filter(Boolean);
    return Array.from(new Set(options));
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    let data = complaints;

    if (filterStatus !== "all") {
      data = data.filter((item) => item.status === filterStatus);
    }

    if (filterState !== "all") {
      data = data.filter((item) => item.location?.state === filterState);
    }

    if (filterCity !== "all") {
      data = data.filter((item) => item.location?.city === filterCity);
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      data = data.filter((item) => {
        const locationBits = [
          item.location?.state,
          item.location?.city,
          item.location?.address,
          item.location?.pincode,
        ]
          .filter(Boolean)
          .join(" ");
        return (
          item.name?.toLowerCase().includes(term) ||
          item.email?.toLowerCase().includes(term) ||
          item.complaintText?.toLowerCase().includes(term) ||
          item.category?.toLowerCase().includes(term) ||
          item.status?.toLowerCase().includes(term) ||
          locationBits.toLowerCase().includes(term)
        );
      });
    }

    const sorted = [...data].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === "oldest" ? aTime - bTime : bTime - aTime;
    });

    return sorted;
  }, [
    complaints,
    filterStatus,
    filterState,
    filterCity,
    searchTerm,
    sortOrder,
  ]);

  const statusCounts = useMemo(() => {
    const counts = {
      total: complaints.length,
      Pending: 0,
      "In Progress": 0,
      Resolved: 0,
      Rejected: 0,
    };
    complaints.forEach((item) => {
      if (counts[item.status] !== undefined) {
        counts[item.status] += 1;
      }
    });
    return counts;
  }, [complaints]);

  const statusSegments = useMemo(() => {
    return [
      { label: "Pending", value: statusCounts.Pending, color: "#fbbf24" },
      {
        label: "In Progress",
        value: statusCounts["In Progress"],
        color: "#60a5fa",
      },
      { label: "Resolved", value: statusCounts.Resolved, color: "#34d399" },
      { label: "Rejected", value: statusCounts.Rejected, color: "#f87171" },
    ];
  }, [statusCounts]);

  const pieBackground = useMemo(() => {
    const total =
      statusSegments.reduce((sum, item) => sum + item.value, 0) || 1;
    let start = 0;
    const segments = statusSegments.map((item) => {
      const angle = (item.value / total) * 360;
      const segment = `${item.color} ${start}deg ${start + angle}deg`;
      start += angle;
      return segment;
    });
    return `conic-gradient(${segments.join(", ")})`;
  }, [statusSegments]);

  const categoryCounts = useMemo(() => {
    const map = {};
    complaints.forEach((item) => {
      const key = item.category || "General";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [complaints]);

  const pageSize = 6;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredComplaints.length / pageSize),
  );
  const safePage = Math.min(currentPage, totalPages);
  const pagedComplaints = filteredComplaints.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  if (!user) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <AuthPage
              authMode={authMode}
              setAuthMode={setAuthMode}
              handleAuth={handleAuth}
              handleVerifyOtp={handleVerifyOtp}
              handleResendOtp={handleResendOtp}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              role={role}
              setRole={setRole}
              loading={loading}
              authMessage={authMessage}
              otpCode={otpCode}
              setOtpCode={setOtpCode}
              otpMessage={otpMessage}
              pendingEmail={pendingEmail}
            />
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="container">
      <Navbar
        user={user}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((prev) => !prev)}
        onLogout={logout}
      />
      <Routes>
        <Route
          path="/"
          element={
            <DashboardPage
              user={user}
              statusCounts={statusCounts}
              statusSegments={statusSegments}
              pieBackground={pieBackground}
              categoryCounts={categoryCounts}
            />
          }
        />
        <Route
          path="/new"
          element={
            user.role === "user" ? (
              <NewComplaintPage
                complaintText={complaintText}
                setComplaintText={setComplaintText}
                category={category}
                setCategory={setCategory}
                stateValue={stateValue}
                setStateValue={setStateValue}
                city={city}
                setCity={setCity}
                address={address}
                setAddress={setAddress}
                pincode={pincode}
                setPincode={setPincode}
                setComplaintImage={setComplaintImage}
                imagePreview={imagePreview}
                submitComplaint={submitComplaint}
                loading={loading}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/complaints"
          element={
            <ComplaintsPage
              user={user}
              pagedComplaints={pagedComplaints}
              detailsId={detailsId}
              editingId={editingId}
              editingText={editingText}
              setEditingText={setEditingText}
              savingEdit={savingEdit}
              deletingId={deletingId}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterState={filterState}
              setFilterState={setFilterState}
              filterCity={filterCity}
              setFilterCity={setFilterCity}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              stateOptions={stateOptions}
              cityOptions={cityOptions}
              statusClassName={statusClassName}
              updateStatus={updateStatus}
              toggleDetails={toggleDetails}
              startEdit={startEdit}
              saveEdit={saveEdit}
              cancelEdit={cancelEdit}
              deleteComplaint={deleteComplaint}
              totalPages={totalPages}
              safePage={safePage}
              setCurrentPage={setCurrentPage}
              API_HOST={API_HOST}
            />
          }
        />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {message && <div className="message reveal delay-2">{message}</div>}

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-brand">
              <div>
                <h3>Complaint Tracker</h3>
                <p className="footer-tagline">
                  Empowering citizens to raise their voice.
                </p>
              </div>
            </div>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li>About Us</li>
              <li>How it Works</li>
              <li>FAQs</li>
              <li>Privacy Policy & Terms</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact & Support</h4>
            <p className="footer-contact">
              <span className="contact-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6h16v12H4z" />
                  <path d="M4 6l8 6 8-6" />
                </svg>
              </span>
              support@complainttracker.com
            </p>
            <p className="footer-contact">
              <span className="contact-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.5v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.2 1h3a2 2 0 0 1 2 1.7c.1.8.3 1.6.6 2.3a2 2 0 0 1-.5 2.1L8 8a16 16 0 0 0 6 6l1.9-1.3a2 2 0 0 1 2.1-.5c.7.3 1.5.5 2.3.6a2 2 0 0 1 1.7 2z" />
                </svg>
              </span>
              Helpline: 1800-123-456
            </p>
          </div>
          <div className="footer-col">
            <h4>Social</h4>
            <div className="socials">
              <span className="social-icon" aria-label="GitHub">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.31 6.84 9.66.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.58 2.36 1.12 2.94.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.4 9.4 0 0 1 12 6.9c.85 0 1.71.12 2.51.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.95-2.35 4.82-4.58 5.08.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.48 3.96-1.35 6.83-5.16 6.83-9.66C22 6.58 17.52 2 12 2z" />
                </svg>
              </span>
              <span className="social-icon" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.94 6.5a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0ZM4.2 20h2.48V9.1H4.2V20ZM9.44 9.1h2.38v1.49h.03c.33-.62 1.15-1.27 2.37-1.27 2.53 0 3 1.72 3 3.96V20h-2.48v-6.02c0-1.44-.03-3.3-1.99-3.3-2 0-2.31 1.58-2.31 3.2V20H9.44V9.1Z" />
                </svg>
              </span>
              <span className="social-icon" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.9 7.34c.01.16.01.32.01.48 0 4.93-3.7 10.62-10.47 10.62-2.08 0-4.02-.62-5.65-1.68.29.03.57.04.87.04 1.72 0 3.3-.6 4.56-1.62-1.61-.03-2.97-1.12-3.44-2.61.22.04.45.07.69.07.33 0 .67-.05.98-.12-1.68-.35-2.95-1.88-2.95-3.72v-.05c.49.28 1.06.45 1.66.47-1-.69-1.65-1.87-1.65-3.2 0-.7.18-1.35.5-1.92 1.82 2.3 4.55 3.8 7.63 3.96-.06-.28-.09-.57-.09-.86 0-2.07 1.62-3.75 3.62-3.75 1.04 0 1.98.45 2.64 1.17.82-.16 1.6-.48 2.3-.91-.27.87-.85 1.6-1.6 2.06.73-.09 1.43-.29 2.08-.6-.49.76-1.1 1.43-1.81 1.96Z" />
                </svg>
              </span>
            </div>
          </div>
        </div>
        <div className="footer-divider" />
        <p className="footer-copy">
          © 2026 Complaint Tracker. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
