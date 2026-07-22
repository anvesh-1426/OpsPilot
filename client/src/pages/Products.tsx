import React, { useState, useEffect } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  Plus,
  ArrowUpDown,
  AlertTriangle,
  History,
  MapPin,
  DollarSign,
  Layers,
  X,
  RefreshCw
} from "lucide-react";
import { Layout } from "../components/Layout";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlertQty: number;
  location: string;
  createdAt: string;
}

interface StockMovement {
  id: string;
  quantityChanged: number;
  type: string;
  reason: string;
  createdAt: string;
  createdBy: {
    name: string;
    role: string;
  };
}

export const Products: React.FC = () => {
  const { user } = useAuth();
  const isWarehouseOrAdmin = ["ADMIN", "WAREHOUSE"].includes(user?.role || "");

  // Page state
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters state
  const [search, setSearch] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Modal forms state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  const [newProdForm, setNewProdForm] = useState({
    name: "",
    sku: "",
    category: "",
    unitPrice: "",
    currentStock: "0",
    minStockAlertQty: "10",
    location: ""
  });

  const [adjustForm, setAdjustForm] = useState({
    quantityChanged: "",
    type: "IN",
    reason: ""
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch product catalog
  const fetchProducts = async (selectedIdToRestore?: string) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);

      const response = await apiClient.get(`/products?${queryParams.toString()}`);
      let list: Product[] = response.data.products || [];

      // Local filter for low stock alerts
      if (lowStockFilter) {
        list = list.filter((p) => p.currentStock < p.minStockAlertQty);
      }

      setProducts(list);

      const activeId = selectedIdToRestore || selectedProduct?.id;
      if (activeId) {
        const found = list.find((p) => p.id === activeId);
        if (found) {
          setSelectedProduct(found);
          await fetchMovements(found.id);
        }
      } else if (list.length > 0 && !selectedProduct) {
        setSelectedProduct(list[0]);
        await fetchMovements(list[0].id);
      }
    } catch (err) {
      setError("Failed to fetch product inventory.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch movement logs for selected product
  const fetchMovements = async (productId: string) => {
    try {
      const response = await apiClient.get(`/products/${productId}/movements`);
      setMovements(response.data.movements || []);
    } catch (err) {
      console.error("Failed to load stock movements");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, lowStockFilter]);

  const handleSelectProduct = async (prod: Product) => {
    setSelectedProduct(prod);
    await fetchMovements(prod.id);
  };

  // Handle SKU catalog creation
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await apiClient.post("/products", newProdForm);
      setShowAddModal(false);
      setNewProdForm({
        name: "",
        sku: "",
        category: "",
        unitPrice: "",
        currentStock: "0",
        minStockAlertQty: "10",
        location: ""
      });
      // Refresh and select newly created product
      await fetchProducts(response.data.product.id);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to create product SKU.";
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle stock adjustments (IN/OUT logs)
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmitting(true);

    try {
      const payload = {
        productId: selectedProduct.id,
        quantityChanged: parseInt(adjustForm.quantityChanged),
        type: adjustForm.type,
        reason: adjustForm.reason
      };

      await apiClient.post("/products/movements", payload);
      setShowAdjustModal(false);
      setAdjustForm({
        quantityChanged: "",
        type: "IN",
        reason: ""
      });
      // Refresh inventory count and select product to refresh movement stream
      await fetchProducts(selectedProduct.id);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to adjust stock.";
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Inventory SKU Catalog</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Monitor current stock levels, low-stock warnings, and log adjustments.</p>
        </div>
        
        {isWarehouseOrAdmin && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            Register SKU Product
          </button>
        )}
      </div>

      {error && <div style={{ color: "var(--color-danger)", marginBottom: "1rem" }}>{error}</div>}

      {/* Dual Pane split layout */}
      <div style={{ display: "flex", gap: "2rem", height: "calc(100vh - 240px)", minHeight: "500px" }}>
        
        {/* LEFT PANE: Search, low stock toggle, and SKU Table */}
        <div style={{ width: "45%", display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          <div className="card" style={{ padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexShrink: 0 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search SKU, name, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "32px" }}
              />
            </div>
            
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap" }}>
              <input
                type="checkbox"
                checked={lowStockFilter}
                onChange={(e) => setLowStockFilter(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              Low Stock Only
            </label>
          </div>

          {/* Scrollable SKU Roster list */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {loading && products.length === 0 ? (
              <div style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: "2rem" }}>Loading catalog...</div>
            ) : products.length === 0 ? (
              <div style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "2rem" }}>No items match the current filters.</div>
            ) : (
              products.map((prod) => {
                const isSelected = selectedProduct?.id === prod.id;
                const isLowStock = prod.currentStock < prod.minStockAlertQty;
                
                return (
                  <div
                    key={prod.id}
                    className="card"
                    onClick={() => handleSelectProduct(prod)}
                    style={{
                      padding: "1rem",
                      cursor: "pointer",
                      borderColor: isSelected ? "var(--accent-color)" : isLowStock ? "rgba(239, 68, 68, 0.4)" : "var(--border-color)",
                      backgroundColor: isSelected ? "rgba(59, 130, 246, 0.05)" : "var(--bg-secondary)",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "monospace", display: "block" }}>
                          {prod.sku}
                        </span>
                        <h4 style={{ fontWeight: 600, fontSize: "0.95rem", color: isLowStock ? "var(--color-danger)" : "var(--text-primary)" }}>
                          {prod.name}
                        </h4>
                      </div>
                      
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "1.125rem", fontWeight: 700 }}>{prod.currentStock}</span>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>units</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                      <span>{prod.category}</span>
                      {isLowStock && (
                        <span style={{ color: "var(--color-danger)", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 600 }}>
                          <AlertTriangle size={12} />
                          Low Stock Alert (Min: {prod.minStockAlertQty})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: Product audit sheet & adjustment log details */}
        <div style={{ width: "55%" }}>
          {selectedProduct ? (
            <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column", padding: "2rem", overflow: "hidden" }}>
              
              {/* Product header summary */}
              <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1.25rem", marginBottom: "1.25rem", flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{selectedProduct.sku}</span>
                    <h3 style={{ fontSize: "1.375rem", fontWeight: 700 }}>{selectedProduct.name}</h3>
                  </div>

                  {isWarehouseOrAdmin && (
                    <button className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }} onClick={() => setShowAdjustModal(true)}>
                      <RefreshCw size={14} />
                      Adjust Stock Level
                    </button>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
                    <DollarSign size={16} style={{ color: "var(--accent-color)" }} />
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>Unit Price</span>
                      <strong style={{ color: "var(--text-primary)" }}>${Number(selectedProduct.unitPrice).toFixed(2)}</strong>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
                    <MapPin size={16} style={{ color: "var(--accent-color)" }} />
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>Location</span>
                      <strong style={{ color: "var(--text-primary)" }}>{selectedProduct.location}</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
                    <Layers size={16} style={{ color: "var(--accent-color)" }} />
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>Current Count</span>
                      <strong style={{ color: selectedProduct.currentStock < selectedProduct.minStockAlertQty ? "var(--color-danger)" : "var(--color-success)" }}>
                        {selectedProduct.currentStock} units
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Movement timeline log */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-primary)" }}>
                  <History size={16} style={{ color: "var(--accent-color)" }} />
                  Stock Movement Audit Ledger
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {movements.length === 0 ? (
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "1.5rem" }}>
                      No stock activities recorded for this SKU catalog yet.
                    </p>
                  ) : (
                    movements.map((move) => {
                      const isAddition = move.quantityChanged > 0;
                      return (
                        <div key={move.id} style={{
                          padding: "0.75rem 1rem",
                          borderRadius: "0.375rem",
                          backgroundColor: "var(--bg-surface)",
                          border: "1px solid var(--border-color)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <div>
                            <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", fontWeight: 500 }}>
                              {move.reason}
                            </p>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                              By {move.createdBy.name} ({move.createdBy.role}) on {new Date(move.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                            </span>
                          </div>
                          
                          <div style={{ textAlign: "right" }}>
                            <strong style={{
                              color: isAddition ? "var(--color-success)" : "var(--color-danger)",
                              fontSize: "1rem"
                            }}>
                              {isAddition ? `+${move.quantityChanged}` : move.quantityChanged}
                            </strong>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="card" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
              Select a product SKU from the roster list to audit history logs.
            </div>
          )}
        </div>

      </div>

      {/* MODAL WINDOW: Add Product SKU */}
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
          <div className="card" style={{ width: "100%", maxWidth: "500px", position: "relative" }}>
            <button
              onClick={() => setShowAddModal(false)}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>Register Inventory SKU Product</h3>

            <form onSubmit={handleAddProduct}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-name">Product Name</label>
                  <input
                    id="prod-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Wireless Mouse"
                    value={newProdForm.name}
                    onChange={(e) => setNewProdForm({ ...newProdForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-sku">SKU Code (Unique)</label>
                  <input
                    id="prod-sku"
                    type="text"
                    className="form-input"
                    placeholder="MS-W100"
                    value={newProdForm.sku}
                    onChange={(e) => setNewProdForm({ ...newProdForm, sku: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-category">Category</label>
                  <input
                    id="prod-category"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Electronics"
                    value={newProdForm.category}
                    onChange={(e) => setNewProdForm({ ...newProdForm, category: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-price">Unit Wholesale Price ($)</label>
                  <input
                    id="prod-price"
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="15.50"
                    value={newProdForm.unitPrice}
                    onChange={(e) => setNewProdForm({ ...newProdForm, unitPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-stock">Starting Inventory Count</label>
                  <input
                    id="prod-stock"
                    type="number"
                    className="form-input"
                    value={newProdForm.currentStock}
                    onChange={(e) => setNewProdForm({ ...newProdForm, currentStock: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-alert">Min Stock Warning Qty</label>
                  <input
                    id="prod-alert"
                    type="number"
                    className="form-input"
                    value={newProdForm.minStockAlertQty}
                    onChange={(e) => setNewProdForm({ ...newProdForm, minStockAlertQty: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label" htmlFor="prod-location">Warehouse Location</label>
                <input
                  id="prod-location"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Aisle 3A, Bin 12"
                  value={newProdForm.location}
                  onChange={(e) => setNewProdForm({ ...newProdForm, location: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW: Adjust Stock Level */}
      {showAdjustModal && selectedProduct && (
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
          <div className="card" style={{ width: "100%", maxWidth: "450px", position: "relative" }}>
            <button
              onClick={() => setShowAdjustModal(false)}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Adjust Stock Level</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Log manual inventory changes for **{selectedProduct.name}** ({selectedProduct.sku}).
            </p>

            <form onSubmit={handleAdjustStock}>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="adj-qty">Quantity Changed</label>
                  <input
                    id="adj-qty"
                    type="number"
                    min="1"
                    className="form-input"
                    placeholder="e.g. 50"
                    value={adjustForm.quantityChanged}
                    onChange={(e) => setAdjustForm({ ...adjustForm, quantityChanged: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="adj-type">Movement Type</label>
                  <select
                    id="adj-type"
                    className="form-input"
                    value={adjustForm.type}
                    onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                  >
                    <option value="IN">IN (Stock Addition)</option>
                    <option value="OUT">OUT (Stock Deduction)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label" htmlFor="adj-reason">Reason for Adjustment</label>
                <input
                  id="adj-reason"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Replenished from Supplier / Damaged batch discarded"
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdjustModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Apply Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  );
};
