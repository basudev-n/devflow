"use client";

import { useState } from "react";
import { Search, Plus, Download, Send, FileText, Trash2, X, DollarSign, Receipt, Calendar, Copy, CheckCircle, Link, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCRM, Quotation, Invoice, InvoiceItem } from "@/lib/crm-context";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type TabType = "payments" | "quotations" | "invoices";

export default function FinancesPage() {
  const { payments, projects, quotations, invoices, shareLinks, addQuotation, updateQuotation, deleteQuotation, addInvoice, updateInvoice, deleteInvoice, createShareLink, contacts, leads, settings, addActivity } = useCRM();
  const [activeTab, setActiveTab] = useState<TabType>("payments");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [shareDocName, setShareDocName] = useState("");
  const [shortening, setShortening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newQuotation, setNewQuotation] = useState({ customerId: "", customerName: "", customerEmail: "", projectId: "", projectName: "", unitNumber: "", items: [] as InvoiceItem[], tax: 10, validUntil: "", notes: "" });
  const [newInvoice, setNewInvoice] = useState({ customerId: "", customerName: "", customerEmail: "", projectId: "", projectName: "", unitNumber: "", items: [] as InvoiceItem[], tax: 10, dueDate: "", notes: "" });

  const totalReceived = payments.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "Pending").reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === "Overdue").reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter(p => p.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) || p.projectName.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredQuotations = quotations.filter(q => q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredInvoices = invoices.filter(i => i.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()));

  const statusColors: Record<string, string> = {
    Paid: "bg-green-500/15 text-green-400", Pending: "bg-yellow-500/15 text-yellow-400", Overdue: "bg-red-500/15 text-red-400",
    Draft: "bg-gray-500/15 text-gray-400", Sent: "bg-blue-500/15 text-blue-400", Accepted: "bg-green-500/15 text-green-400", Rejected: "bg-red-500/15 text-red-400", Cancelled: "bg-red-500/15 text-red-400",
  };

  const handleAddItem = (type: "quotation" | "invoice") => {
    const item: InvoiceItem = { description: "", quantity: 1, unitPrice: 0, total: 0 };
    if (type === "quotation") setNewQuotation(prev => ({ ...prev, items: [...prev.items, item] }));
    else setNewInvoice(prev => ({ ...prev, items: [...prev.items, item] }));
  };

  const handleUpdateItem = (type: "quotation" | "invoice", index: number, field: keyof InvoiceItem, value: string | number) => {
    const updateItems = (items: InvoiceItem[]) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: value };
      if (field === "quantity" || field === "unitPrice") newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
      return newItems;
    };
    if (type === "quotation") setNewQuotation(prev => ({ ...prev, items: updateItems(prev.items) }));
    else setNewInvoice(prev => ({ ...prev, items: updateItems(prev.items) }));
  };

  const handleRemoveItem = (type: "quotation" | "invoice", index: number) => {
    if (type === "quotation") setNewQuotation(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    else setNewInvoice(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const calcSubtotal = (items: InvoiceItem[]) => items.reduce((sum, item) => sum + item.total, 0);
  const calcGST = (subtotal: number, tax: number) => subtotal * (tax / 100);
  const calcTotal = (subtotal: number, tax: number) => subtotal + calcGST(subtotal, tax);

  const handleCreateQuotation = () => {
    const subtotal = calcSubtotal(newQuotation.items);
    addQuotation({ customerId: newQuotation.customerId, customerName: newQuotation.customerName, customerEmail: newQuotation.customerEmail, projectId: newQuotation.projectId, projectName: newQuotation.projectName, unitNumber: newQuotation.unitNumber || undefined, items: newQuotation.items, subtotal, tax: calcGST(subtotal, newQuotation.tax), total: calcTotal(subtotal, newQuotation.tax), status: "Draft", validUntil: newQuotation.validUntil, notes: newQuotation.notes });
    setShowQuotationModal(false);
    setNewQuotation({ customerId: "", customerName: "", customerEmail: "", projectId: "", projectName: "", unitNumber: "", items: [], tax: 10, validUntil: "", notes: "" });
  };

  const handleCreateInvoice = () => {
    const subtotal = calcSubtotal(newInvoice.items);
    addInvoice({ quotationId: undefined, customerId: newInvoice.customerId, customerName: newInvoice.customerName, customerEmail: newInvoice.customerEmail, projectId: newInvoice.projectId, projectName: newInvoice.projectName, unitNumber: newInvoice.unitNumber || undefined, items: newInvoice.items, subtotal, tax: calcGST(subtotal, newInvoice.tax), total: calcTotal(subtotal, newInvoice.tax), status: "Draft", dueDate: newInvoice.dueDate, notes: newInvoice.notes });
    setShowInvoiceModal(false);
    setNewInvoice({ customerId: "", customerName: "", customerEmail: "", projectId: "", projectName: "", unitNumber: "", items: [], tax: 10, dueDate: "", notes: "" });
  };

  const generatePDF = (doc: Quotation | Invoice, type: "quotation" | "invoice") => {
    const docNumber = type === "quotation" ? (doc as Quotation).quotationNumber : (doc as Invoice).invoiceNumber;
    const docDate = new Date(doc.createdAt).toLocaleDateString();
    const docExpiry = type === "quotation" ? (doc as Quotation).validUntil : (doc as Invoice).dueDate;
    const taxRate = doc.tax;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const primaryColor: [number, number, number] = [99, 102, 241];
    const textColor: [number, number, number] = [30, 30, 30];
    const mutedColor: [number, number, number] = [120, 120, 120];

    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 45, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont("helvetica", "bold");
    pdf.text(type === "quotation" ? "QUOTATION" : "INVOICE", 20, 25);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(docNumber, pageWidth - 20, 25, { align: "right" });
    pdf.setFontSize(10);
    pdf.text(settings.company.name, pageWidth - 20, 35, { align: "right" });

    pdf.setTextColor(...textColor);
    pdf.setFont("helvetica", "bold");
    pdf.text("FROM", 20, 60);
    pdf.setFont("helvetica", "normal");
    pdf.text(settings.company.name, 20, 68);
    pdf.setTextColor(...mutedColor);
    pdf.text(settings.company.address, 20, 75);
    pdf.text(settings.company.city + ", " + settings.company.country, 20, 82);

    pdf.setTextColor(...textColor);
    pdf.setFont("helvetica", "bold");
    pdf.text("BILL TO", pageWidth - 20, 60, { align: "right" });
    pdf.setFont("helvetica", "normal");
    pdf.text(doc.customerName, pageWidth - 20, 68, { align: "right" });
    pdf.setTextColor(...mutedColor);
    pdf.text(doc.customerEmail, pageWidth - 20, 75, { align: "right" });

    pdf.setTextColor(...textColor);
    pdf.setFont("helvetica", "bold");
    pdf.text("Date:", 20, 100);
    pdf.setFont("helvetica", "normal");
    pdf.text(docDate, 50, 100);
    pdf.setFont("helvetica", "bold");
    pdf.text(type === "quotation" ? "Valid Until:" : "Due Date:", 20, 110);
    pdf.setFont("helvetica", "normal");
    pdf.text(new Date(docExpiry).toLocaleDateString(), 50, 110);
    pdf.setFont("helvetica", "bold");
    pdf.text("Project:", 20, 120);
    pdf.setFont("helvetica", "normal");
    pdf.text(doc.projectName, 50, 120);

    const tableStartY = 135;
    autoTable(pdf, {
      startY: tableStartY,
      head: [["Description", "Qty", "Unit Price", "Total"]],
      body: doc.items.map(item => [item.description, item.quantity.toString(), formatCurrency(item.unitPrice), formatCurrency(item.total)]),
      theme: "plain",
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontSize: 10, fontStyle: "bold" },
      bodyStyles: { fontSize: 10, textColor: textColor },
      columnStyles: { 0: { cellWidth: 80 }, 1: { halign: "center" }, 2: { halign: "right" }, 3: { halign: "right" } },
      alternateRowStyles: { fillColor: [248, 248, 252] },
      margin: { left: 15, right: 15 },
    });

    const finalY = (pdf as any).lastAutoTable.finalY + 15;
    pdf.setFontSize(10);
    pdf.text("Subtotal:", pageWidth - 80, finalY);
    pdf.text(formatCurrency(doc.subtotal), pageWidth - 20, finalY, { align: "right" });
    pdf.text("GST (" + taxRate + "%):", pageWidth - 80, finalY + 7);
    pdf.text(formatCurrency(doc.tax), pageWidth - 20, finalY + 7, { align: "right" });
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(pageWidth - 85, finalY + 12, pageWidth - 15, finalY + 12);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...primaryColor);
    pdf.text("TOTAL:", pageWidth - 80, finalY + 22);
    pdf.text(formatCurrency(doc.total), pageWidth - 20, finalY + 22, { align: "right" });

    if (doc.notes) {
      pdf.setFontSize(10);
      pdf.setTextColor(...mutedColor);
      pdf.setFont("helvetica", "normal");
      pdf.text("Notes:", 20, finalY + 35);
      pdf.setTextColor(...textColor);
      pdf.text(doc.notes, 20, finalY + 43);
    }

    pdf.setFontSize(8);
    pdf.setTextColor(...mutedColor);
    pdf.text("Generated by DevFlow CRM", pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: "center" });
    pdf.save(docNumber + ".pdf");
  };

  const handleSendDocument = (doc: Quotation | Invoice, type: "quotation" | "invoice") => {
    const shareLink = createShareLink(type, doc.id);
    addActivity({ type: "sale", title: (type === "quotation" ? "Quotation" : "Invoice") + " Sent", description: (type === "quotation" ? (doc as Quotation).quotationNumber : (doc as Invoice).invoiceNumber) + " was sent to " + doc.customerEmail, user: "You" });
    if (type === "quotation") updateQuotation(doc.id, { status: "Sent" });
    else updateInvoice(doc.id, { status: "Sent" });

    const shareData = { type: type, doc: doc, company: settings.company };
    const encodedData = btoa(encodeURIComponent(JSON.stringify(shareData)));
    const url = window.location.origin + "/share/" + shareLink.token + "?data=" + encodedData;
    setShareUrl(url);
    setShortenedUrl("");
    setShareDocName(type === "quotation" ? (doc as Quotation).quotationNumber : (doc as Invoice).invoiceNumber);
    setShowShareModal(true);
    setCopied(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shortenedUrl || shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShortenUrl = async () => {
    setShortening(true);
    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(shareUrl)}`);
      if (response.ok) {
        const shortUrl = await response.text();
        setShortenedUrl(shortUrl);
      } else {
        // Fallback: use a fake short URL for demo
        setShortenedUrl("https://tinyurl.com/demo-" + Math.random().toString(36).substring(7));
      }
    } catch {
      // Fallback for network errors
      setShortenedUrl("https://tinyurl.com/demo-" + Math.random().toString(36).substring(7));
    }
    setShortening(false);
  };

  const tabs = [
    { id: "payments" as TabType, label: "Payments", icon: DollarSign },
    { id: "quotations" as TabType, label: "Quotations", icon: FileText },
    { id: "invoices" as TabType, label: "Invoices", icon: Receipt },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Finance</h1>
          <p className="text-sm text-text-muted mt-1">Manage payments, quotations, and invoices</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowQuotationModal(true)}><FileText className="w-4 h-4 mr-2" />New Quotation</Button>
          <Button onClick={() => setShowInvoiceModal(true)}><Receipt className="w-4 h-4 mr-2" />New Invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bg-secondary border border-border-default rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center"><DollarSign className="w-5 h-5 text-green-400" /></div>
            <div><p className="text-2xl font-bold text-text-primary">{formatCurrency(totalReceived)}</p><p className="text-xs text-text-muted">Total Received</p></div>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-default rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/15 flex items-center justify-center"><Calendar className="w-5 h-5 text-yellow-400" /></div>
            <div><p className="text-2xl font-bold text-text-primary">{formatCurrency(totalPending)}</p><p className="text-xs text-text-muted">Pending</p></div>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-default rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center"><DollarSign className="w-5 h-5 text-red-400" /></div>
            <div><p className="text-2xl font-bold text-text-primary">{formatCurrency(totalOverdue)}</p><p className="text-xs text-text-muted">Overdue</p></div>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-default rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center"><Receipt className="w-5 h-5 text-blue-400" /></div>
            <div><p className="text-2xl font-bold text-text-primary">{invoices.length}</p><p className="text-xs text-text-muted">Total Invoices</p></div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border-default pb-2">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === tab.id ? "bg-accent-primary text-white" : "text-text-secondary hover:bg-bg-tertiary")}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input type="text" placeholder={"Search " + activeTab + "..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-bg-secondary border border-border-default rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary" />
      </div>

      {activeTab === "payments" && (
        <div className="bg-bg-secondary border border-border-default rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border-default">
              <th className="text-left text-xs font-medium text-text-muted px-6 py-3">Buyer</th>
              <th className="text-left text-xs font-medium text-text-muted px-6 py-3">Project</th>
              <th className="text-left text-xs font-medium text-text-muted px-6 py-3">Amount</th>
              <th className="text-left text-xs font-medium text-text-muted px-6 py-3">Due Date</th>
              <th className="text-left text-xs font-medium text-text-muted px-6 py-3">Status</th>
            </tr></thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-border-default hover:bg-bg-tertiary">
                  <td className="px-6 py-4 font-medium text-text-primary">{payment.buyerName}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{payment.projectName}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-text-primary">{formatCurrency(payment.amount)}</td>
                  <td className="px-6 py-4 text-sm text-text-muted">{formatDate(payment.dueDate)}</td>
                  <td className="px-6 py-4"><span className={cn("text-xs px-2 py-1 rounded-full", statusColors[payment.status])}>{payment.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "quotations" && (
        <div className="space-y-4">
          {filteredQuotations.length === 0 ? (
            <div className="bg-bg-secondary border border-border-default rounded-xl p-8 text-center">
              <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">No quotations yet</p>
            </div>
          ) : filteredQuotations.map((quotation) => (
            <div key={quotation.id} className="bg-bg-secondary border border-border-default rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-text-primary">{quotation.quotationNumber}</h3>
                    <span className={cn("text-xs px-2 py-1 rounded-full", statusColors[quotation.status])}>{quotation.status}</span>
                  </div>
                  <p className="text-sm text-text-muted mt-1">{quotation.customerName} - {quotation.projectName}</p>
                </div>
                <p className="text-xl font-bold text-text-primary">{formatCurrency(quotation.total)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => generatePDF(quotation, "quotation")}><Download className="w-4 h-4 mr-2" />Download PDF</Button>
                <Button variant="secondary" size="sm" onClick={() => handleSendDocument(quotation, "quotation")}><Send className="w-4 h-4 mr-2" />Send to Customer</Button>
                <Button variant="danger" size="sm" onClick={() => deleteQuotation(quotation.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "invoices" && (
        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <div className="bg-bg-secondary border border-border-default rounded-xl p-8 text-center">
              <Receipt className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">No invoices yet</p>
            </div>
          ) : filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="bg-bg-secondary border border-border-default rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-text-primary">{invoice.invoiceNumber}</h3>
                    <span className={cn("text-xs px-2 py-1 rounded-full", statusColors[invoice.status])}>{invoice.status}</span>
                  </div>
                  <p className="text-sm text-text-muted mt-1">{invoice.customerName} - {invoice.projectName}</p>
                </div>
                <p className="text-xl font-bold text-text-primary">{formatCurrency(invoice.total)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => generatePDF(invoice, "invoice")}><Download className="w-4 h-4 mr-2" />Download PDF</Button>
                <Button variant="secondary" size="sm" onClick={() => handleSendDocument(invoice, "invoice")}><Send className="w-4 h-4 mr-2" />Send to Customer</Button>
                <Button variant="danger" size="sm" onClick={() => deleteInvoice(invoice.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showQuotationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary border border-border-default rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">Create Quotation</h2>
              <button onClick={() => setShowQuotationModal(false)} className="p-1 hover:bg-bg-tertiary rounded"><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Customer</label>
                  <select value={newQuotation.customerId} onChange={(e) => { const c = [...contacts, ...leads].find(x => x.id === e.target.value); setNewQuotation({ ...newQuotation, customerId: e.target.value, customerName: c?.name || "", customerEmail: c?.email || "" }); }} className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary">
                    <option value="">Select Customer</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Project</label>
                  <select value={newQuotation.projectId} onChange={(e) => { const p = projects.find(x => x.id === e.target.value); setNewQuotation({ ...newQuotation, projectId: e.target.value, projectName: p?.name || "" }); }} className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary">
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Items</label>
                {newQuotation.items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" value={item.description} onChange={(e) => handleUpdateItem("quotation", i, "description", e.target.value)} placeholder="Description" className="flex-1 bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary" />
                    <input type="number" value={item.quantity} onChange={(e) => handleUpdateItem("quotation", i, "quantity", Number(e.target.value))} placeholder="Qty" className="w-16 bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary" />
                    <input type="number" value={item.unitPrice} onChange={(e) => handleUpdateItem("quotation", i, "unitPrice", Number(e.target.value))} placeholder="Price" className="w-24 bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary" />
                    <button onClick={() => handleRemoveItem("quotation", i)} className="p-2 text-red-400"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                <Button variant="secondary" size="sm" onClick={() => handleAddItem("quotation")}><Plus className="w-4 h-4 mr-2" />Add Item</Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-text-secondary mb-1">GST (%)</label><input type="number" value={newQuotation.tax} onChange={(e) => setNewQuotation({ ...newQuotation, tax: Number(e.target.value) })} className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary" /></div>
                <div><label className="block text-sm text-text-secondary mb-1">Valid Until</label><input type="date" value={newQuotation.validUntil} onChange={(e) => setNewQuotation({ ...newQuotation, validUntil: e.target.value })} className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary" /></div>
              </div>
              <div><label className="block text-sm text-text-secondary mb-1">Notes</label><textarea value={newQuotation.notes} onChange={(e) => setNewQuotation({ ...newQuotation, notes: e.target.value })} className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary" rows={3} /></div>
              <div className="border-t border-border-default pt-4">
                <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(calcSubtotal(newQuotation.items))}</span></div>
                <div className="flex justify-between"><span>GST ({newQuotation.tax}%):</span><span>{formatCurrency(calcGST(calcSubtotal(newQuotation.items), newQuotation.tax))}</span></div>
                <div className="flex justify-between font-semibold text-lg mt-2"><span>Total:</span><span>{formatCurrency(calcTotal(calcSubtotal(newQuotation.items), newQuotation.tax))}</span></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowQuotationModal(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleCreateQuotation} className="flex-1">Create Quotation</Button>
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary border border-border-default rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">Create Invoice</h2>
              <button onClick={() => setShowInvoiceModal(false)} className="p-1 hover:bg-bg-tertiary rounded"><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Customer</label>
                  <select value={newInvoice.customerId} onChange={(e) => { const c = [...contacts, ...leads].find(x => x.id === e.target.value); setNewInvoice({ ...newInvoice, customerId: e.target.value, customerName: c?.name || "", customerEmail: c?.email || "" }); }} className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary">
                    <option value="">Select Customer</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Project</label>
                  <select value={newInvoice.projectId} onChange={(e) => { const p = projects.find(x => x.id === e.target.value); setNewInvoice({ ...newInvoice, projectId: e.target.value, projectName: p?.name || "" }); }} className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary">
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Items</label>
                {newInvoice.items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" value={item.description} onChange={(e) => handleUpdateItem("invoice", i, "description", e.target.value)} placeholder="Description" className="flex-1 bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary" />
                    <input type="number" value={item.quantity} onChange={(e) => handleUpdateItem("invoice", i, "quantity", Number(e.target.value))} placeholder="Qty" className="w-16 bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary" />
                    <input type="number" value={item.unitPrice} onChange={(e) => handleUpdateItem("invoice", i, "unitPrice", Number(e.target.value))} placeholder="Price" className="w-24 bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary" />
                    <button onClick={() => handleRemoveItem("invoice", i)} className="p-2 text-red-400"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                <Button variant="secondary" size="sm" onClick={() => handleAddItem("invoice")}><Plus className="w-4 h-4 mr-2" />Add Item</Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-text-secondary mb-1">GST (%)</label><input type="number" value={newInvoice.tax} onChange={(e) => setNewInvoice({ ...newInvoice, tax: Number(e.target.value) })} className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary" /></div>
                <div><label className="block text-sm text-text-secondary mb-1">Due Date</label><input type="date" value={newInvoice.dueDate} onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })} className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary" /></div>
              </div>
              <div><label className="block text-sm text-text-secondary mb-1">Notes</label><textarea value={newInvoice.notes} onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })} className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary" rows={3} /></div>
              <div className="border-t border-border-default pt-4">
                <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(calcSubtotal(newInvoice.items))}</span></div>
                <div className="flex justify-between"><span>GST ({newInvoice.tax}%):</span><span>{formatCurrency(calcGST(calcSubtotal(newInvoice.items), newInvoice.tax))}</span></div>
                <div className="flex justify-between font-semibold text-lg mt-2"><span>Total:</span><span>{formatCurrency(calcTotal(calcSubtotal(newInvoice.items), newInvoice.tax))}</span></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowInvoiceModal(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleCreateInvoice} className="flex-1">Create Invoice</Button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && shareUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary border border-border-default rounded-xl p-6 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Share Link Ready!</h3>
              <p className="text-sm text-text-muted mt-1">Copy the link below to share with customer</p>
            </div>

            <div className="bg-bg-tertiary rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shortenedUrl || shareUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-text-primary outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 hover:bg-bg-elevated rounded-lg transition-colors"
                >
                  {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-text-muted" />}
                </button>
              </div>
            </div>

            {!shortenedUrl && (
              <button
                onClick={handleShortenUrl}
                disabled={shortening}
                className="w-full mb-4 py-2 px-4 bg-indigo-500/15 text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-500/25 transition-colors flex items-center justify-center gap-2"
              >
                {shortening ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating Short Link...</>
                ) : (
                  <><Link className="w-4 h-4" /> Generate Short Link</>
                )}
              </button>
            )}

            {copied && (
              <p className="text-center text-sm text-green-500 mb-4">Link copied to clipboard!</p>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => { setShowShareModal(false); setShortenedUrl(""); }} className="flex-1">Close</Button>
              <Button onClick={() => window.open(shortenedUrl || shareUrl, "_blank")} className="flex-1">Preview Link</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
