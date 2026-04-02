import { useState } from "react";

export const VideoSlidePicker = ({ onAdd }) => {
  const [videoMediaId, setVideoMediaId] = useState("");
  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        type="number"
        placeholder="Enter video media ID"
        value={videoMediaId}
        onChange={(e) => setVideoMediaId(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1"
      />
      <button
        type="button"
        onClick={() => {
          if (!videoMediaId) return;
          onAdd({ videoId: Number(videoMediaId), categoryId: "" });
          setVideoMediaId("");
        }}
        className="px-4 py-2 text-sm bg-violet-600 text-white rounded-md"
      >
        Add
      </button>
    </div>
  );
};
