const AuthPage = ({
  authMode,
  setAuthMode,
  handleAuth,
  handleVerifyOtp,
  handleResendOtp,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  role,
  setRole,
  loading,
  authMessage,
  otpCode,
  setOtpCode,
  otpMessage,
  pendingEmail
}) => {
  const isOtpMode = authMode === "otp";

  return (
    <div className="container auth-shell">
      <section className="auth-layout">
        <div className="auth-copy card reveal">
          <p className="eyebrow">Citizen Connect</p>
          <h1>Complaint Tracker System</h1>
          <p>
            Register complaints quickly, track resolution status, and let admins manage every issue from one clean dashboard.
          </p>
          <div className="feature-list">
            <span>JWT Secure Login</span>
            <span>Role-Based Access</span>
            <span>Status Updates</span>
          </div>
        </div>

        <div id="profile" className="card auth-card reveal delay-1">
          <h2>
            {isOtpMode ? "Verify Email" : authMode === "signup" ? "Create Account" : "Welcome Back"}
          </h2>

          {!isOtpMode && (
            <>
              <form onSubmit={handleAuth}>
                {authMode === "signup" && (
                  <>
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                    />
                  </>
                )}

                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                />

                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                />

                {authMode === "signup" && (
                  <>
                    <label htmlFor="role">Role</label>
                    <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </>
                )}

                <button type="submit" disabled={loading}>
                  {loading ? "Please wait..." : authMode === "signup" ? "Signup" : "Login"}
                </button>
              </form>

              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  setAuthMode(authMode === "signup" ? "login" : "signup");
                }}
              >
                Switch to {authMode === "signup" ? "Login" : "Signup"}
              </button>

              {authMessage && <div className="message">{authMessage}</div>}
            </>
          )}

          {isOtpMode && (
            <>
              <p className="otp-helper">
                We sent a 4-digit OTP to <strong>{pendingEmail || "your email"}</strong>. It expires in 3 minutes.
              </p>
              <form onSubmit={handleVerifyOtp}>
                <label htmlFor="otp">OTP Code</label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 4-digit OTP"
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Please wait..." : "Verify OTP"}
                </button>
              </form>
              <button type="button" className="ghost-btn" onClick={handleResendOtp} disabled={loading}>
                Resend OTP
              </button>
              <button type="button" className="ghost-btn" onClick={() => setAuthMode("login")} disabled={loading}>
                Back to Login
              </button>
              {otpMessage && <div className="message">{otpMessage}</div>}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default AuthPage;
