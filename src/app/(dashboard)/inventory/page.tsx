"use client";

import { useState } from "react";
import { Search, Plus, Grid, List, Filter, X, Edit, Trash2, Eye, AlertTriangle, CheckCircle, Ban, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCRM, Unit } from "@/lib/crm-context";
import { formatCurrency, cn, generateId } from "@/lib/utils";

const unitStatuses = ["Available", "Reserved", "Sold", "Blocked"] as const;
const unitTypes = ["Studio", "1BR", "2BR", "3BR", "Penthouse", "Villa"] as const;

export default function InventoryPage() {
  const { units, projects, addUnit, updateUnit, deleteUnit, addActivity } = useCRM();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [viewingUnit, setViewingUnit] = useState<Unit | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [showBulkAction, setShowBulkAction] = useState(false);

  // Form state
  const [newUnit, setNewUnit] = useState({
    projectId: "",
    unitNumber: "",
    floor: 1,
    type: "2BR" as typeof unitTypes[number],
    bedrooms: 2,
    bathrooms: 2,
    sizeSqft: 1000,
    price: 0,
    status: "Available" as typeof unitStatuses[number],
    features: [] as string[],
  });
  const [newFeature, setNewFeature] = useState("");

  const filteredUnits = units.filter((unit) => {
    const project = projects.find(p => p.id === unit.projectId);
    const matchesSearch = unit.unitNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || unit.status === statusFilter;
    const matchesType = typeFilter === "all" || unit.type === typeFilter;
    const matchesProject = projectFilter === "all" || unit.projectId === projectFilter;
    return matchesSearch && matchesStatus && matchesType && matchesProject;
  });

  // Stats
  const availableCount = units.filter(u => u.status === "Available").length;
  const reservedCount = units.filter(u => u.status === "Reserved").length;
  const soldCount = units.filter(u => u.status === "Sold").length;
  const blockedCount = units.filter(u => u.status === "Blocked").length;
  const totalValue = units.filter(u => u.status === "Available" || u.status === "Reserved").reduce((sum, u) => sum + u.price, 0);

  const handleAddUnit = () => {
    if (!newUnit.projectId || !newUnit.unitNumber || newUnit.price <= 0) return;
    addUnit(newUnit);
    const project = projects.find(p => p.id === newUnit.projectId);
    addActivity({ type: "project", title: "Unit Added", description: `Unit ${newUnit.unitNumber} added to ${project?.name}`, user: "You" });
    setNewUnit({ projectId: "", unitNumber: "", floor: 1, type: "2BR", bedrooms: 2, bathrooms: 2, sizeSqft: 1000, price: 0, status: "Available", features: [] });
    setShowAddModal(false);
  };

  const handleUpdateUnit = () => {
    if (!editingUnit || !editingUnit.projectId || !editingUnit.unitNumber) return;
    updateUnit(editingUnit.id, editingUnit);
    setEditingUnit(null);
  };

  const handleDeleteUnit = () => {
    if (deletingUnit) {
      deleteUnit(deletingUnit.id);
      setDeletingUnit(null);
    }
  };

  const handleQuickAction = (unit: Unit, action: "reserve" | "release" | "block" | "sold") => {
    const statusMap: Record<string, "Available" | "Reserved" | "Sold" | "Blocked"> = {
      reserve: "Reserved",
      release: "Available",
      block: "Blocked",
      sold: "Sold",
    };
    updateUnit(unit.id, { status: statusMap[action] });
    const project = projects.find(p => p.id === unit.projectId);
    addActivity({ type: "project", title: `Unit ${statusMap[action]}`, description: `Unit ${unit.unitNumber} marked as ${statusMap[action]} in ${project?.name}`, user: "You" });
  };

  const handleBulkAction = (status: "Available" | "Reserved" | "Sold" | "Blocked") => {
    selectedUnits.forEach(id => updateUnit(id, { status }));
    addActivity({ type: "project", title: "Bulk Update", description: `${selectedUnits.length} units updated to ${status}`, user: "You" });
    setSelectedUnits([]);
  };

  const toggleSelectUnit = (id: string) => {
    setSelectedUnits(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedUnits.length === filteredUnits.length) {
      setSelectedUnits([]);
    } else {
      setSelectedUnits(filteredUnits.map(u => u.id));
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setNewUnit(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setNewUnit(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const statusColors: Record<string, string> = {
    Available: "bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)]",
    Reserved: "bg-[var(--accent-warning)]/15 text-[var(--accent-warning)]",
    Sold: "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]",
    Blocked: "bg-[var(--accent-danger)]/15 text-[var(--accent-danger)]",
  };

  const typeIcons: Record<string, string> = {
    Studio: "S",
    "1BR": "1",
    "2BR": "2",
    "3BR": "3",
    Penthouse: "P",
    Villa: "V",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Inventory</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage your property units</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Unit
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search units..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
          >
            <option value="all">All Status</option>
            {unitStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
          >
            <option value="all">All Types</option>
            {unitTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex border border-[var(--border-default)] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("p-2.5 transition-colors", viewMode === "grid" ? "bg-[var(--accent-primary)] text-white" : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]")}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-2.5 transition-colors", viewMode === "list" ? "bg-[var(--accent-primary)] text-white" : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-4">
          <p className="text-xs text-[var(--text-muted)] mb-1">Available</p>
          <p className="text-2xl font-semibold text-[var(--accent-secondary)]">{availableCount}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-4">
          <p className="text-xs text-[var(--text-muted)] mb-1">Reserved</p>
          <p className="text-2xl font-semibold text-[var(--accent-warning)]">{reservedCount}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-4">
          <p className="text-xs text-[var(--text-muted)] mb-1">Sold</p>
          <p className="text-2xl font-semibold text-[var(--accent-primary)]">{soldCount}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-4">
          <p className="text-xs text-[var(--text-muted)] mb-1">Blocked</p>
          <p className="text-2xl font-semibold text-[var(--accent-danger)]">{blockedCount}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-4">
          <p className="text-xs text-[var(--text-muted)] mb-1">Total Value</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)]">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUnits.length > 0 && (
        <div className="bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-[var(--text-primary)]">
            <span className="font-semibold">{selectedUnits.length}</span> unit(s) selected
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleBulkAction("Available")}>Release</Button>
            <Button size="sm" onClick={() => handleBulkAction("Reserved")}>Reserve</Button>
            <Button size="sm" onClick={() => handleBulkAction("Blocked")}>Block</Button>
            <Button size="sm" variant="secondary" onClick={() => setSelectedUnits([])}>Clear</Button>
          </div>
        </div>
      )}

      {/* Units Grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUnits.map((unit) => {
            const project = projects.find(p => p.id === unit.projectId);
            return (
              <div key={unit.id} className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden card-hover">
                {/* Checkbox */}
                <div className="p-3 border-b border-[var(--border-default)] flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUnits.includes(unit.id)}
                      onChange={() => toggleSelectUnit(unit.id)}
                      className="w-4 h-4 rounded border-[var(--border-default)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                    />
                    <span className="text-xs text-[var(--text-muted)]">Select</span>
                  </label>
                  <div className="flex gap-1">
                    <button onClick={() => setViewingUnit(unit)} className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded">
                      <Eye className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                    <button onClick={() => setEditingUnit(unit)} className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded">
                      <Edit className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                    <button onClick={() => setDeletingUnit(unit)} className="p-1.5 hover:bg-red-500/10 rounded">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                {/* Unit Visual */}
                <div className="h-32 bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-elevated)] flex items-center justify-center relative">
                  <span className="text-4xl font-bold text-[var(--text-muted)] opacity-30">{typeIcons[unit.type]}</span>
                  <span className={cn("absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-medium", statusColors[unit.status])}>
                    {unit.status}
                  </span>
                </div>
                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[var(--text-primary)]">Unit {unit.unitNumber}</h3>
                    <span className="text-xs px-2 py-0.5 bg-[var(--bg-tertiary)] rounded text-[var(--text-muted)]">{unit.type}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mb-3">{project?.name}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">{unit.bedrooms} bed, {unit.bathrooms} bath</span>
                    <span className="text-[var(--text-muted)]">{unit.sizeSqft} sqft</span>
                  </div>
                  <p className="text-lg font-semibold text-[var(--accent-primary)] mt-3">{formatCurrency(unit.price)}</p>

                  {/* Quick Actions */}
                  <div className="flex gap-1 mt-3 pt-3 border-t border-[var(--border-default)]">
                    {unit.status === "Available" && (
                      <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => handleQuickAction(unit, "reserve")}>
                        <Clock className="w-3 h-3 mr-1" /> Reserve
                      </Button>
                    )}
                    {unit.status === "Reserved" && (
                      <>
                        <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => handleQuickAction(unit, "sold")}>
                          <CheckCircle className="w-3 h-3 mr-1" /> Sold
                        </Button>
                        <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => handleQuickAction(unit, "release")}>
                          Release
                        </Button>
                      </>
                    )}
                    {unit.status === "Blocked" && (
                      <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => handleQuickAction(unit, "release")}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Release
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedUnits.length === filteredUnits.length && filteredUnits.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 rounded border-[var(--border-default)]"
                  />
                </th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Unit</th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Project</th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Type</th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Floor</th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Details</th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Size</th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Price</th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.map((unit) => {
                const project = projects.find(p => p.id === unit.projectId);
                return (
                  <tr key={unit.id} className="border-b border-[var(--border-default)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUnits.includes(unit.id)}
                        onChange={() => toggleSelectUnit(unit.id)}
                        className="w-4 h-4 rounded border-[var(--border-default)]"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">Unit {unit.unitNumber}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{project?.name}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{unit.type}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">Floor {unit.floor}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{unit.bedrooms} bed, {unit.bathrooms} bath</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{unit.sizeSqft} sqft</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[var(--accent-primary)]">{formatCurrency(unit.price)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", statusColors[unit.status])}>{unit.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setViewingUnit(unit)} className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded">
                          <Eye className="w-4 h-4 text-[var(--text-muted)]" />
                        </button>
                        <button onClick={() => setEditingUnit(unit)} className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded">
                          <Edit className="w-4 h-4 text-[var(--text-muted)]" />
                        </button>
                        <button onClick={() => setDeletingUnit(unit)} className="p-1.5 hover:bg-red-500/10 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredUnits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--text-muted)]">No units found</p>
        </div>
      )}

      {/* Add Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-2xl mx-4 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Add New Unit</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Project</label>
                <select
                  value={newUnit.projectId}
                  onChange={(e) => setNewUnit({ ...newUnit, projectId: e.target.value })}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <Input
                label="Unit Number"
                placeholder="e.g., 101, A-201"
                value={newUnit.unitNumber}
                onChange={(e) => setNewUnit({ ...newUnit, unitNumber: e.target.value })}
              />

              <Input
                label="Floor"
                type="number"
                placeholder="1"
                value={newUnit.floor}
                onChange={(e) => setNewUnit({ ...newUnit, floor: parseInt(e.target.value) || 1 })}
              />

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Type</label>
                <select
                  value={newUnit.type}
                  onChange={(e) => setNewUnit({ ...newUnit, type: e.target.value as typeof unitTypes[number] })}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                >
                  {unitTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <Input
                label="Price"
                type="number"
                placeholder="0"
                value={newUnit.price}
                onChange={(e) => setNewUnit({ ...newUnit, price: parseInt(e.target.value) || 0 })}
              />

              <Input
                label="Bedrooms"
                type="number"
                placeholder="2"
                value={newUnit.bedrooms}
                onChange={(e) => setNewUnit({ ...newUnit, bedrooms: parseInt(e.target.value) || 0 })}
              />

              <Input
                label="Bathrooms"
                type="number"
                placeholder="2"
                value={newUnit.bathrooms}
                onChange={(e) => setNewUnit({ ...newUnit, bathrooms: parseInt(e.target.value) || 0 })}
              />

              <Input
                label="Size (sqft)"
                type="number"
                placeholder="1000"
                value={newUnit.sizeSqft}
                onChange={(e) => setNewUnit({ ...newUnit, sizeSqft: parseInt(e.target.value) || 0 })}
              />

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Status</label>
                <select
                  value={newUnit.status}
                  onChange={(e) => setNewUnit({ ...newUnit, status: e.target.value as typeof unitStatuses[number] })}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                >
                  {unitStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Features</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add feature (e.g., Sea View)"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addFeature()}
                  />
                  <Button onClick={addFeature} variant="secondary">Add</Button>
                </div>
                {newUnit.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newUnit.features.map((f, i) => (
                      <span key={i} className="px-2 py-1 bg-[var(--bg-tertiary)] rounded-full text-xs text-[var(--text-secondary)] flex items-center gap-1">
                        {f}
                        <button onClick={() => removeFeature(i)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleAddUnit} className="flex-1">Add Unit</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Unit Modal */}
      {editingUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-2xl mx-4 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Edit Unit</h3>
              <button onClick={() => setEditingUnit(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Project</label>
                <select
                  value={editingUnit.projectId}
                  onChange={(e) => setEditingUnit({ ...editingUnit, projectId: e.target.value })}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <Input
                label="Unit Number"
                placeholder="e.g., 101, A-201"
                value={editingUnit.unitNumber}
                onChange={(e) => setEditingUnit({ ...editingUnit, unitNumber: e.target.value })}
              />

              <Input
                label="Floor"
                type="number"
                value={editingUnit.floor}
                onChange={(e) => setEditingUnit({ ...editingUnit, floor: parseInt(e.target.value) || 1 })}
              />

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Type</label>
                <select
                  value={editingUnit.type}
                  onChange={(e) => setEditingUnit({ ...editingUnit, type: e.target.value as typeof unitTypes[number] })}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                >
                  {unitTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <Input
                label="Price"
                type="number"
                value={editingUnit.price}
                onChange={(e) => setEditingUnit({ ...editingUnit, price: parseInt(e.target.value) || 0 })}
              />

              <Input
                label="Bedrooms"
                type="number"
                value={editingUnit.bedrooms}
                onChange={(e) => setEditingUnit({ ...editingUnit, bedrooms: parseInt(e.target.value) || 0 })}
              />

              <Input
                label="Bathrooms"
                type="number"
                value={editingUnit.bathrooms}
                onChange={(e) => setEditingUnit({ ...editingUnit, bathrooms: parseInt(e.target.value) || 0 })}
              />

              <Input
                label="Size (sqft)"
                type="number"
                value={editingUnit.sizeSqft}
                onChange={(e) => setEditingUnit({ ...editingUnit, sizeSqft: parseInt(e.target.value) || 0 })}
              />

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Status</label>
                <select
                  value={editingUnit.status}
                  onChange={(e) => setEditingUnit({ ...editingUnit, status: e.target.value as typeof unitStatuses[number] })}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                >
                  {unitStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setEditingUnit(null)} className="flex-1">Cancel</Button>
              <Button onClick={handleUpdateUnit} className="flex-1">Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* View Unit Modal */}
      {viewingUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Unit Details</h3>
              <button onClick={() => setViewingUnit(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-lg">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Unit</p>
                  <p className="font-semibold text-[var(--text-primary)]">{viewingUnit.unitNumber}</p>
                </div>
                <span className={cn("text-sm px-3 py-1 rounded-full font-medium", statusColors[viewingUnit.status])}>
                  {viewingUnit.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Project</p>
                  <p className="text-sm text-[var(--text-primary)]">{projects.find(p => p.id === viewingUnit.projectId)?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Type</p>
                  <p className="text-sm text-[var(--text-primary)]">{viewingUnit.type}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Floor</p>
                  <p className="text-sm text-[var(--text-primary)]">{viewingUnit.floor}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Size</p>
                  <p className="text-sm text-[var(--text-primary)]">{viewingUnit.sizeSqft} sqft</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Bedrooms</p>
                  <p className="text-sm text-[var(--text-primary)]">{viewingUnit.bedrooms}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Bathrooms</p>
                  <p className="text-sm text-[var(--text-primary)]">{viewingUnit.bathrooms}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)] mb-2">Price</p>
                <p className="text-2xl font-bold text-[var(--accent-primary)]">{formatCurrency(viewingUnit.price)}</p>
              </div>

              {viewingUnit.features.length > 0 && (
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-2">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingUnit.features.map((f, i) => (
                      <span key={i} className="px-3 py-1 bg-[var(--bg-tertiary)] rounded-full text-xs text-[var(--text-secondary)]">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setViewingUnit(null)} className="flex-1">Close</Button>
              <Button onClick={() => { setViewingUnit(null); setEditingUnit(viewingUnit); }} className="flex-1">
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-sm mx-4">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Delete Unit</h3>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Are you sure you want to delete <span className="text-[var(--text-primary)] font-medium">Unit {deletingUnit.unitNumber}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setDeletingUnit(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleDeleteUnit} className="flex-1 bg-red-500 hover:bg-red-600">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
