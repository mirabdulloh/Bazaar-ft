"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReactiveVar } from "@apollo/client/react";
import { userVar } from "../../apollo/store";
import { CustomJwtPayload } from "../lib/types/customJwtPayload";

// ─── Types ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SocketEventHandler<T = any> = (data: T) => void;

interface SocketContextValue {
  isConnected: boolean;
  /** Subscribe to a socket event. Returns an unsubscribe function. */
  on: <T = unknown>(event: string, handler: SocketEventHandler<T>) => () => void;
  /** Send an event to the server. */
  emit: (event: string, data: unknown) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const SocketContext = createContext<SocketContextValue>({
  isConnected: false,
  on: () => () => {},
  emit: () => {},
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * Creates and manages a single WebSocket connection for the entire app.
 * All components subscribe via context instead of creating their own connections.
 */
export function SocketProvider({ children }: PropsWithChildren) {
  const user = useReactiveVar(userVar) as CustomJwtPayload;
  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, Set<SocketEventHandler>>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const shouldReconnectRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-read token from localStorage whenever user identity changes
  const token = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("accessToken") ?? "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  useEffect(() => {
    if (!token || !user?._id) {
      // Logged out — tear down the connection
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    shouldReconnectRef.current = true;

    const connect = () => {
      if (!shouldReconnectRef.current) return;

      const ws = new WebSocket(buildSocketUrl(token));
      socketRef.current = ws;

      ws.onopen = () => setIsConnected(true);

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data as string) as {
            event?: string;
            data?: unknown;
          };
          const { event: evName, data } = payload;
          if (!evName || data === undefined) return;

          const handlers = listenersRef.current.get(evName);
          if (handlers) {
            handlers.forEach((handler) => handler(data));
          }
        } catch {
          // Ignore malformed payloads
        }
      };

      ws.onclose = () => {
        socketRef.current = null;
        setIsConnected(false);
        if (!shouldReconnectRef.current) return;
        reconnectTimerRef.current = setTimeout(connect, 3000);
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
  }, [token, user?._id]);

  const on = useCallback(
    <T = unknown>(event: string, handler: SocketEventHandler<T>) => {
      if (!listenersRef.current.has(event)) {
        listenersRef.current.set(event, new Set());
      }
      listenersRef.current.get(event)!.add(handler as SocketEventHandler);

      return () => {
        listenersRef.current.get(event)?.delete(handler as SocketEventHandler);
      };
    },
    []
  );

  const emit = useCallback((event: string, data: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event, data }));
    }
  }, []);

  const value = useMemo(
    () => ({ isConnected, on, emit }),
    [isConnected, on, emit]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSocket() {
  return useContext(SocketContext);
}
