"use client";

import { useState } from "react";
import { Search, Plus, Mail, Phone, Building2, User, DollarSign, Handshake, X, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCRM, Contact } from "@/lib/crm-context";
import { cn, getInitials } from "@/lib/utils";

export default function ContactsPage() {
  const { contacts, addContact, updateContact, deleteContact } = useCRM();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState({
    type: "Buyer" as "Buyer" | "Investor" | "Partner" | "Vendor",
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  const handleAddContact = () => {
    if (!newContact.name || !newContact.email) return;
    addContact({
      type: newContact.type,
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone,
      company: newContact.company,
    });
    setNewContact({ type: "Buyer", name: "", email: "", phone: "", company: "" });
    setShowAddModal(false);
  };

  const handleUpdateContact = () => {
    if (!editingContact || !editingContact.name || !editingContact.email) return;
    updateContact(editingContact.id, editingContact);
    setEditingContact(null);
  };

  const handleDeleteContact = (contact: Contact) => {
    setDeletingContact(contact);
  };

  const confirmDeleteContact = () => {
    if (deletingContact) {
      deleteContact(deletingContact.id);
      setDeletingContact(null);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "all" || contact.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const typeColors: Record<string, string> = {
    Buyer: "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]",
    Investor: "bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)]",
    Partner: "bg-purple-500/15 text-purple-400",
    Vendor: "bg-[var(--accent-warning)]/15 text-[var(--accent-warning)]",
  };

  const typeIcons: Record<string, React.ReactNode> = {
    Buyer: <User className="w-4 h-4" />,
    Investor: <DollarSign className="w-4 h-4" />,
    Partner: <Handshake className="w-4 h-4" />,
    Vendor: <Building2 className="w-4 h-4" />,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Contacts</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage your contacts and relationships</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {["all", "Buyer", "Investor", "Partner", "Vendor"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                typeFilter === type
                  ? "bg-[var(--accent-primary)] text-white"
                  : "bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
              )}
            >
              {type === "all" ? "All" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <div key={contact.id} className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5 card-hover">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {getInitials(contact.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-[var(--text-primary)] truncate">{contact.name}</h3>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full flex items-center gap-1", typeColors[contact.type])}>
                    {typeIcons[contact.type]}
                    {contact.type}
                  </span>
                </div>
                {contact.company && (
                  <p className="text-sm text-[var(--text-muted)] truncate mb-3">{contact.company}</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border-default)] space-y-2">
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                <Mail className="w-4 h-4" />
                <span className="truncate">{contact.email}</span>
              </a>
              <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                <Phone className="w-4 h-4" />
                <span>{contact.phone}</span>
              </a>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1">Message</Button>
              <Button variant="ghost" size="sm" onClick={() => setEditingContact(contact)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteContact(contact)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--text-muted)]">No contacts found</p>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Add Contact</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Type</label>
                <select
                  value={newContact.type}
                  onChange={(e) => setNewContact({ ...newContact, type: e.target.value as any })}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                >
                  <option value="Buyer">Buyer</option>
                  <option value="Investor">Investor</option>
                  <option value="Partner">Partner</option>
                  <option value="Vendor">Vendor</option>
                </select>
              </div>

              <Input
                label="Name"
                placeholder="John Doe"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />

              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              />

              <Input
                label="Phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              />

              <Input
                label="Company"
                placeholder="Acme Inc."
                value={newContact.company}
                onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleAddContact} className="flex-1">Add Contact</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Edit Contact</h3>
              <button onClick={() => setEditingContact(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Type</label>
                <select
                  value={editingContact.type}
                  onChange={(e) => setEditingContact({ ...editingContact, type: e.target.value as any })}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                >
                  <option value="Buyer">Buyer</option>
                  <option value="Investor">Investor</option>
                  <option value="Partner">Partner</option>
                  <option value="Vendor">Vendor</option>
                </select>
              </div>

              <Input
                label="Name"
                placeholder="John Doe"
                value={editingContact.name}
                onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
              />

              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={editingContact.email}
                onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
              />

              <Input
                label="Phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={editingContact.phone}
                onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
              />

              <Input
                label="Company"
                placeholder="Acme Inc."
                value={editingContact.company || ""}
                onChange={(e) => setEditingContact({ ...editingContact, company: e.target.value })}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setEditingContact(null)} className="flex-1">Cancel</Button>
              <Button onClick={handleUpdateContact} className="flex-1">Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-sm mx-4">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Delete Contact</h3>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Are you sure you want to delete <span className="text-[var(--text-primary)] font-medium">{deletingContact.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setDeletingContact(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={confirmDeleteContact} className="flex-1 bg-red-500 hover:bg-red-600">
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
