import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface AddContactModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  show,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}) => {
  const [email, setEmail] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await onSubmit(email.trim());
    setEmail("");
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (!show) return;

    let focusTimeoutId: ReturnType<typeof setTimeout> | null = null;

    // Focus the email input immediately when shown
    const input = modalRef.current?.querySelector('input');
    if (input) {
      focusTimeoutId = setTimeout(() => input.focus(), 50);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (focusTimeoutId) {
        clearTimeout(focusTimeoutId);
      }
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-md p-4 transition-all duration-300"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-surface-lowest border border-surface-variant rounded-2xl shadow-tactile w-full max-w-[420px] p-6 flex flex-col gap-5"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-[16px] font-extrabold text-on-surface">
            Add New Contact
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-on-surface-variant hover:text-on-surface bg-transparent border-none cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-[#ffdad6] text-[#93000a] text-[13px] font-medium p-3.5 rounded-[12px] border border-[#ffb4ab] text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. marcus@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-4"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            aria-label="Add Contact"
            className="btn btn-primary w-full h-[48px] justify-center mt-2 rounded-full border-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Contact"}
          </button>
        </form>
      </div>
    </div>
  );
};
