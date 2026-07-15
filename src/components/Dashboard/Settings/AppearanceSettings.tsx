import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";

export const AppearanceSettings: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.getItem("packdconnect_settings_theme") as "light" | "dark") ||
      "light",
  );
  const [accentColor, setAccentColor] = useState(
    localStorage.getItem("packdconnect_settings_accent") || "coral",
  );

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("packdconnect_settings_theme") || "light";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove(
      "accent-coral",
      "accent-sage",
      "accent-indigo",
      "accent-sand",
    );
    document.documentElement.classList.add(`accent-${accentColor}`);
  }, [accentColor]);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("packdconnect_settings_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleAccentChange = (newAccent: string) => {
    setAccentColor(newAccent);
    localStorage.setItem("packdconnect_settings_accent", newAccent);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[18px] font-extrabold text-on-surface">
          Appearance Settings
        </h2>
        <p className="text-[12px] text-on-surface-variant/80 mt-1 font-medium">
          Personalize the styling accents and color themes.
        </p>
      </div>

      <div className="flex flex-col gap-5 mt-1">
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-bold text-on-surface">
            Theme Option
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => handleThemeChange("light")}
              className={`flex-1 py-3 px-4 rounded-2xl border text-center font-bold text-[12px] cursor-pointer transition-all ${
                theme === "light"
                  ? "border-secondary bg-secondary-fixed text-on-surface shadow-sm"
                  : "border-surface-variant/30 hover:bg-surface-container-high/20 text-on-surface-variant bg-transparent"
              }`}
            >
              Light Theme
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className={`flex-1 py-3 px-4 rounded-2xl border text-center font-bold text-[12px] cursor-pointer transition-all ${
                theme === "dark"
                  ? "border-secondary bg-secondary-fixed text-on-surface shadow-sm"
                  : "border-surface-variant/30 hover:bg-surface-container-high/20 text-on-surface-variant bg-transparent"
              }`}
            >
              Dark Theme (Sleek)
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-bold text-on-surface">
            Tactile Accent Color
          </span>
          <div className="flex gap-3 flex-wrap">
            {["coral", "sage", "indigo", "sand"].map((c) => {
              const isSelected = accentColor === c;
              const getBg = () => {
                if (c === "coral") return "bg-[#A33D0D]";
                if (c === "sage") return "bg-[#40684c]";
                if (c === "indigo") return "bg-[#3b5998]";
                return "bg-[#7d6e5c]";
              };
              return (
                <button
                  key={c}
                  onClick={() => handleAccentChange(c)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-[11px] font-extrabold capitalize cursor-pointer transition-all ${
                    isSelected
                      ? "border-secondary bg-secondary-fixed text-on-surface shadow-sm"
                      : "border-surface-variant/30 hover:bg-surface-container-high/20 text-on-surface-variant bg-transparent"
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full ${getBg()} shrink-0`}
                  ></span>
                  <span>{c}</span>
                  {isSelected && (
                    <Check size={12} className="text-secondary ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
