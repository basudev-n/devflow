"use client";

import { useState } from "react";
import { Plus, Search, Grid, List, MapPin, Calendar, DollarSign, Home, MoreVertical, X, Edit, Trash2, Eye, Users, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCRM, Project } from "@/lib/crm-context";
import { formatCurrency, formatDate, cn, calculateProgress } from "@/lib/utils";

const projectStatuses = ["Planning", "In Progress", "Completed", "On Hold"] as const;
const projectTypes = ["Residential", "Commercial", "Mixed-use"] as const;

export default function ProjectsPage() {
  const { projects, units, addProject, updateProject, deleteProject } = useCRM();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    location: "",
    type: "Residential" as const,
    status: "Planning" as const,
    startDate: "",
    endDate: "",
    budget: 0,
    spent: 0,
    units: 0,
    unitsSold: 0,
    thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
  });

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesType = typeFilter === "all" || project.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getProjectUnits = (projectId: string) => {
    return units.filter(u => u.projectId === projectId);
  };

  const getAvailableUnits = (projectId: string) => {
    return units.filter(u => u.projectId === projectId && u.status === "Available").length;
  };

  const getSoldUnits = (projectId: string) => {
    return units.filter(u => u.projectId === projectId && u.status === "Sold").length;
  };

  const handleAddProject = () => {
    if (newProject.name && newProject.location) {
      addProject(newProject);
      setShowAddModal(false);
      setNewProject({
        name: "",
        description: "",
        location: "",
        type: "Residential",
        status: "Planning",
        startDate: "",
        endDate: "",
        budget: 0,
        spent: 0,
        units: 0,
        unitsSold: 0,
        thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
      });
    }
  };

  const handleUpdateProject = () => {
    if (editingProject) {
      updateProject(editingProject.id, editingProject);
      setEditingProject(null);
    }
  };

  const handleDeleteProject = () => {
    if (deletingProject) {
      deleteProject(deletingProject.id);
      setDeletingProject(null);
    }
  };

  const statusColors: Record<string, string> = {
    Planning: "bg-[var(--accent-warning)]/15 text-[var(--accent-warning)]",
    "In Progress": "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]",
    Completed: "bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)]",
    "On Hold": "bg-[var(--accent-danger)]/15 text-[var(--accent-danger)]",
  };

  const typeColors: Record<string, string> = {
    Residential: "bg-blue-500/15 text-blue-400",
    Commercial: "bg-purple-500/15 text-purple-400",
    "Mixed-use": "bg-orange-500/15 text-orange-400",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Projects</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage your development projects</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
          >
            <option value="all">All Status</option>
            {projectStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
          >
            <option value="all">All Types</option>
            {projectTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <div className="flex border border-[var(--border-default)] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2.5 transition-colors",
                viewMode === "grid" ? "bg-[var(--accent-primary)] text-white" : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2.5 transition-colors",
                viewMode === "list" ? "bg-[var(--accent-primary)] text-white" : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const projectUnits = getProjectUnits(project.id);
            const availableUnits = getAvailableUnits(project.id);
            const soldUnits = getSoldUnits(project.id);
            const progress = project.units > 0 ? Math.round((soldUnits / project.units) * 100) : 0;
            const budgetProgress = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0;

            return (
              <div
                key={project.id}
                className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden card-hover group"
              >
                {/* Thumbnail */}
                <div className="relative h-40 bg-[var(--bg-tertiary)]">
                  <img
                    src={project.thumbnail}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusColors[project.status])}>
                      {project.status}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setViewingProject(project)}>
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{project.name}</h3>
                      <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {project.location}
                      </p>
                    </div>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", typeColors[project.type])}>
                      {project.type}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">Units Sold</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{soldUnits}/{project.units}</p>
                      <div className="h-1 mt-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent-secondary)] rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">Budget</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(project.spent)}</p>
                      <div className="h-1 mt-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent-warning)] rounded-full" style={{ width: `${budgetProgress}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--border-default)]">
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => setViewingProject(project)}>
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingProject(project)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletingProject(project)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Projects List */
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-6 py-3">Project</th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-6 py-3">Location</th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-6 py-3">Type</th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-6 py-3">Units</th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-6 py-3">Budget</th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-6 py-3">Timeline</th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => {
                const soldUnits = getSoldUnits(project.id);
                return (
                  <tr key={project.id} className="border-b border-[var(--border-default)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg bg-cover bg-center"
                          style={{ backgroundImage: `url(${project.thumbnail})` }}
                        />
                        <span className="font-medium text-[var(--text-primary)]">{project.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{project.location}</td>
                    <td className="px-6 py-4">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", typeColors[project.type])}>
                        {project.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", statusColors[project.status])}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{soldUnits}/{project.units}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{formatCurrency(project.budget)}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{formatDate(project.endDate)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setViewingProject(project)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingProject(project)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeletingProject(project)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--text-muted)]">No projects found</p>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Add New Project</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Input label="Project Name" placeholder="Skyline Towers" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Description</label>
                <textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" rows={3} placeholder="Luxury residential tower..." />
              </div>
              <Input label="Location" placeholder="Downtown, Metro City" value={newProject.location} onChange={(e) => setNewProject({ ...newProject, location: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Type</label>
                  <select value={newProject.type} onChange={(e) => setNewProject({ ...newProject, type: e.target.value as any })} className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]">
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Mixed-use">Mixed-use</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Status</label>
                  <select value={newProject.status} onChange={(e) => setNewProject({ ...newProject, status: e.target.value as any })} className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]">
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date" type="date" value={newProject.startDate} onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })} />
                <Input label="End Date" type="date" value={newProject.endDate} onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Budget" type="number" value={newProject.budget} onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })} />
                <Input label="Total Units" type="number" value={newProject.units} onChange={(e) => setNewProject({ ...newProject, units: Number(e.target.value) })} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleAddProject} className="flex-1">Add Project</Button>
            </div>
          </div>
        </div>
      )}

      {/* View Project Modal */}
      {viewingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header Image */}
            <div className="relative h-48 bg-[var(--bg-tertiary)]">
              <img src={viewingProject.thumbnail} alt={viewingProject.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setViewingProject(null)} className="absolute top-4 right-4 p-2 bg-black/30 rounded-full text-white hover:bg-black/50">
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-3">
                  <span className={cn("text-sm px-3 py-1 rounded-full font-medium", statusColors[viewingProject.status])}>
                    {viewingProject.status}
                  </span>
                  <span className={cn("text-sm px-3 py-1 rounded-full", typeColors[viewingProject.type])}>
                    {viewingProject.type}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-2">{viewingProject.name}</h2>
                <p className="text-white/80 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" /> {viewingProject.location}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {viewingProject.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Description</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{viewingProject.description}</p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-4 h-4 text-[var(--accent-primary)]" />
                    <span className="text-xs text-[var(--text-muted)]">Total Units</span>
                  </div>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{viewingProject.units}</p>
                </div>
                <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-[var(--accent-secondary)]" />
                    <span className="text-xs text-[var(--text-muted)]">Sold</span>
                  </div>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{getSoldUnits(viewingProject.id)}</p>
                </div>
                <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="w-4 h-4 text-[var(--accent-warning)]" />
                    <span className="text-xs text-[var(--text-muted)]">Available</span>
                  </div>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{getAvailableUnits(viewingProject.id)}</p>
                </div>
                <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-[var(--text-muted)]">Budget</span>
                  </div>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{formatCurrency(viewingProject.budget)}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--text-muted)]">Sales Progress</span>
                    <span className="text-[var(--text-primary)]">{viewingProject.units > 0 ? Math.round((getSoldUnits(viewingProject.id) / viewingProject.units) * 100) : 0}%</span>
                  </div>
                  <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent-secondary)] rounded-full" style={{ width: `${viewingProject.units > 0 ? (getSoldUnits(viewingProject.id) / viewingProject.units) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--text-muted)]">Budget Used</span>
                    <span className="text-[var(--text-primary)]">{viewingProject.budget > 0 ? Math.round((viewingProject.spent / viewingProject.budget) * 100) : 0}%</span>
                  </div>
                  <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent-warning)] rounded-full" style={{ width: `${viewingProject.budget > 0 ? (viewingProject.spent / viewingProject.budget) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Start Date</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{formatDate(viewingProject.startDate)}</p>
                </div>
                <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                  <p className="text-xs text-[var(--text-muted)] mb-1">End Date</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{formatDate(viewingProject.endDate)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setViewingProject(null)} className="flex-1">Close</Button>
                <Button onClick={() => { setViewingProject(null); setEditingProject(viewingProject); }} className="flex-1">
                  <Edit className="w-4 h-4 mr-2" /> Edit Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Edit Project</h2>
              <button onClick={() => setEditingProject(null)} className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Input label="Project Name" value={editingProject.name} onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })} />
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Description</label>
                <textarea value={editingProject.description} onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })} className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" rows={3} />
              </div>
              <Input label="Location" value={editingProject.location} onChange={(e) => setEditingProject({ ...editingProject, location: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Type</label>
                  <select value={editingProject.type} onChange={(e) => setEditingProject({ ...editingProject, type: e.target.value as any })} className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]">
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Mixed-use">Mixed-use</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Status</label>
                  <select value={editingProject.status} onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as any })} className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]">
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date" type="date" value={editingProject.startDate} onChange={(e) => setEditingProject({ ...editingProject, startDate: e.target.value })} />
                <Input label="End Date" type="date" value={editingProject.endDate} onChange={(e) => setEditingProject({ ...editingProject, endDate: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Budget" type="number" value={editingProject.budget} onChange={(e) => setEditingProject({ ...editingProject, budget: Number(e.target.value) })} />
                <Input label="Spent" type="number" value={editingProject.spent} onChange={(e) => setEditingProject({ ...editingProject, spent: Number(e.target.value) })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Total Units" type="number" value={editingProject.units} onChange={(e) => setEditingProject({ ...editingProject, units: Number(e.target.value) })} />
                <Input label="Units Sold" type="number" value={editingProject.unitsSold} onChange={(e) => setEditingProject({ ...editingProject, unitsSold: Number(e.target.value) })} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setEditingProject(null)} className="flex-1">Cancel</Button>
              <Button onClick={handleUpdateProject} className="flex-1">Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-sm mx-4">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Delete Project</h3>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Are you sure you want to delete <span className="text-[var(--text-primary)] font-medium">{deletingProject.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setDeletingProject(null)} className="flex-1">Cancel</Button>
                <Button onClick={handleDeleteProject} className="flex-1 bg-red-500 hover:bg-red-600">Delete</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
