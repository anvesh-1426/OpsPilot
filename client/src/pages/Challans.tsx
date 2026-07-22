import React, { useState, useEffect } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  Plus,
  Trash2,
  FileText,
  User,
  Layers,
  CheckCircle,
  FileSpreadsheet,
  AlertTriangle,
  ChevronRight,
  X
} from "lucide-react";
import { Layout } from "../components/Layout";

interface ChallanItem {
  id: string;
  quantity: number;
  unitPriceSnapshot: number;
  product: {
    name: string;
    sku: string;
  };
}

interface Customer {
  id: string;
  name: string;
  businessName: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  currentStock: number;
}

interface Challan {
  id: string;
  challanNumber: string;
  totalQuantity: number;
  status: string;
  createdAt: string;
  customer: {
    name: string;
    businessName: string;
  };
  createdBy: {
    name: string;
  };
  items?: ChallanItem[];
}

interface OrderItemInput {
  productId: string;
  quantity: number;
  price: number;
  maxStock: number;
  name: string;
}

export const Challans: React.FC = () => {
  const { user } = useAuth();
  const isSalesOrAdmin = ["ADMIN", "SALES"].includes(user?.role || "");

  // Page state
  const [challans, setChallans] = useState<Challan[]>([]);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [statusFilter, setStatusFilter] = useState("");

  // Modal / Creator panel state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([]);
  const [orderStatus, setOrderStatus] = useState("DRAFT");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch all challans
  const fetchChallans = async (selectedIdToRestore?: string) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (statusFilter) queryParams.append("status", statusFilter);

      const response = await apiClient.get(`/challans?${queryParams.toString()}`);
      const list = response.data.challans || [];
      setChallans(list);

      const activeId = selectedIdToRestore || selectedChallan?.id;
      if (activeId) {
        const detailRes = await apiClient.get(`/challans/${activeId}`);
        setSelectedChallan(detailRes.data.challan);
      } else if (list.length > 0 && !selectedChallan) {
        const detailRes = await apiClient.get(`/challans/${list[0].id}`);
        setSelectedChallan(detailRes.data.challan);
      }
    } catch (err) {
      setError("Failed to fetch sales challans.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch helper options (customers and products) for the order form
  const fetchFormOptions = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        apiClient.get("/customers?status=ACTIVE"),
        apiClient.get("/products"),
      ]);
      setCustomers(custRes.data.customers || []);
      setProducts(prodRes.data.products || []);
    } catch (err) {
      console.error("Failed to load options");
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [statusFilter]);

  // Load customer/product options only when launching order builder
  useEffect(() => {
    if (showCreateModal) {
      fetchFormOptions();
    }
  }, [showCreateModal]);

  const handleSelectChallan = async (challan: Challan) => {
    try {
      const response = await apiClient.get(`/challans/${challan.id}`);
      setSelectedChallan(response.data.challan);
    } catch (err) {
      alert("Failed to load challan item breakdown.");
    }
  };

  // Add a blank row to the order items builder
  const handleAddRow = () => {
    setOrderItems([
      ...orderItems,
      { productId: "", quantity: 1, price: 0, maxStock: 0, name: "" }
    ]);
  };

  // Remove a row from the order builder
  const handleRemoveRow = (idx: number) => {
    const list = [...orderItems];
    list.splice(idx, 1);
    setOrderItems(list);
  };

  // Update item details when a product dropdown or quantity is changed
  const handleRowChange = (idx: number, field: keyof OrderItemInput, val: any) => {
    const list = [...orderItems];
    const item = list[idx];

    if (field === "productId") {
      const prod = products.find((p) => p.id === val);
      if (prod) {
        item.productId = prod.id;
        item.price = prod.unitPrice;
        item.maxStock = prod.currentStock;
        item.name = prod.name;
      } else {
        item.productId = "";
        item.price = 0;
        item.maxStock = 0;
        item.name = "";
      }
    } else if (field === "quantity") {
      const qty = parseInt(val) || 1;
      item.quantity = qty < 1 ? 1 : qty;
    }

    setOrderItems(list);
  };

  // Calculate order metrics
  const calculateTotalValue = () => {
    return orderItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  };

  const calculateChallanTotal = (ch: Challan) => {
    if (!ch.items) return 0;
    return ch.items.reduce((acc, curr) => acc + Number(curr.unitPriceSnapshot) * curr.quantity, 0);
  };

  // Confirm a draft challan
  const handleConfirmChallan = async () => {
    if (!selectedChallan) return;
    try {
      const response = await apiClient.post(`/challans/${selectedChallan.id}/confirm`);
      alert(response.data.message);
      await fetchChallans(selectedChallan.id);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to confirm challan.";
      alert(errMsg);
    }
  };

  // Submit order builder
  const handleSubmitChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validations
    if (!selectedCustomerId) {
      setFormError("Please select a customer.");
      return;
    }

    if (orderItems.length === 0) {
      setFormError("Please add at least one item to the order.");
      return;
    }

    const invalidItem = orderItems.find((item) => !item.productId);
    if (invalidItem) {
      setFormError("Please select a product for all order rows.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerId: selectedCustomerId,
        status: orderStatus,
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const response = await apiClient.post("/challans", payload);
      setShowCreateModal(false);
      
      // Reset form fields
      setSelectedCustomerId("");
      setOrderItems([]);
      setOrderStatus("DRAFT");

      // Refresh list and focus on new order
      await fetchChallans(response.data.challan.id);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to create sales challan.";
      setFormError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Sales Challans Ledgers</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Generate delivery challans, invoice snapshots, and fulfill orders.</p>
        </div>

        {isSalesOrAdmin && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            Create Sales Challan
          </button>
        )}
      </div>

      {error && <div style={{ color: "var(--color-danger)", marginBottom: "1rem" }}>{error}</div>}

      {/* Main CRM Screen Layout - Dual Pane */}
      <div style={{ display: "flex", gap: "2rem", height: "calc(100vh - 240px)", minHeight: "500px" }}>
        
        {/* LEFT PANE: Search filters and Challan card list */}
        <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {/* Status Filters bar */}
          <div className="card" style={{ padding: "1rem", flexShrink: 0 }}>
            <label className="form-label" htmlFor="status-filter">Filter by Status</label>
            <select
              id="status-filter"
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ marginTop: "0.25rem" }}
            >
              <option value="">All Orders</option>
              <option value="DRAFT">Drafts</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Scrollable list */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {loading && challans.length === 0 ? (
              <div style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: "2rem" }}>Loading orders...</div>
            ) : challans.length === 0 ? (
              <div style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "2rem" }}>No orders found.</div>
            ) : (
              challans.map((ch) => {
                const isSelected = selectedChallan?.id === ch.id;
                return (
                  <div
                    key={ch.id}
                    className="card"
                    onClick={() => handleSelectChallan(ch)}
                    style={{
                      padding: "1rem",
                      cursor: "pointer",
                      borderColor: isSelected ? "var(--accent-color)" : "var(--border-color)",
                      backgroundColor: isSelected ? "rgba(59, 130, 246, 0.05)" : "var(--bg-secondary)",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, fontFamily: "monospace" }}>
                        {ch.challanNumber}
                      </span>
                      <span className={`badge ${
                        ch.status === "CONFIRMED" ? "badge-success" :
                        ch.status === "DRAFT" ? "badge-warning" : "badge-danger"
                      }`} style={{ fontSize: "0.65rem", padding: "0.125rem 0.375rem" }}>
                        {ch.status}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      <span>Client: {ch.customer.name}</span>
                      <span>{ch.totalQuantity} items</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: Selected Challan Detail sheet */}
        <div style={{ width: "60%" }}>
          {selectedChallan ? (
            <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column", padding: "2rem", overflow: "hidden" }}>
              
              {/* Receipt Header */}
              <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1.25rem", marginBottom: "1.25rem", flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>ORDER RECEIPT</span>
                    <h3 style={{ fontSize: "1.375rem", fontWeight: 700, fontFamily: "monospace" }}>{selectedChallan.challanNumber}</h3>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <span className={`badge ${
                      selectedChallan.status === "CONFIRMED" ? "badge-success" :
                      selectedChallan.status === "DRAFT" ? "badge-warning" : "badge-danger"
                    }`}>
                      {selectedChallan.status}
                    </span>
                    {selectedChallan.status === "DRAFT" && isSalesOrAdmin && (
                      <button className="btn btn-primary" onClick={handleConfirmChallan} style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}>
                        Confirm Delivery
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "1rem" }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>CUSTOMER</span>
                    <strong>{selectedChallan.customer.name}</strong> ({selectedChallan.customer.businessName})
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>RECORDED BY</span>
                    <strong>{selectedChallan.createdBy.name}</strong> on {new Date(selectedChallan.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Items Breakdown list */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FileText size={16} style={{ color: "var(--accent-color)" }} />
                  Line Items Specification
                </h4>

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                      <th style={{ padding: "0.5rem 0" }}>Product SKU</th>
                      <th style={{ padding: "0.5rem 0" }}>Unit Price</th>
                      <th style={{ padding: "0.5rem 0", textAlign: "center" }}>Qty</th>
                      <th style={{ padding: "0.5rem 0", textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedChallan.items?.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px dotted var(--border-color)" }}>
                        <td style={{ padding: "0.75rem 0" }}>
                          <strong>{item.product.name}</strong>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", fontFamily: "monospace" }}>
                            {item.product.sku}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 0" }}>${Number(item.unitPriceSnapshot).toFixed(2)}</td>
                        <td style={{ padding: "0.75rem 0", textAlign: "center" }}>{item.quantity}</td>
                        <td style={{ padding: "0.75rem 0", textAlign: "right" }}>
                          ${(Number(item.unitPriceSnapshot) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order total footer */}
              <div style={{
                borderTop: "2px solid var(--border-color)",
                paddingTop: "1rem",
                marginTop: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0
              }}>
                <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Grand Total:</span>
                <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent-color)" }}>
                  ${calculateChallanTotal(selectedChallan).toFixed(2)}
                </span>
              </div>

            </div>
          ) : (
            <div className="card" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
              Select an order from the ledger list to view detailed invoice specifications.
            </div>
          )}
        </div>

      </div>

      {/* MODAL WINDOW: Create Sales Challan Order Builder */}
      {showCreateModal && (
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
          <div className="card" style={{ width: "100%", maxWidth: "700px", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button
              onClick={() => setShowCreateModal(false)}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Create Sales Challan Order</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Add a customer and customize product line items. Confirmed challans will immediately lock and reduce stock counts.
            </p>

            {formError && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "0.375rem",
                color: "var(--color-danger)",
                fontSize: "0.85rem",
                marginBottom: "1.25rem"
              }}>
                <AlertTriangle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitChallan}>
              
              {/* Customer selection */}
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label" htmlFor="order-cust">Select Client Profile</label>
                <select
                  id="order-cust"
                  className="form-input"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.businessName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Line items builder */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 600 }}>Invoice Line Items</h4>
                  <button type="button" className="btn btn-secondary" onClick={handleAddRow} style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}>
                    + Add Product Row
                  </button>
                </div>

                {orderItems.length === 0 ? (
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "1.5rem", backgroundColor: "var(--bg-surface)", borderRadius: "0.375rem" }}>
                    No products added to this invoice yet. Click Add Product Row to begin.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {orderItems.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        
                        {/* Select Product */}
                        <select
                          className="form-input"
                          value={item.productId}
                          onChange={(e) => handleRowChange(idx, "productId", e.target.value)}
                          style={{ flex: 2 }}
                          required
                        >
                          <option value="">-- Select SKU Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (SKU: {p.sku}) [Stock: {p.currentStock}]
                            </option>
                          ))}
                        </select>

                        {/* Price Display */}
                        <div style={{ width: "90px", fontSize: "0.85rem", color: "var(--text-secondary)", border: "1px solid var(--border-color)", padding: "0.625rem 0.5rem", borderRadius: "0.375rem", textAlign: "center" }}>
                          ${item.price.toFixed(2)}
                        </div>

                        {/* Input Quantity */}
                        <input
                          type="number"
                          className="form-input"
                          value={item.quantity}
                          onChange={(e) => handleRowChange(idx, "quantity", e.target.value)}
                          style={{ width: "90px", textAlign: "center" }}
                          min="1"
                          required
                        />

                        {/* Row Subtotal */}
                        <div style={{ width: "100px", fontSize: "0.875rem", fontWeight: 600, textAlign: "right", color: "var(--text-primary)" }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>

                        {/* Delete Row button */}
                        <button type="button" onClick={() => handleRemoveRow(idx)} style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                          <Trash2 size={16} />
                        </button>

                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Status & Grand Total */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", marginBottom: "1.5rem" }}>
                
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Order Mode:</span>
                  <select
                    className="form-input"
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    style={{ width: "150px", padding: "0.375rem", fontSize: "0.75rem" }}
                  >
                    <option value="DRAFT">Save as DRAFT</option>
                    <option value="CONFIRMED">CONFIRM (Reduce Stock)</option>
                  </select>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Order Grand Total:</span>
                  <strong style={{ fontSize: "1.375rem", color: "var(--accent-color)" }}>
                    ${calculateTotalValue().toFixed(2)}
                  </strong>
                </div>

              </div>

              {/* Footer controls */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Processing..." : "Place Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  );
};
