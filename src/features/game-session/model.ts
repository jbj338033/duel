"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type {
  GameType,
  GameMove,
  GameSnapshot,
  PlayerColor,
  ServerToClientEvents,
  ClientToServerEvents,
} from "@/shared/types";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export type GameStatus = "connecting" | "waiting" | "playing" | "ended" | "disconnected" | "error";

export function useGameSocket(gameType: GameType, roomId: string) {
  const socketRef = useRef<GameSocket | null>(null);
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [myColor, setMyColor] = useState<PlayerColor | null>(null);
  const [status, setStatus] = useState<GameStatus>("connecting");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const socket: GameSocket = io();
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("room:join", { gameType, roomId });
    });

    socket.on("room:waiting", () => setStatus("waiting"));

    socket.on("room:started", ({ color, snapshot }) => {
      setMyColor(color);
      setSnapshot(snapshot);
      setStatus("playing");
    });

    socket.on("game:updated", (s) => setSnapshot(s));

    socket.on("game:ended", (s) => {
      setSnapshot(s);
      setStatus("ended");
    });

    socket.on("opponent:disconnected", () => setStatus("disconnected"));

    socket.on("error", (msg) => {
      setErrorMsg(msg);
      setStatus("error");
    });

    socket.on("disconnect", () => setStatus("disconnected"));

    return () => { socket.disconnect(); };
  }, [gameType, roomId]);

  const makeMove = useCallback((move: GameMove) => {
    socketRef.current?.emit("game:move", move);
  }, []);

  const rematch = useCallback(() => {
    socketRef.current?.emit("game:rematch");
    setStatus("playing");
  }, []);

  return { snapshot, myColor, status, errorMsg, makeMove, rematch };
}

export function useCreateRoom() {
  const [loading, setLoading] = useState<GameType | null>(null);

  const createRoom = useCallback(async (gameType: GameType): Promise<string | null> => {
    setLoading(gameType);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType }),
      });
      const { roomId } = await res.json();
      return roomId as string;
    } catch {
      setLoading(null);
      return null;
    }
  }, []);

  return { loading, createRoom };
}
