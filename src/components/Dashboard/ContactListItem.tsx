import React from "react";
import { MessageSquare, Phone } from "lucide-react";

export interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  tag: string;
  isActive: boolean;
}

interface ContactListItemProps {
  contact: Contact;
  onMessage: (contact: Contact) => void;
  onCall: (contact: Contact) => void;
}

export const ContactListItem: React.FC<ContactListItemProps> = ({
  contact,
  onMessage,
  onCall,
}) => {
  return (
    <div
      className="flex items-center justify-between p-6 bg-surface-lowest rounded-[32px] ambient-shadow hover:-translate-y-1 transition-all hover:shadow-tactile duration-300"
    >
      <div className="flex items-center gap-4">
        {/* Avatar with Status indicator */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full bg-secondary-fixed-dim/40 border border-surface-variant/30 flex items-center justify-center font-bold text-on-secondary-fixed text-md">
            {contact.name[0]?.toUpperCase() || "C"}
          </div>
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              contact.isActive ? "bg-secondary" : "bg-tertiary-container"
            }`}
          />
        </div>

        {/* Text details */}
        <div className="flex flex-col">
          <span className="font-bold text-on-surface text-[15px]">
            {contact.name}
          </span>
          <span className="text-[12px] text-on-surface-variant/80 mt-0.5">
            {contact.email}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => onMessage(contact)}
          className="py-2.5 px-5 text-[13px] font-bold bg-surface-container-low hover:bg-surface-container-high text-primary flex items-center gap-1.5 rounded-full shadow-none border-none transition-colors shrink-0"
        >
          <MessageSquare size={16} />
          <span className="hidden sm:inline">Message</span>
        </button>
        <button
          onClick={() => onCall(contact)}
          className="py-2.5 px-5 text-[13px] font-bold bg-surface-container-low hover:bg-surface-container-high text-secondary flex items-center gap-1.5 rounded-full shadow-none border-none transition-colors shrink-0"
        >
          <Phone size={16} />
          <span className="hidden sm:inline">Call</span>
        </button>
      </div>
    </div>
  );
};
