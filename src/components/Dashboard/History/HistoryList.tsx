import React from "react";
import { History } from "lucide-react";
import { HistoryItemCard, type HistoryItem } from "../HistoryItemCard";

interface GroupedHistory {
  date: string;
  items: HistoryItem[];
}

interface HistoryListProps {
  loading: boolean;
  groupedHistory: GroupedHistory[];
  handleActionClick: (item: HistoryItem) => void;
  isFetchingNextPage?: boolean;
  observerTarget?: React.RefObject<HTMLDivElement | null>;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  loading,
  groupedHistory,
  handleActionClick,
  isFetchingNextPage,
  observerTarget,
}) => {
  return (
    <div className="flex flex-col gap-8 max-w-[900px] w-full">
      {loading ? (
        <div className="text-center py-16">
          <span className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto block"></span>
          <span className="text-[13px] font-bold text-on-surface-variant mt-3 block">
            Loading activity history...
          </span>
        </div>
      ) : groupedHistory.length === 0 ? (
        <div className="text-center py-16 bg-surface-lowest rounded-3xl border border-surface-variant/20 p-8 shadow-sm">
          <History size={36} className="mx-auto text-on-surface-variant/40 mb-3" />
          <h3 className="text-md font-bold text-on-surface">No history found</h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Your calls and message activity will appear here.
          </p>
        </div>
      ) : (
        groupedHistory.map((group) => (
          <div key={group.date} className="flex flex-col gap-3">
            <h2 className="text-[12px] font-extrabold text-on-surface-variant uppercase tracking-wider pl-2">
              {group.date}
            </h2>
            <div className="flex flex-col gap-3">
              {group.items.map((item) => (
                <HistoryItemCard
                  key={item.id}
                  item={item}
                  onActionClick={handleActionClick}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Loading indicator for infinite scroll */}
      {isFetchingNextPage && (
        <div className="text-center py-4">
          <span className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto block"></span>
        </div>
      )}

      {/* Intersection Observer Target */}
      <div ref={observerTarget} className="h-4 w-full" />
    </div>
  );
};
