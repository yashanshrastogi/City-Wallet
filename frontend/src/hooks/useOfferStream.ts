"use client";

import { useEffect, useState } from "react";
import { OfferWebSocket } from "@/lib/websocket";
import api from "@/lib/api";

export function useOfferStream(taskId: string | null) {
  const [offer, setOffer] = useState<any>(null);

  useEffect(() => {
    if (!taskId) return;

    const ws = new OfferWebSocket(taskId, (data) => {
      setOffer(data);
      ws.disconnect();
    });

    ws.connect();

    const poll = setInterval(async () => {
      try {
        const { data } = await api.get(`/offers/${taskId}`);
        if (data.offer) {
          setOffer(data.offer);
          clearInterval(poll);
          ws.disconnect();
        }
      } catch {
        // Not ready yet
      }
    }, 2000);

    return () => {
      ws.disconnect();
      clearInterval(poll);
    };
  }, [taskId]);

  return offer;
}
