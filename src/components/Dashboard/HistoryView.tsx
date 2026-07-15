import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../context/ChatContext";
import { useCall } from "../../context/CallContext";
import { Search } from "lucide-react";
import { useHistoryQueries } from "../../queries/useHistoryQueries";
import type { HistoryItem } from "./HistoryItemCard";
import { HistoryList } from "./History/HistoryList";

interface GroupedHistory {
  date: string;
  items: HistoryItem[];
}

export const HistoryView: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveRoomId } = useChat();
  const { initiateCall } = useCall();
  const [searchQuery, setSearchQuery] = useState("");
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Fetch history using React Query custom hook
  const {
    historyQuery: {
      data,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading: loading,
    }
  } = useHistoryQueries();

  // Extract flat list of history items
  const historyItems: HistoryItem[] = useMemo(() => {
    if (!data) return [];
    return data.pages.flat();
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

  const handleActionClick = (item: HistoryItem) => {
    const isCall = item.type.includes("call") || item.type.includes("video");
    if (isCall) {
      const isVideo = item.type.includes("video");
      if (item.roomId && item.peerId) {
        initiateCall(item.roomId, item.peerId, isVideo ? "video" : "voice");
      } else {
        console.warn(
          "[HistoryView] Cannot call back: missing roomId or peerId",
        );
      }
    } else {
      if (item.roomId) {
        setActiveRoomId(item.roomId);
        navigate(`/chat/${item.roomId}`);
      }
    }
  };

  const groupHistoryByDate = (items: HistoryItem[]): GroupedHistory[] => {
    const groups: { [key: string]: HistoryItem[] } = {};

    // Sort items descending first
    const sortedItems = [...items].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    );

    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yestYear = yesterday.getFullYear();
    const yestMonth = yesterday.getMonth();
    const yestDate = yesterday.getDate();

    sortedItems.forEach((item) => {
      const d = new Date(item.time);
      const y = d.getFullYear();
      const m = d.getMonth();
      const day = d.getDate();

      let dateStr: string;
      if (y === todayYear && m === todayMonth && day === todayDate) {
        dateStr = "Today";
      } else if (y === yestYear && m === yestMonth && day === yestDate) {
        dateStr = "Yesterday";
      } else {
        dateStr = d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }

      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(item);
    });

    return Object.keys(groups)
      .map((date) => ({
        date,
        items: groups[date],
      }))
      .sort((a, b) => {
        const timeA = new Date(a.items[0].time).getTime();
        const timeB = new Date(b.items[0].time).getTime();
        return timeB - timeA;
      });
  };

  const filteredItems = historyItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.detail.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const groupedHistory = groupHistoryByDate(filteredItems);

  return (
    <div className="flex-grow h-full flex flex-col bg-background overflow-y-auto select-none relative">
      {/* Header section */}
      <div className="sticky top-0 z-10 bg-background px-4 md:px-8 pt-4 md:pt-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm md:shadow-none">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-extrabold text-on-surface tracking-tight">
            History
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="flex items-center gap-2 bg-surface-lowest px-4 py-3 sm:py-2.5 rounded-full border border-surface-variant/30 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all w-full sm:w-[240px]">
            <Search size={16} className="text-on-surface-variant/60" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[14px] sm:text-xs w-full text-on-surface placeholder-on-surface-variant/50 focus:ring-0 p-0"
            />
          </div>
        </div>
      </div>

      {/* History List Stack */}
      <div className="px-4 md:px-8 pb-[90px] md:pb-8 pt-4 md:pt-8 flex-grow">
        <HistoryList
          loading={loading}
          groupedHistory={groupedHistory}
          handleActionClick={handleActionClick}
          isFetchingNextPage={isFetchingNextPage}
          observerTarget={observerTarget}
        />
      </div>
    </div>
  );
};
