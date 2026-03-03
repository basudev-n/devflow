"use client";

import { useState, useEffect, Suspense } from "react";
import { CheckCircle, XCircle, Clock, Building2, FileText, Receipt, DollarSign, Calendar, User, Mail } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ShareData {
  type: "quotation" | "invoice";
  doc: any;
  company: {
    name: string;
    address: string;
    city: string;
    country: string;
  };
}

export default function SharePage({ searchParams }: { searchParams: { token?: string; data?: string } }) {
  const [link, setLink] = useState<any>(null);
  const [document, setDocument] = useState<any>(null);
  const [documentType, setDocumentType] = useState<"quotation" | "invoice" | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [responded, setResponded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      // First check for data in URL
      if (searchParams.data) {
        const decodedData = decodeURIComponent(atob(searchParams.data));
        const shareData: ShareData = JSON.parse(decodedData);
        if (shareData.doc && shareData.type) {
          setDocument(shareData.doc);
          setDocumentType(shareData.type);
          setCompany(shareData.company);
          setLoading(false);
          return;
        }
      }
      setError("Invalid or expired link");
    } catch (e) {
      console.error(e);
      setError("Invalid link format");
    }
    setLoading(false);
  }, [searchParams]);

  const handleAccept = () => {
    setResponded(true);
  };

  const handleDecline = () => {
    setResponded(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !document || !documentType) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="bg-[#141416] border border-[#27272a] rounded-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Invalid Link</h1>
          <p className="text-[#a1a1aa] text-sm">{error || "This link is invalid or has expired"}</p>
        </div>
      </div>
    );
  }

  if (responded) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="bg-[#141416] border border-[#27272a] rounded-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Thank You!</h1>
          <p className="text-[#a1a1aa] text-sm">Your response has been recorded. We will be in touch shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#141416] border border-[#27272a] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-6 h-6" />
              <span className="font-semibold">{company?.name || "DevFlow CRM"}</span>
            </div>
            <h1 className="text-2xl font-bold">
              {documentType === "quotation" ? "Quotation" : "Invoice"} {documentType === "quotation" ? document.quotationNumber : document.invoiceNumber}
            </h1>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
              <Clock className="w-4 h-4" />
              <span>
                {documentType === "quotation" ? "Valid until " + formatDate(document.validUntil) : "Due: " + formatDate(document.dueDate)}
              </span>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1c1c1f] flex items-center justify-center">
                  <User className="w-5 h-5 text-[#a1a1aa]" />
                </div>
                <div>
                  <p className="text-xs text-[#a1a1aa]">Customer</p>
                  <p className="font-medium text-white">{document.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1c1c1f] flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#a1a1aa]" />
                </div>
                <div>
                  <p className="text-xs text-[#a1a1aa]">Email</p>
                  <p className="font-medium text-white">{document.customerEmail}</p>
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="p-4 bg-[#1c1c1f] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-indigo-500" />
                <span className="font-medium text-white">{document.projectName}</span>
              </div>
              {document.unitNumber && (
                <p className="text-sm text-[#a1a1aa]">Unit: {document.unitNumber}</p>
              )}
            </div>

            {/* Items */}
            <div>
              <h3 className="font-medium text-white mb-3">Items</h3>
              <div className="border border-[#27272a] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#1c1c1f]">
                    <tr>
                      <th className="text-left text-xs font-medium text-[#a1a1aa] px-4 py-2">Description</th>
                      <th className="text-right text-xs font-medium text-[#a1a1aa] px-4 py-2">Qty</th>
                      <th className="text-right text-xs font-medium text-[#a1a1aa] px-4 py-2">Price</th>
                      <th className="text-right text-xs font-medium text-[#a1a1aa] px-4 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {document.items.map((item: any, index: number) => (
                      <tr key={index} className="border-t border-[#27272a]">
                        <td className="px-4 py-3 text-sm text-white">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-[#a1a1aa] text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-[#a1a1aa] text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-sm text-white text-right font-medium">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#a1a1aa]">Subtotal</span>
                  <span className="text-white">{formatCurrency(document.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#a1a1aa]">GST ({document.tax}%)</span>
                  <span className="text-white">{formatCurrency(document.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-[#27272a] pt-2">
                  <span className="text-white">Total</span>
                  <span className="text-indigo-500">{formatCurrency(document.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {document.notes && (
              <div>
                <h3 className="font-medium text-white mb-2">Notes</h3>
                <p className="text-sm text-[#a1a1aa]">{document.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-[#27272a]">
              <button
                onClick={handleAccept}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Accept {documentType === "quotation" ? "Quotation" : "Pay Now"}
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1c1c1f] hover:bg-red-500/10 text-[#a1a1aa] hover:text-red-500 border border-[#27272a] py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <XCircle className="w-5 h-5" />
                Decline
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#a1a1aa] mt-4">
          Powered by DevFlow CRM
        </p>
      </div>
    </div>
  );
}
