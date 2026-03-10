"use client";

import { useEffect, useRef, useContext } from "react";
import { SocketContext } from "../providers/SocketProvider";
import { T } from "./types/common";

/**
 * Backward-compatible hook used by dashboard-chat-view.tsx.
 * Subscribes to "newMessage" events on the singleton SocketProvider
 * instead of creating its own WebSocket connection.
 */
export function useChatSocket(onNewMessage: (msg: T) => void) {
  const { on } = useContext(SocketContext);
  const callbackRef = useRef(onNewMessage);

  useEffect(() => {
    callbackRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    return on<T>("newMessage", (data) => {
      callbackRef.current(data);
    });
  }, [on]);
}

/**
 * Generic hook for subscribing to any socket event.
 * Returns nothing — cleanup is handled automatically on unmount.
 */
export function useChatEvent<T = unknown>(
  event: string,
  handler: (data: T) => void
): void {
  const { on } = useContext(SocketContext);
  const callbackRef = useRef(handler);

  useEffect(() => {
    callbackRef.current = handler;
  }, [handler]);

  useEffect(() => {
    return on<T>(event, (data) => {
      callbackRef.current(data);
    });
  }, [on, event]);
}
