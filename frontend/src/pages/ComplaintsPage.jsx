import { Fragment } from "react";

const ComplaintsPage = ({
  user,
  pagedComplaints,
  detailsId,
  editingId,
  editingText,
  setEditingText,
  savingEdit,
  deletingId,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterState,
  setFilterState,
  filterCity,
  setFilterCity,
  sortOrder,
  setSortOrder,
  stateOptions,
  cityOptions,
  statusClassName,
  updateStatus,
  toggleDetails,
  startEdit,
  saveEdit,
  cancelEdit,
  deleteComplaint,
  totalPages,
  safePage,
  setCurrentPage,
  API_HOST
}) => {
  return (
    <section id="complaints" className="card reveal delay-2 table-section">
      <div className="row-between">
        <h2>{user.role === "admin" ? "All Complaints" : "My Complaints"}</h2>
        <div className="table-tools">
          <div className="search-wrap relative">
            <span className="search-icon absolute">🔍</span>
            <input
              className="search-input w-full rounded-lg pl-9"
              type="search"
              placeholder="Search name, email, complaint, location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select value={filterState} onChange={(e) => setFilterState(e.target.value)}>
            <option value="all">All States</option>
            {stateOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
            <option value="all">All Cities</option>
            {cityOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select className="sort-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="newest">Sort by Date: Newest</option>
            <option value="oldest">Sort by Date: Oldest</option>
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Description</th>
              <th>Location</th>
              <th>Image</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pagedComplaints.length === 0 ? (
              <tr>
                <td colSpan={8}>No complaints found.</td>
              </tr>
            ) : (
              pagedComplaints.map((item) => (
                <Fragment key={item._id}>
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>
                      {editingId === item._id ? (
                        <textarea
                          className="inline-textarea"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                        />
                      ) : (
                        item.complaintText
                      )}
                    </td>
                    <td>
                      {item.location ? (
                        <span>
                          {item.location.address}, {item.location.city}, {item.location.state} - {item.location.pincode}
                        </span>
                      ) : (
                        <span className="muted">No location</span>
                      )}
                    </td>
                    <td>
                      {item.imageUrl ? (
                        <a className="image-link" href={`${API_HOST}${item.imageUrl}`} target="_blank" rel="noreferrer">
                          <img className="thumb" src={`${API_HOST}${item.imageUrl}`} alt="Complaint" />
                        </a>
                      ) : (
                        <span className="muted">No image</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${statusClassName(item.status)}`}>{item.status}</span>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td>
                      {user.role === "admin" && (
                        <div className="table-actions">
                          <select className="status-select" value={item.status} onChange={(e) => updateStatus(item._id, e.target.value)}>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <button type="button" className="ghost-btn small-btn" onClick={() => toggleDetails(item._id)}>
                            {detailsId === item._id ? "Hide" : "Details"}
                          </button>
                        </div>
                      )}
                      {user.role === "user" && (
                        <div className="table-actions">
                          {editingId === item._id ? (
                            <>
                              <button type="button" onClick={() => saveEdit(item._id)} disabled={savingEdit}>
                                {savingEdit ? "Saving..." : "Save"}
                              </button>
                              <button type="button" className="ghost-btn" onClick={cancelEdit} disabled={savingEdit}>
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button type="button" className="icon-btn" onClick={() => startEdit(item)} aria-label="Edit">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                                </svg>
                              </button>
                              <button type="button" className="icon-btn danger" onClick={() => deleteComplaint(item._id)} disabled={deletingId === item._id} aria-label="Delete">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4h8v2" />
                                  <path d="M6 6l1 14h10l1-14" />
                                </svg>
                              </button>
                              <button type="button" className="ghost-btn small-btn" onClick={() => toggleDetails(item._id)}>
                                {detailsId === item._id ? "Hide" : "Details"}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                  {detailsId === item._id && (
                    <tr className="details-row">
                      <td colSpan={8}>
                        <div className="details-card">
                          <div>
                            <strong>Description:</strong> {item.complaintText}
                          </div>
                          <div>
                            <strong>Category:</strong> {item.category || "General"}
                          </div>
                          <div>
                            <strong>Location:</strong> {item.location?.address}, {item.location?.city}, {item.location?.state} -{item.location?.pincode}
                          </div>
                          <div>
                            <strong>Status:</strong> {item.status}
                          </div>
                          <div>
                            <strong>Submitted:</strong> {new Date(item.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button type="button" className="ghost-btn" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
            Previous
          </button>
          <button type="button" className="ghost-btn" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default ComplaintsPage;
