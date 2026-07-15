import React from "react";
import { Loader2, Check, CheckCheck } from "lucide-react";
import type { User, Message, Conversation } from "../../../types";

interface MessageFeedProps {
  messages: Message[];
  isFetchingMessages: boolean;
  currentUser: User | null;
  activeRoom: Conversation;
  isDirectMessage: boolean;
  firstMessageRef: (node: HTMLDivElement) => void;
  feedEndRef: React.MutableRefObject<HTMLDivElement | null>;
  scrollContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  getDateHeader: (dateStr: string) => string;
}

export const MessageFeed: React.FC<MessageFeedProps> = ({
  messages,
  isFetchingMessages,
  currentUser,
  activeRoom,
  isDirectMessage,
  firstMessageRef,
  feedEndRef,
  scrollContainerRef,
  getDateHeader,
}) => {
  return (
    <div
      ref={scrollContainerRef}
      className="flex-grow overflow-y-auto p-6 bg-background flex flex-col gap-5 custom-scrollbar"
    >
      {isFetchingMessages && (
        <div className="flex justify-center py-2 shrink-0">
          <Loader2 className="animate-spin text-primary opacity-50" size={16} />
        </div>
      )}

      {messages.length === 0 && !isFetchingMessages ? (
        <div className="my-auto text-center text-on-surface-variant text-[13px] py-12">
          This is the start of your conversation. Send a message below!
        </div>
      ) : (
        <>
          {messages.map((msg, index) => {
            const isOutgoing = msg.sender_id === currentUser?.id;

            // Resolve username for group chat labels
            const senderName = isOutgoing
              ? "You"
              : activeRoom.participants.find((p: any) => p.id === msg.sender_id)
                  ?.username || "Unknown";

            // Show name label if it's group chat and message is incoming, and not repeating sender
            const showNameLabel =
              !isDirectMessage &&
              !isOutgoing &&
              (index === 0 || messages[index - 1].sender_id !== msg.sender_id);

            // Date separator check
            const msgDate = new Date(msg.created_at);
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showDateSeparator =
              !prevMsg ||
              (() => {
                const prevDate = new Date(prevMsg.created_at);
                return (
                  prevDate.getFullYear() !== msgDate.getFullYear() ||
                  prevDate.getMonth() !== msgDate.getMonth() ||
                  prevDate.getDate() !== msgDate.getDate()
                );
              })();

            return (
              <React.Fragment key={msg.id}>
                {showDateSeparator && (
                  <div className="flex justify-center my-2 shrink-0">
                    <span className="bg-surface-container-low text-on-surface-variant text-[11px] font-semibold px-3 py-1 rounded-full border border-surface-variant/20 shadow-sm">
                      {getDateHeader(msg.created_at)}
                    </span>
                  </div>
                )}
                <div
                  ref={index === 0 ? firstMessageRef : null}
                  className={`flex flex-col max-w-[85%] md:max-w-[70%] ${
                    isOutgoing ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  {showNameLabel && (
                    <span className="text-[11px] font-bold text-on-surface-variant mb-1 ml-2">
                      {senderName}
                    </span>
                  )}

                  <div
                    className={`px-5 py-3 rounded-[24px] ${
                      isOutgoing
                        ? "bg-surface-lowest text-on-surface ambient-shadow rounded-tr-sm"
                        : "bg-secondary-container text-on-surface border border-surface-variant/20 shadow-sm rounded-tl-sm"
                    }`}
                  >
                    <p className="text-[14px] font-medium leading-relaxed break-words whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>

                  {/* Meta */}
                  {isOutgoing ? (
                    <div className="flex items-center gap-1 mt-1 mr-2 text-[10px] text-on-surface-variant/50">
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span
                        className={
                          msg.read_at
                            ? "text-secondary"
                            : "text-on-surface-variant/40"
                        }
                      >
                        {msg.read_at ? (
                          <CheckCheck size={12} />
                        ) : (
                          <Check size={12} />
                        )}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-on-surface-variant/50 ml-2 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </>
      )}
      <div ref={feedEndRef} />
    </div>
  );
};
