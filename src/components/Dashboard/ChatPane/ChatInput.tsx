import React from "react";
import { Plus, Smile, Send } from "lucide-react";

interface ChatInputProps {
  inputVal: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSend: (e: React.FormEvent) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputVal,
  handleInputChange,
  handleSend,
}) => {
  return (
    <footer className="p-4 md:px-8 md:pb-8 bg-transparent shrink-0">
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 bg-surface-lowest p-2.5 rounded-full ambient-shadow focus-within:ring-2 focus-within:ring-primary/20 transition-all"
      >
        <button
          type="button"
          aria-label="Attach File"
          className="w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center shrink-0 transition-colors"
          title="Attach File"
        >
          <Plus size={18} />
        </button>

        <input
          type="text"
          className="w-full bg-transparent border-none outline-none focus:ring-0 py-2 px-3 font-body-md text-on-surface font-medium placeholder-on-surface-variant/50 text-[14px]"
          placeholder="Type a message..."
          value={inputVal}
          onChange={handleInputChange}
        />

        <button
          type="button"
          aria-label="Add Emoji"
          className="w-9 h-9 rounded-full bg-transparent hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface flex items-center justify-center shrink-0 transition-colors"
          title="Add Emoji"
        >
          <Smile size={18} />
        </button>

        <button
          type="submit"
          aria-label="Send Message"
          className="w-9 h-9 bg-primary text-white rounded-full shrink-0 hover:bg-primary-dark transition-colors flex items-center justify-center disabled:opacity-50 shadow-sm"
          disabled={!inputVal.trim()}
        >
          <Send size={14} />
        </button>
      </form>
    </footer>
  );
};
