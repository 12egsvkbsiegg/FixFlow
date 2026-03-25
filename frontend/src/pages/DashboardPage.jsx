const DashboardPage = ({ user, statusCounts, statusSegments, pieBackground, categoryCounts }) => {
  return (
    <>
      <section className="card welcome-card reveal">
        <h2>
          Welcome, {user.name} <span aria-hidden="true">👋</span>
        </h2>
        <p className="subtle">Track and manage your complaints easily.</p>
      </section>

      <section className="stats-grid reveal delay-1">
        <article className="stat-card total">
          <div>
            <p>Total Complaints</p>
            <h3>{statusCounts.total}</h3>
          </div>
          <span className="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v6l4 2" />
            </svg>
          </span>
        </article>
        <article className="stat-card pending">
          <div>
            <p>Pending</p>
            <h3>{statusCounts.Pending}</h3>
          </div>
          <span className="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5h4" />
            </svg>
          </span>
        </article>
        <article className="stat-card progress">
          <div>
            <p>In Progress</p>
            <h3>{statusCounts["In Progress"]}</h3>
          </div>
          <span className="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12h16" />
              <path d="M12 4l8 8-8 8" />
            </svg>
          </span>
        </article>
        <article className="stat-card resolved">
          <div>
            <p>Resolved</p>
            <h3>{statusCounts.Resolved}</h3>
          </div>
          <span className="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
        </article>
      </section>

      <section className="charts-grid reveal delay-1">
        <article className="card chart-card">
          <h3>Complaint Status Distribution</h3>
          <div className="pie-wrap">
            <div className="pie" style={{ background: pieBackground }} />
            <div className="pie-legend">
              {statusSegments.map((item) => (
                <div key={item.label} className="legend-item">
                  <span className="legend-dot" style={{ background: item.color }} />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>
        <article className="card chart-card">
          <h3>Complaints by Category</h3>
          <div className="bar-chart">
            {categoryCounts.length === 0 ? (
              <p className="muted">No complaints yet.</p>
            ) : (
              categoryCounts.map(([label, count]) => (
                <div key={label} className="bar-row">
                  <span>{label}</span>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${Math.max(8, (count / categoryCounts[0][1]) * 100)}%` }} />
                  </div>
                  <strong>{count}</strong>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      {statusCounts.total === 0 && (
        <section className="card empty-state reveal delay-1">
          <div className="empty-illustration" aria-hidden="true" />
          <div>
            <h3>No complaints found</h3>
            <p className="subtle">You have not submitted any complaints yet.</p>
          </div>
        </section>
      )}
    </>
  );
};

export default DashboardPage;
