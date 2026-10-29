import { useState } from "react";
import { X, MessageSquare } from "lucide-react";
import Button from "./ui/Button";
import api from "../api/client";
import { useToast } from "./ui/Toast";

interface ClaimModalProps {
  itemId: string;
  itemTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClaimModal({ itemId, itemTitle, onClose, onSuccess }: ClaimModalProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      showToast("Please write at least 10 characters", "error");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/items/${itemId}/claims`, { message: message.trim() });
      showToast("Claim submitted! The owner will review it.");
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to submit claim", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Claim this item</h2>
            <p className="text-sm text-slate-500 truncate max-w-[280px]">{itemTitle}</p>
          </div>
        </div>

        <p className="text-sm text-slate-500 mt-4 mb-4">
          Describe the item in detail — unique marks, contents, where you last saw it.
          The person who found it will use this to verify you're the owner.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Your message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder="e.g., It's a black leather wallet with brown stitching. There's a photo of a golden retriever inside the card slot..."
              className="input resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">{message.length} characters</p>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Submit claim
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}