import React from 'react';
import { PhoneMissed, MessageSquare, ArrowUpRight, ArrowDownLeft, XCircle } from 'lucide-react';

export interface HistoryItem {
  id: string;
  name: string;
  email: string;
  type: 'incoming_call' | 'outgoing_call' | 'missed_call' | 'rejected_call' | 'incoming_video' | 'outgoing_video' | 'missed_video' | 'rejected_video' | 'message';
  detail: string;
  time: string;
  duration?: string;
  roomId?: string;
  peerId?: string;
}

interface HistoryItemCardProps {
  item: HistoryItem;
  onActionClick: (item: HistoryItem) => void;
}

export const HistoryItemCard: React.FC<HistoryItemCardProps> = ({ item, onActionClick }) => {
  // Determine indicators and styles based on history type
  const getIconProps = () => {
    switch (item.type) {
      case 'incoming_call':
        return {
          badgeBg: 'bg-secondary',
          badgeIcon: <ArrowDownLeft size={10} className="text-white" />
        };
      case 'outgoing_call':
        return {
          badgeBg: 'bg-primary',
          badgeIcon: <ArrowUpRight size={10} className="text-white" />
        };
      case 'missed_call':
        return {
          badgeBg: 'bg-[#ba1a1a]',
          badgeIcon: <PhoneMissed size={10} className="text-white" />
        };
      case 'rejected_call':
        return {
          badgeBg: 'bg-gray-500',
          badgeIcon: <XCircle size={10} className="text-white" />
        };
      case 'incoming_video':
        return {
          badgeBg: 'bg-secondary',
          badgeIcon: <ArrowDownLeft size={10} className="text-white" />
        };
      case 'outgoing_video':
        return {
          badgeBg: 'bg-primary',
          badgeIcon: <ArrowUpRight size={10} className="text-white" />
        };
      case 'missed_video':
        return {
          badgeBg: 'bg-[#ba1a1a]',
          badgeIcon: <PhoneMissed size={10} className="text-white" />
        };
      case 'rejected_video':
        return {
          badgeBg: 'bg-gray-500',
          badgeIcon: <XCircle size={10} className="text-white" />
        };
      case 'message':
      default:
        return {
          badgeBg: 'bg-surface-container-highest',
          badgeIcon: <MessageSquare size={10} className="text-on-surface-variant" />
        };
    }
  };

  const { badgeBg, badgeIcon } = getIconProps();

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) {
      return timeStr;
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCall = item.type.includes('call') || item.type.includes('video');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 bg-surface-lowest rounded-[24px] sm:rounded-[32px] ambient-shadow hover:-translate-y-1 transition-all hover:shadow-tactile duration-300 gap-4 sm:gap-0">
      <div className="flex items-center gap-4">
        {/* Avatar with visual status badge */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full bg-secondary-fixed-dim/40 border border-surface-variant/30 flex items-center justify-center font-bold text-on-secondary-fixed text-md">
            {item.name[0]?.toUpperCase() || 'C'}
          </div>
          <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${badgeBg}`}>
            {badgeIcon}
          </div>
        </div>

        {/* Text Details */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-on-surface text-[15px]">{item.name}</span>
            {item.duration && (
              <span className="text-[11px] font-semibold text-secondary bg-secondary-container px-2 py-0.5 rounded-full">
                {item.duration}
              </span>
            )}
          </div>
          <span className="text-[12px] text-on-surface-variant/80 mt-0.5">{item.detail}</span>
        </div>
      </div>

      {/* Timestamp & action triggers */}
      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
        <span className="text-[12px] text-on-surface-variant/60 font-semibold">
          {formatTime(item.time)}
        </span>
        <button
          onClick={() => onActionClick(item)}
          aria-label={isCall ? 'Call Back' : 'Open Chat'}
          className="py-2.5 px-6 text-[13px] font-bold bg-surface-container-low hover:bg-surface-container-high text-primary rounded-full shadow-none border-none transition-colors shrink-0"
        >
          {isCall ? 'Call Back' : 'Open Chat'}
        </button>
      </div>
    </div>
  );
};
