"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";

interface Props {
  propertyId: string;
  userName: string;
  userEmail: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function InterestModal({
  propertyId,
  userName,
  userEmail,
  onSuccess,
  onClose,
}: Props) {
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);

  function validatePhone(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return "Phone number is required";
    if (!/^[6-9]\d{9}$/.test(trimmed)) return "Enter a valid 10-digit Indian mobile number";
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validatePhone(phone);
    if (err) { setPhoneError(err); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/inquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to register interest");
        return;
      }

      onSuccess();
      toast.success("Interest registered! The owner will review and may reach out to you.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      subtitle="Register Interest"
      title="Confirm your details"
      description="The owner will use these details to reach out to you directly."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name — read-only */}
        <div>
          <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#1A1A1A]/45 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={userName}
            readOnly
            className="w-full border border-gray-200 bg-[#fafafa] rounded-sm px-3.5 py-3 text-sm text-[#0B0B0C]/60 cursor-default outline-none"
          />
        </div>

        {/* Email — read-only */}
        <div>
          <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#1A1A1A]/45 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={userEmail}
            readOnly
            className="w-full border border-gray-200 bg-[#fafafa] rounded-sm px-3.5 py-3 text-sm text-[#0B0B0C]/60 cursor-default outline-none"
          />
        </div>

        {/* Phone — required */}
        <div>
          <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#1A1A1A]/45 mb-1.5">
            Contact Number{" "}
            <span className="text-[#0B0B0C]/40 normal-case tracking-normal font-normal text-[11px]">
              (required)
            </span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
            placeholder="98765 43210"
            autoFocus
            className={`w-full border bg-white rounded-sm px-3.5 py-3 text-sm text-[#0B0B0C] placeholder:text-[#1A1A1A]/30 outline-none transition-colors ${
              phoneError ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-[#0B0B0C]/40"
            }`}
          />
          {phoneError && (
            <p className="text-xs text-red-500 mt-1">{phoneError}</p>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={loading || !phone.trim()}
            className="w-full rounded-full bg-[#0B0B0C] hover:bg-[#0B0B0C]/90 text-white gap-2 py-5 text-sm font-medium tracking-wide transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Confirm Interest
          </Button>
        </div>
      </form>

      <p className="text-[10px] text-center text-[#1A1A1A]/35 mt-4 leading-relaxed tracking-wide">
        100% Verified Property
      </p>
    </Modal>
  );
}
