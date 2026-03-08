"use client";

import { useEffect, useMemo, useRef } from "react";
import { T } from "./types/common";

type NewMessagePayload = {
  event?: string;
  data?: T;
};

function buildSocketUrl(token: string): string {
  const directWs = process.env.NEXT_PUBLIC_API_WS?.trim();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  let base = directWs || apiUrl || "";

  if (!base && typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    base = `${protocol}//${window.location.host}`;
  }

  if (base.startsWith("http://")) base = base.replace("http://", "ws://");
  if (base.startsWith("https://")) base = base.replace("https://", "wss://");

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}token=${encodeURIComponent(token)}`;
}

export function useChatSocket(onNewMessage: (msg: T) => void) {
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const shouldReconnectRef = useRef(true);
  const callbackRef = useRef(onNewMessage);

  const token = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("accessToken") ?? "";
  }, []);

  useEffect(() => {
    callbackRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    if (!token) return;

    shouldReconnectRef.current = true;

    const connect = () => {
      if (!shouldReconnectRef.current) return;

      const ws = new WebSocket(buildSocketUrl(token));
      socketRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as NewMessagePayload;
          if (payload?.event !== "newMessage" || !payload.data) return;
          // Always fire — the caller decides which conversation to handle
          callbackRef.current(payload.data);
        } catch {
          // Ignore malformed websocket payloads.
        }
      };

      ws.onclose = () => {
        socketRef.current = null;
        if (!shouldReconnectRef.current) return;

        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
    };

    connect();

    return () => {
      shouldReconnectRef.current = false;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [token]);
}
