const NewComplaintPage = ({
  complaintText,
  setComplaintText,
  category,
  setCategory,
  stateValue,
  setStateValue,
  city,
  setCity,
  address,
  setAddress,
  pincode,
  setPincode,
  setComplaintImage,
  imagePreview,
  submitComplaint,
  loading
}) => {
  return (
    <section id="new-complaint" className="card reveal delay-1">
      <h2>Submit New Complaint</h2>
      <form onSubmit={submitComplaint} className="form-stack">
        <div className="form-block">
          <label htmlFor="complaintText">Description</label>
          <textarea
            id="complaintText"
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            placeholder="Explain your issue with location, time and details"
          />
        </div>

        <div className="form-block">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="General">General</option>
            <option value="Road">Road</option>
            <option value="Water">Water</option>
            <option value="Electricity">Electricity</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <h3 className="section-title">Location Details</h3>

        <div className="form-block">
          <label htmlFor="state">State</label>
          <input id="state" value={stateValue} onChange={(e) => setStateValue(e.target.value)} placeholder="State" />
        </div>
        <div className="form-block">
          <label htmlFor="city">City</label>
          <input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
        </div>
        <div className="form-block">
          <label htmlFor="address">Address</label>
          <input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" />
        </div>
        <div className="form-block">
          <label htmlFor="pincode">Pincode</label>
          <input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Pincode" />
        </div>
        <div className="form-block">
          <label htmlFor="complaintImage">Upload Image</label>
          <input id="complaintImage" type="file" accept="image/*" onChange={(e) => setComplaintImage(e.target.files?.[0] || null)} />
          {imagePreview && (
            <div className="preview-card">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
    </section>
  );
};

export default NewComplaintPage;
