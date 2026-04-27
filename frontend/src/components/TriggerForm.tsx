"use client";

import { useState } from "react";
import api from "@/lib/api";

interface Props {
  onTaskId: (id: string) => void;
}

export default function TriggerForm({ onTaskId }: Props) {
  const [intent, setIntent] = useState("");
  const [geoZone, setGeoZone] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const { data } = await api.post("/trigger", {
      intent_token: intent,
      geo_zone: geoZone,
      timestamp: new Date().toISOString(),
    });
    const match = data.status.match(/id:([a-f0-9-]+)/);
    if (match) onTaskId(match[1]);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <input
        placeholder="Intent (e.g., coffee)"
        value={intent}
        onChange={(e) => setIntent(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        placeholder="Location"
        value={geoZone}
        onChange={(e) => setGeoZone(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <button
        onClick={submit}
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded disabled:bg-gray-400"
      >
        {loading ? "Finding..." : "Find Offers"}
      </button>
    </div>
  );
}
