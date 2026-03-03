"use client";

import { useState } from "react";
import { Search, Plus, MoreVertical, Phone, Mail, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCRM, Lead } from "@/lib/crm-context";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const pipelineStages = ["New", "Contacted", "Qualified", "Negotiation", "Won", "Lost"] as const;

function SortableLeadCard({ lead, onDelete }: { lead: Lead; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-4 cursor-grab active:cursor-grabbing card-hover"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-[var(--text-primary)]">{lead.name}</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{lead.projectInterest}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--accent-danger)]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-3">
        <p className="text-xs text-[var(--text-muted)] mb-1">Budget</p>
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {formatCurrency(lead.budgetMin)} - {formatCurrency(lead.budgetMax)}
        </p>
      </div>

      <div className="space-y-2 text-xs text-[var(--text-muted)]">
        {lead.unitTypeInterest && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[var(--bg-tertiary)] rounded">{lead.unitTypeInterest}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Mail className="w-3 h-3" />
          <span className="truncate">{lead.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3 h-3" />
          <span>{lead.phone}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-purple-600 flex items-center justify-center text-white text-xs font-medium">
            {lead.assignedTo.split(" ").map(n => n[0]).join("")}
          </div>
          <span className="text-xs text-[var(--text-muted)]">{lead.assignedTo}</span>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{formatDate(lead.createdAt)}</span>
      </div>
    </div>
  );
}

function LeadColumn({
  stage,
  leads,
  onDelete,
}: {
  stage: string;
  leads: Lead[];
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const stageColors: Record<string, string> = {
    New: "bg-[var(--accent-info)]",
    Contacted: "bg-[var(--accent-primary)]",
    Qualified: "bg-[var(--accent-warning)]",
    Negotiation: "bg-purple-400",
    Won: "bg-[var(--accent-secondary)]",
    Lost: "bg-[var(--accent-danger)]",
  };

  return (
    <div className="flex-shrink-0 w-72">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", stageColors[stage])} />
          <span className="text-sm font-medium text-[var(--text-primary)]">{stage}</span>
          <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full">
            {leads.length}
          </span>
        </div>
        <button className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            "space-y-3 min-h-[200px] p-2 rounded-lg transition-colors",
            isOver && "bg-[var(--accent-primary)]/10 border-2 border-dashed border-[var(--accent-primary)]"
          )}
        >
          {leads.map((lead) => (
            <SortableLeadCard key={lead.id} lead={lead} onDelete={() => onDelete(lead.id)} />
          ))}
          {leads.length === 0 && (
            <div className="h-20 flex items-center justify-center text-sm text-[var(--text-muted)] border border-dashed border-[var(--border-default)] rounded-lg">
              Drop leads here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function LeadsPage() {
  const { leads, moveLeadStage, deleteLead, addLead } = useCRM();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    source: "Website" as const,
    budgetMin: 0,
    budgetMax: 0,
    projectInterest: "",
    unitTypeInterest: "",
    assignedTo: "Sarah Johnson",
    stage: "New" as const,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLeadsByStage = (stage: string) => filteredLeads.filter((lead) => lead.stage === stage);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeLead = leads.find((l) => l.id === active.id);
    if (!activeLead) return;

    // Check if dropped on a column
    const overStage = pipelineStages.find((stage) => stage === over.id);
    if (overStage && activeLead.stage !== overStage) {
      moveLeadStage(activeLead.id, overStage);
      return;
    }

    // Check if dropped on another lead
    const overLead = leads.find((l) => l.id === over.id);
    if (overLead && activeLead.stage !== overLead.stage) {
      moveLeadStage(activeLead.id, overLead.stage);
    }
  };

  const handleAddLead = () => {
    if (newLead.name && newLead.email) {
      addLead(newLead);
      setShowAddModal(false);
      setNewLead({
        name: "",
        email: "",
        phone: "",
        source: "Website",
        budgetMin: 0,
        budgetMax: 0,
        projectInterest: "",
        unitTypeInterest: "",
        assignedTo: "Sarah Johnson",
        stage: "New",
      });
    }
  };

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Leads Pipeline</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Track and manage your sales leads</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search leads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipelineStages.map((stage) => (
            <LeadColumn
              key={stage}
              stage={stage}
              leads={getLeadsByStage(stage)}
              onDelete={deleteLead}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--accent-primary)] border-2 rounded-xl p-4 shadow-xl opacity-90">
              <h3 className="font-medium text-[var(--text-primary)]">{activeLead.name}</h3>
              <p className="text-xs text-[var(--text-muted)]">{activeLead.projectInterest}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Add New Lead</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Name</label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Email</label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Phone</label>
                <input
                  type="tel"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  placeholder="+1 555-0000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Budget Min</label>
                  <input
                    type="number"
                    value={newLead.budgetMin}
                    onChange={(e) => setNewLead({ ...newLead, budgetMin: Number(e.target.value) })}
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Budget Max</label>
                  <input
                    type="number"
                    value={newLead.budgetMax}
                    onChange={(e) => setNewLead({ ...newLead, budgetMax: Number(e.target.value) })}
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Project Interest</label>
                <input
                  type="text"
                  value={newLead.projectInterest}
                  onChange={(e) => setNewLead({ ...newLead, projectInterest: e.target.value })}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  placeholder="Skyline Towers"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Source</label>
                <select
                  value={newLead.source}
                  onChange={(e) => setNewLead({ ...newLead, source: e.target.value as any })}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                >
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Agent">Agent</option>
                  <option value="Advertisement">Advertisement</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddLead} className="flex-1">
                Add Lead
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
