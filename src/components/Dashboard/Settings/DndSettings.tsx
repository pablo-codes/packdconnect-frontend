import React, { useState } from "react";

export const DndSettings: React.FC = () => {
  const [dndEnabled, setDndEnabled] = useState(
    localStorage.getItem("packdconnect_settings_dnd") === "true",
  );
  const [allowRepeatCalls, setAllowRepeatCalls] = useState(
    localStorage.getItem("packdconnect_settings_dnd_repeat") === "true",
  );

  const handleToggleDnd = (val: boolean) => {
    setDndEnabled(val);
    localStorage.setItem("packdconnect_settings_dnd", String(val));
  };

  const handleToggleRepeat = (val: boolean) => {
    setAllowRepeatCalls(val);
    localStorage.setItem("packdconnect_settings_dnd_repeat", String(val));
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[18px] font-extrabold text-on-surface">
          Do Not Disturb (DND)
        </h2>
        <p className="text-[12px] text-on-surface-variant/80 mt-1 font-medium">
          Block call ringtones and hide overlay interruptions.
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        <div className="flex items-center justify-between p-6 bg-surface-container-low rounded-[24px]">
          <div className="flex flex-col max-w-[75%]">
            <span className="text-[14px] font-extrabold text-on-surface">
              Enable Do Not Disturb
            </span>
            <span className="text-[12px] text-on-surface-variant font-medium mt-1">
              Suppresses all incoming call triggers and rings silently.
            </span>
          </div>
          <input
            type="checkbox"
            checked={dndEnabled}
            onChange={(e) => handleToggleDnd(e.target.checked)}
            className="w-6 h-6 rounded-md border-surface-variant accent-primary cursor-pointer"
          />
        </div>

        <div
          className={`flex items-center justify-between p-6 bg-surface-container-low rounded-[24px] transition-all duration-300 ${
            dndEnabled
              ? "opacity-100"
              : "opacity-50 pointer-events-none"
          }`}
        >
          <div className="flex flex-col max-w-[75%]">
            <span className="text-[14px] font-extrabold text-on-surface">
              Bypass DND for Repeat Calls
            </span>
            <span className="text-[12px] text-on-surface-variant font-medium mt-1">
              If the same contact calls a second time within 3 minutes,
              the call will bypass DND and ring normally.
            </span>
          </div>
          <input
            type="checkbox"
            checked={allowRepeatCalls}
            onChange={(e) => handleToggleRepeat(e.target.checked)}
            disabled={!dndEnabled}
            className="w-6 h-6 rounded-md border-surface-variant accent-primary cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
