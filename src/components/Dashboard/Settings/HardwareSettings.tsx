import React, { useState, useEffect, useRef } from "react";

export const HardwareSettings: React.FC = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState(
    localStorage.getItem("packdconnect_settings_mic") || "default",
  );
  const [selectedCam, setSelectedCam] = useState(
    localStorage.getItem("packdconnect_settings_cam") || "default",
  );
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const testSynthRef = useRef<AudioContext | null>(null);
  const testTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mic test state
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAudioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((deviceInfos) => {
        setDevices(deviceInfos);
      })
      .catch((err) => {
        console.error("[SettingsView] Error enumerating devices:", err);
      });
  }, []);

  const handleTestAudio = () => {
    if (isTestingAudio) {
      if (testSynthRef.current) {
        testSynthRef.current.close().catch(() => {});
        testSynthRef.current = null;
      }
      if (testTimeoutRef.current) {
        clearTimeout(testTimeoutRef.current);
        testTimeoutRef.current = null;
      }
      setIsTestingAudio(false);
      return;
    }

    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      setIsTestingAudio(true);
      const ctx = new AudioContextClass();
      testSynthRef.current = ctx;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(480, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + 0.9);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);

      if (testTimeoutRef.current) {
        clearTimeout(testTimeoutRef.current);
      }
      testTimeoutRef.current = setTimeout(() => {
        setIsTestingAudio(false);
        if (testSynthRef.current === ctx) {
          ctx.close().catch(() => {});
          testSynthRef.current = null;
        }
        testTimeoutRef.current = null;
      }, 1200);
    } catch (e) {
      console.warn("[SettingsView] Test sound error:", e);
      setIsTestingAudio(false);
    }
  };

  const stopMicTest = () => {
    setIsTestingMic(false);
    setMicVolume(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (micAudioContextRef.current) {
      micAudioContextRef.current.close().catch(() => {});
      micAudioContextRef.current = null;
    }
  };

  const handleTestMic = async () => {
    if (isTestingMic) {
      stopMicTest();
      return;
    }

    try {
      setIsTestingMic(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedMic === "default" ? true : { deviceId: { exact: selectedMic } },
      });
      micStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      micAudioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Normalize 0-255 to 0-100% and amplify a bit for visibility
        setMicVolume(Math.min(100, Math.round((average / 128) * 150)));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.error("[SettingsView] Microphone test failed", err);
      setIsTestingMic(false);
    }
  };

  useEffect(() => {
    return () => {
      if (testSynthRef.current) {
        testSynthRef.current.close().catch(() => {});
      }
      if (testTimeoutRef.current) {
        clearTimeout(testTimeoutRef.current);
      }
      stopMicTest();
    };
  }, []);

  const handleMicSelect = (val: string) => {
    setSelectedMic(val);
    localStorage.setItem("packdconnect_settings_mic", val);
    // Restart mic test if running so it switches device
    if (isTestingMic) {
      stopMicTest();
      setTimeout(() => handleTestMic(), 100);
    }
  };

  const handleCamSelect = (val: string) => {
    setSelectedCam(val);
    localStorage.setItem("packdconnect_settings_cam", val);
  };

  const micDevices = devices.filter((d) => d.kind === "audioinput");
  const camDevices = devices.filter((d) => d.kind === "videoinput");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[18px] font-extrabold text-on-surface">
          Call Hardware
        </h2>
        <p className="text-[12px] text-on-surface-variant/80 mt-1 font-medium">
          Calibrate audio and video media device sources for WebRTC.
        </p>
      </div>

      <div className="flex flex-col gap-5 mt-4">
        <div className="input-group">
          <label className="input-label">Microphone Source</label>
          <select
            value={selectedMic}
            onChange={(e) => handleMicSelect(e.target.value)}
            className="input-field-pill cursor-pointer"
          >
            <option value="default">Default System Microphone</option>
            {micDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Mic (${d.deviceId.substring(0, 5)})`}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Camera Source</label>
          <select
            value={selectedCam}
            onChange={(e) => handleCamSelect(e.target.value)}
            className="input-field-pill cursor-pointer"
          >
            <option value="default">Default System Camera</option>
            {camDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Camera (${d.deviceId.substring(0, 5)})`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          {/* Audio Output Test */}
          <div className="bg-background dark:bg-surface-container-low p-4 rounded-[20px] border border-surface-variant/20 flex flex-col gap-3">
            <span className="text-[12px] font-bold text-on-surface">
              Test Audio Output
            </span>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant font-medium">
                Plays a brief synthesized frequency tone to verify speaker volume.
              </span>
              <button
                onClick={handleTestAudio}
                className="btn btn-secondary py-1.5 px-4 text-xs font-bold border border-surface-variant/30 hover:bg-surface-container-high text-primary rounded-full shadow-sm shrink-0 ml-4"
              >
                {isTestingAudio ? "Playing..." : "Test Speaker"}
              </button>
            </div>
          </div>

          {/* Microphone Test */}
          <div className="bg-background dark:bg-surface-container-low p-4 rounded-[20px] border border-surface-variant/20 flex flex-col gap-3">
            <span className="text-[12px] font-bold text-on-surface">
              Test Microphone Input
            </span>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant font-medium max-w-[60%]">
                Test your selected microphone and visualize its volume input level.
              </span>
              <button
                onClick={handleTestMic}
                className={`btn py-1.5 px-4 text-xs font-bold border border-surface-variant/30 rounded-full shadow-sm shrink-0 ml-4 transition-all ${
                  isTestingMic 
                  ? "bg-error text-white hover:bg-error/90 border-error" 
                  : "btn-secondary hover:bg-surface-container-high text-primary"
                }`}
              >
                {isTestingMic ? "Stop Testing" : "Test Mic"}
              </button>
            </div>
            {isTestingMic && (
              <div className="w-full bg-surface-container-high rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-75 ease-out"
                  style={{ width: `${micVolume}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
