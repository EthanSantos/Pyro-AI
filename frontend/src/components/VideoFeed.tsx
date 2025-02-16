"use client";

import React, { useState, useRef } from "react";
import { X } from "lucide-react";

interface ToggleSwitchProps {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, setEnabled }) => {
  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none ${
        enabled ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span className="sr-only">Toggle detection</span>
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
};

interface VideoFeedProps {
  onClose: () => void;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ onClose }) => {
  const [detectionEnabled, setDetectionEnabled] = useState(false);
  const videoRef = useRef<HTMLImageElement>(null);

  // NOTE: We do NOT dynamically change the video src in a useEffect.
  // Instead, we call an API route to toggle detection on the server.

  const handleToggleDetection = async () => {
    const newValue = !detectionEnabled;
    setDetectionEnabled(newValue);
    try {
      // Make a request to toggle detection on the server
      await fetch("http://127.0.0.1:5000/api/toggle-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newValue }),
      });
    } catch (err) {
      console.error("Error toggling detection:", err);
    }
  };

  return (
    <div className="relative bg-white rounded-lg">
      {/* Container for header section */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b">
        {/* Left side: Title */}
        <h2 className="text-xl font-semibold text-gray-800">Video Feed</h2>

        {/* Right side: Detection toggle and close button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Detection</span>
            <ToggleSwitch enabled={detectionEnabled} setEnabled={handleToggleDetection} />
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <X size={20} className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>
      </div>

      {/* Video Feed */}
      {/*
        Important: We use a single, constant src for the video feed. 
        No ?detection=... query param. The server will decide based 
        on a global variable whether to apply YOLO or not.
      */}
      <img
        ref={videoRef}
        className="w-full rounded-lg"
        alt="Video feed"
        src="http://127.0.0.1:5000/api/video-feed/camera1.mp4"
      />
    </div>
  );
};

export default VideoFeed;
