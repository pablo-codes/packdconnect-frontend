import React from "react";
import { Users } from "lucide-react";
import { ContactListItem, type Contact as ListItemContact } from "../ContactListItem";

interface ContactsListProps {
  loading: boolean;
  isFetchingNextPage: boolean;
  displayContacts: ListItemContact[];
  handleMessage: (contact: ListItemContact) => void;
  handleCall: (contact: ListItemContact) => void;
  observerTarget: React.RefObject<HTMLDivElement> | React.MutableRefObject<HTMLDivElement | null>;
}

export const ContactsList: React.FC<ContactsListProps> = ({
  loading,
  isFetchingNextPage,
  displayContacts,
  handleMessage,
  handleCall,
  observerTarget,
}) => {
  return (
    <div className="flex flex-col gap-6 max-w-[900px] w-full">
      {displayContacts.length === 0 && !loading ? (
        <div className="text-center py-16 bg-surface-lowest rounded-3xl border border-surface-variant/20 p-8 shadow-sm">
          <Users size={36} className="mx-auto text-on-surface-variant/40 mb-3" />
          <h3 className="text-md font-bold text-on-surface">No contacts found</h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Try adjusting your search query or add a new contact above.
          </p>
        </div>
      ) : (
        displayContacts.map((contact) => (
          <ContactListItem
            key={contact.id}
            contact={contact}
            onMessage={handleMessage}
            onCall={handleCall}
          />
        ))
      )}

      {/* Sentinel element for Infinite Scroll triggering */}
      <div ref={observerTarget} className="h-4 w-full" />

      {(loading || isFetchingNextPage) && (
        <div className="text-center py-4">
          <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto block"></span>
        </div>
      )}
    </div>
  );
};
