import React, { useState } from "react";
import { User, Volume2, BellOff, Palette } from "lucide-react";
import { ProfileSettings } from "./Settings/ProfileSettings";
import { HardwareSettings } from "./Settings/HardwareSettings";
import { DndSettings } from "./Settings/DndSettings";
import { AppearanceSettings } from "./Settings/AppearanceSettings";

type Tab = "profile" | "hardware" | "dnd" | "appearance";

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="flex-grow h-full flex flex-col bg-background overflow-y-auto select-none relative">
      {/* Header section */}
      <div className="sticky top-0 z-10 bg-background px-4 md:px-8 pt-4 md:pt-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm md:shadow-none">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-extrabold text-on-surface tracking-tight">
            Settings
          </h1>
        </div>
      </div>

      <div className="px-4 md:px-8 pb-[90px] md:pb-8 pt-4 md:pt-8 flex flex-col md:flex-row gap-6 w-full items-start flex-grow">
        {/* Left Pane Settings Menu (220px) */}
        <div className="flex flex-col gap-2 w-full md:w-[240px] shrink-0 bg-surface-container-low p-4 rounded-[32px] overflow-x-auto md:overflow-x-visible">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-full w-full font-bold text-[13px] border-none transition-all cursor-pointer text-left ${
              activeTab === "profile"
                ? "bg-surface-lowest text-primary ambient-shadow"
                : "hover:bg-surface-container-high/50 text-on-surface-variant bg-transparent"
            }`}
          >
            <User size={18} />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => setActiveTab("hardware")}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-full w-full font-bold text-[13px] border-none transition-all cursor-pointer text-left ${
              activeTab === "hardware"
                ? "bg-surface-lowest text-primary ambient-shadow"
                : "hover:bg-surface-container-high/50 text-on-surface-variant bg-transparent"
            }`}
          >
            <Volume2 size={18} />
            <span>Call Hardware</span>
          </button>
          <button
            onClick={() => setActiveTab("dnd")}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-full w-full font-bold text-[13px] border-none transition-all cursor-pointer text-left ${
              activeTab === "dnd"
                ? "bg-surface-lowest text-primary ambient-shadow"
                : "hover:bg-surface-container-high/50 text-on-surface-variant bg-transparent"
            }`}
          >
            <BellOff size={18} />
            <span>Do Not Disturb</span>
          </button>
          <button
            onClick={() => setActiveTab("appearance")}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-full w-full font-bold text-[13px] border-none transition-all cursor-pointer text-left ${
              activeTab === "appearance"
                ? "bg-surface-lowest text-primary ambient-shadow"
                : "hover:bg-surface-container-high/50 text-on-surface-variant bg-transparent"
            }`}
          >
            <Palette size={18} />
            <span>Appearance</span>
          </button>
        </div>

        {/* Right Pane Setting Cards (Flex-grow) */}
        <div className="flex-grow w-full bg-surface-lowest rounded-[32px] ambient-shadow p-8 md:p-10 min-h-[360px]">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "hardware" && <HardwareSettings />}
          {activeTab === "dnd" && <DndSettings />}
          {activeTab === "appearance" && <AppearanceSettings />}
        </div>
      </div>
    </div>
  );
};
