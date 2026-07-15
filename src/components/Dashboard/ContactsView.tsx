import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Search, Plus } from 'lucide-react';
import { AddContactModal } from './AddContactModal';
import type { Contact as ListItemContact } from './ContactListItem';
import { ContactsList } from './Contacts/ContactsList';
import { useContactsQueries } from '../../queries/useContactsQueries';

export const ContactsView: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { conversations, setActiveRoomId, users } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const callTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // TanStack Infinite Query for paginated contacts with search
  const {
    contactsQuery: {
      data,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading: loading,
    },
    addContactMutation
  } = useContactsQueries(searchQuery);

  // Extract flat list of contacts and map to match ContactListItem's expected type
  const contacts: ListItemContact[] = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((pageData) =>
      pageData.contacts.map((c: any) => ({
        id: c.id,
        name: c.username,
        email: c.email,
        role: "Team Member",
        tag: "Product",
        isActive: false,
      }))
    );
  }, [data]);

  // Intersection Observer for triggering page loads on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Clean up call timeout on unmount
  useEffect(() => {
    return () => {
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
      }
    };
  }, []);

  const getIsActive = (contactId: string) => {
    if (contactId === currentUser?.id) return true;
    const sysUser = users.find((u) => u.id === contactId);
    return sysUser?.presence === "online";
  };

  const displayContacts: ListItemContact[] = contacts.map((c) => ({
    ...c,
    isActive: getIsActive(c.id),
  }));

  const handleMessage = (contact: ListItemContact) => {
    const existingDm = conversations.find(
      (c) => !c.is_group && c.participants.some((p) => p.id === contact.id)
    );

    if (existingDm) {
      setActiveRoomId(existingDm.id);
      navigate(`/chat/${existingDm.id}`);
    } else {
      const draftRoomId = `draft-${contact.id}`;
      setActiveRoomId(draftRoomId);
      navigate(`/chat/${draftRoomId}`);
    }
  };

  const handleCall = (contact: ListItemContact) => {
    const existingDm = conversations.find(
      (c) => !c.is_group && c.participants.some((p) => p.id === contact.id)
    );
    if (existingDm) {
      navigate(`/chat/${existingDm.id}`);
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
      }
      callTimeoutRef.current = setTimeout(() => {
        const initiateBtn = document.querySelector('[title="Start Voice Call"]') as HTMLButtonElement;
        if (initiateBtn) initiateBtn.click();
        callTimeoutRef.current = null;
      }, 500);
    } else {
      console.log('[ContactsView] No active room for direct call. Opening draft...');
      const draftRoomId = `draft-${contact.id}`;
      setActiveRoomId(draftRoomId);
      navigate(`/chat/${draftRoomId}`);
    }
  };

  const handleAddContactSubmit = async (email: string) => {
    setModalError(null);
    setIsSubmitting(true);

    try {
      await addContactMutation.mutateAsync(email);
      setShowAddModal(false);
    } catch (err: any) {
      setModalError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow h-full flex flex-col bg-background overflow-y-auto select-none relative">
      {/* Header section */}
      <div className="sticky top-0 z-10 bg-background px-4 md:px-8 pt-4 md:pt-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm md:shadow-none">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-extrabold text-on-surface tracking-tight">Your Contacts</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="flex items-center gap-2 bg-surface-lowest px-4 py-3 sm:py-2.5 rounded-full border border-surface-variant/30 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all w-full sm:w-[240px]">
            <Search size={16} className="text-on-surface-variant/60" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[14px] sm:text-xs w-full text-on-surface placeholder-on-surface-variant/50 focus:ring-0 p-0"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            aria-label="Add New Contact"
            className="btn btn-primary py-3 sm:py-2.5 px-5 text-[14px] sm:text-xs font-bold  flex items-center justify-center gap-1.5 rounded-full shadow-md border-none cursor-pointer w-full sm:w-auto"
          >
            <Plus size={16} />
            <span>Add New Contact</span>
          </button>
        </div>
      </div>

      {/* Contacts List Stack */}
      <div className="px-4 md:px-8 pb-[90px] md:pb-8 pt-4 md:pt-8 flex-grow">
        <ContactsList
          loading={loading}
          isFetchingNextPage={isFetchingNextPage}
          displayContacts={displayContacts}
          handleMessage={handleMessage}
          handleCall={handleCall}
          observerTarget={observerTarget}
        />
      </div>

      {/* Add Contact Modal Overlay */}
      <AddContactModal
        show={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setModalError(null);
        }}
        onSubmit={handleAddContactSubmit}
        isSubmitting={isSubmitting}
        error={modalError}
      />
    </div>
  );
};
