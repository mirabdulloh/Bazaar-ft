"use client";

import { io, type Socket } from "socket.io-client";
import { getJwtToken } from "lib/auth";

function getChatSocketBaseUrl(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (apiBase) return apiBase;

  const graphqlUrl = process.env.NEXT_PUBLIC_API_GRAPHQL_URL?.replace(/\/graphql$/, "");
  return graphqlUrl ?? "";
}

export function createChatSocket(): Socket {
  const token = getJwtToken();
  const baseUrl = getChatSocketBaseUrl();

  return io(`${baseUrl}/chat`, {
    transports: ["websocket", "polling"],
    autoConnect: true,
    auth: token ? { token } : undefined,
    query: token ? { token } : undefined,
  });
}
