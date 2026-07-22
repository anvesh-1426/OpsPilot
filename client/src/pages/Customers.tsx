import React, { useState, useEffect } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  Plus,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  ClipboardList,
  User,
  PlusCircle,
  FileText,
  X
} from "lucide-react";
import { Layout } from "../components/Layout";

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber: string | null;
  type: string;
  address: string;
  status: string;
  followUpDate: string | null;
  createdAt: string;
  notes?: Note[];
}

export const Customers: React.FC = () => {
  const { user } = useAuth();
  const isSalesOrAdmin = ["ADMIN", "SALES"].includes(user?.role || "");

  // State Management
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Modal forms state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustForm, setNewCustForm] = useState({
    name: "",
    mobile: "",
    email: "",
    businessName: "",
    gstNumber: "",
    type: "WHOLESALE",
    address: "",
    status: "LEAD",
    followUpDate: ""
  });

  const [newNoteContent, setNewNoteContent] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch customers list
  const fetchCustomers = async (selectedIdToRestore?: string) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (statusFilter) queryParams.append("status", statusFilter);
      if (typeFilter) queryParams.append("type", typeFilter);

      const response = await apiClient.get(`/customers?${queryParams.toString()}`);
      const list = response.data.customers || [];
      setCustomers(list);

      // If we are refreshing and had a customer selected, reload their profile to get new notes
      const activeId = selectedIdToRestore || selectedCustomer?.id;
      if (activeId) {
        const detailRes = await apiClient.get(`/customers/${activeId}`);
        setSelectedCustomer(detailRes.data.customer);
      } else if (list.length > 0 && !selectedCustomer) {
        // Auto-select first customer in list on initial load
        const detailRes = await apiClient.get(`/customers/${list[0].id}`);
        setSelectedCustomer(detailRes.data.customer);
      }
    } catch (err: any) {
      setError("Failed to fetch customer data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter, typeFilter]);

  // Handle selecting a customer to view profile
  const handleSelectCustomer = async (cust: Customer) => {
    try {
      const response = await apiClient.get(`/customers/${cust.id}`);
      setSelectedCustomer(response.data.customer);
    } catch (err) {
      alert("Failed to load customer profile details.");
    }
  };

  // Handle adding a follow-up note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !selectedCustomer) return;

    setNoteSubmitting(true);
    try {
      await apiClient.post(`/customers/${selectedCustomer.id}/notes`, {
        content: newNoteContent
      });
      setNewNoteContent("");
      // Reload customer details to refresh notes stream
      await handleSelectCustomer(selectedCustomer);
    } catch (err: any) {
      alert("Failed to add follow-up log.");
    } finally {
      setNoteSubmitting(false);
    }
  };

  // Handle updating customer status
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedCustomer) return;

    try {
      await apiClient.patch(`/customers/${selectedCustomer.id}`, {
        status: newStatus
      });
      // Refresh list and maintain active profile
      await fetchCustomers(selectedCustomer.id);
    } catch (err: any) {
      alert("Failed to update status.");
    }
  };

  // Handle creating a new customer lead
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const payload = {
        ...newCustForm,
        gstNumber: newCustForm.gstNumber || undefined,
        followUpDate: newCustForm.followUpDate || undefined
      };
      const response = await apiClient.post("/customers", payload);
      
      // Close modal & reset form
      setShowAddModal(false);
      setNewCustForm({
        name: "",
        mobile: "",
        email: "",
        businessName: "",
        gstNumber: "",
        type: "WHOLESALE",
        address: "",
        status: "LEAD",
        followUpDate: ""
      });

      // Refresh list and select the newly created customer
      await fetchCustomers(response.data.customer.id);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to create client profile.";
      alert(errMsg);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>CRM Client Manager</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Manage customer accounts, leads, and follow-ups.</p>
        </div>
        {isSalesOrAdmin && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            Add Customer
          </button>
        )}
      </div>

      {error && <div style={{ color: "var(--color-danger)", marginBottom: "1rem" }}>{error}</div>}

      {/* Main CRM Screen Layout - Dual Pane */}
      <div style={{ display: "flex", gap: "2rem", height: "calc(100vh - 240px)", minHeight: "500px" }}>
        
        {/* LEFT PANE: Search, Filter, and Customer Cards List */}
        <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {/* Search and Filters Bar */}
          <div className="card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search name, company, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "32px" }}
              />
            </div>
            
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <select
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">All Statuses</option>
                <option value="LEAD">Leads</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <select
                className="form-input"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">All Types</option>
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
            </div>
          </div>

          {/* Scrollable Customer List */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {loading && customers.length === 0 ? (
              <div style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: "2rem" }}>Loading clients...</div>
            ) : customers.length === 0 ? (
              <div style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "2rem" }}>No customers found matching filters.</div>
            ) : (
              customers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                return (
                  <div
                    key={cust.id}
                    className="card"
                    onClick={() => handleSelectCustomer(cust)}
                    style={{
                      padding: "1rem",
                      cursor: "pointer",
                      borderColor: isSelected ? "var(--accent-color)" : "var(--border-color)",
                      backgroundColor: isSelected ? "rgba(59, 130, 246, 0.05)" : "var(--bg-secondary)",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <h4 style={{ fontWeight: 600, fontSize: "0.95rem" }}>{cust.name}</h4>
                      <span className={`badge ${
                        cust.status === "ACTIVE" ? "badge-success" :
                        cust.status === "LEAD" ? "badge-info" : "badge-danger"
                      }`} style={{ fontSize: "0.65rem", padding: "0.125rem 0.375rem" }}>
                        {cust.status}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.25rem" }}>
                      <Building size={12} />
                      {cust.businessName}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{cust.email}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: Selected Customer Profile Detail File */}
        <div style={{ width: "60%" }}>
          {selectedCustomer ? (
            <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column", padding: "2rem", overflow: "hidden" }}>
              
              {/* Profile Header */}
              <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1.25rem", marginBottom: "1.25rem", flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.375rem", fontWeight: 700 }}>{selectedCustomer.name}</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                      <Building size={14} />
                      {selectedCustomer.businessName}
                    </p>
                  </div>
                  
                  {/* Status update switcher */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Status:</span>
                    {isSalesOrAdmin ? (
                      <select
                        className="form-input"
                        value={selectedCustomer.status}
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        style={{ width: "110px", padding: "0.375rem", fontSize: "0.75rem" }}
                      >
                        <option value="LEAD">Lead</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    ) : (
                      <span className={`badge ${
                        selectedCustomer.status === "ACTIVE" ? "badge-success" :
                        selectedCustomer.status === "LEAD" ? "badge-info" : "badge-danger"
                      }`}>
                        {selectedCustomer.status}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem 1.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <Phone size={14} style={{ color: "var(--accent-color)" }} />
                    {selectedCustomer.mobile}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <Mail size={14} style={{ color: "var(--accent-color)" }} />
                    {selectedCustomer.email}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <ClipboardList size={14} style={{ color: "var(--accent-color)" }} />
                    Type: <strong style={{ color: "var(--text-primary)" }}>{selectedCustomer.type}</strong>
                  </div>
                  {selectedCustomer.gstNumber && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <FileText size={14} style={{ color: "var(--accent-color)" }} />
                      GST: <strong style={{ color: "var(--text-primary)" }}>{selectedCustomer.gstNumber}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Scrollable details and notes stream */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                
                {/* Delivery Address & Follow-up panel */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="card" style={{ padding: "1rem", backgroundColor: "var(--bg-primary)" }}>
                    <h5 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <MapPin size={12} />
                      Billing / Delivery Address
                    </h5>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{selectedCustomer.address}</p>
                  </div>

                  <div className="card" style={{ padding: "1rem", backgroundColor: "var(--bg-primary)" }}>
                    <h5 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <Calendar size={12} />
                      Next Follow-Up Date
                    </h5>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
                      {selectedCustomer.followUpDate
                        ? new Date(selectedCustomer.followUpDate).toLocaleDateString(undefined, { dateStyle: "long" })
                        : "No follow-up scheduled."}
                    </p>
                  </div>
                </div>

                {/* Conversation log (Follow-up notes) */}
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ClipboardList size={16} style={{ color: "var(--accent-color)" }} />
                    Conversation Activity Log
                  </h4>

                  {/* Add Note Form */}
                  {isSalesOrAdmin && (
                    <form onSubmit={handleAddNote} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Log follow-up discussion details..."
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        required
                        disabled={noteSubmitting}
                      />
                      <button type="submit" className="btn btn-primary" style={{ padding: "0.5rem 1rem" }} disabled={noteSubmitting}>
                        {noteSubmitting ? "Saving..." : "Log Note"}
                      </button>
                    </form>
                  )}

                  {/* Notes stream */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {!selectedCustomer.notes || selectedCustomer.notes.length === 0 ? (
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "1rem" }}>
                        No follow-up history logged for this client yet.
                      </p>
                    ) : (
                      selectedCustomer.notes.map((note) => (
                        <div key={note.id} style={{
                          padding: "0.875rem 1.125rem",
                          borderRadius: "0.375rem",
                          backgroundColor: "var(--bg-surface)",
                          border: "1px solid var(--border-color)"
                        }}>
                          <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", marginBottom: "0.375rem" }}>{note.content}</p>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Logged on {new Date(note.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="card" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
              Select a customer from the left list to load their CRM file.
            </div>
          )}
        </div>

      </div>

      {/* MODAL WINDOW: Add Customer */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "550px", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button
              onClick={() => setShowAddModal(false)}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>Create Client CRM Record</h3>

            <form onSubmit={handleAddCustomer}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="cust-name">Customer Name</label>
                  <input
                    id="cust-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Jane Smith"
                    value={newCustForm.name}
                    onChange={(e) => setNewCustForm({ ...newCustForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cust-mobile">Mobile Number</label>
                  <input
                    id="cust-mobile"
                    type="text"
                    className="form-input"
                    placeholder="e.g. 9876543210"
                    value={newCustForm.mobile}
                    onChange={(e) => setNewCustForm({ ...newCustForm, mobile: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="cust-email">Email Address</label>
                  <input
                    id="cust-email"
                    type="email"
                    className="form-input"
                    placeholder="name@business.com"
                    value={newCustForm.email}
                    onChange={(e) => setNewCustForm({ ...newCustForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cust-business">Business/Company Name</label>
                  <input
                    id="cust-business"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Alpha Distributors"
                    value={newCustForm.businessName}
                    onChange={(e) => setNewCustForm({ ...newCustForm, businessName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="cust-gst">GST Number (Optional)</label>
                  <input
                    id="cust-gst"
                    type="text"
                    className="form-input"
                    placeholder="22AAAAA1111A1Z1"
                    value={newCustForm.gstNumber}
                    onChange={(e) => setNewCustForm({ ...newCustForm, gstNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cust-type">Customer Type</label>
                  <select
                    id="cust-type"
                    className="form-input"
                    value={newCustForm.type}
                    onChange={(e) => setNewCustForm({ ...newCustForm, type: e.target.value })}
                  >
                    <option value="RETAIL">Retail</option>
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="cust-status">Initial Status</label>
                  <select
                    id="cust-status"
                    className="form-input"
                    value={newCustForm.status}
                    onChange={(e) => setNewCustForm({ ...newCustForm, status: e.target.value })}
                  >
                    <option value="LEAD">Lead</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cust-followup">First Follow-up Date</label>
                  <input
                    id="cust-followup"
                    type="date"
                    className="form-input"
                    value={newCustForm.followUpDate}
                    onChange={(e) => setNewCustForm({ ...newCustForm, followUpDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label" htmlFor="cust-address">Business Address</label>
                <input
                  id="cust-address"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Unit 4, Industrial Park Road"
                  value={newCustForm.address}
                  onChange={(e) => setNewCustForm({ ...newCustForm, address: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? "Creating..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  );
};
