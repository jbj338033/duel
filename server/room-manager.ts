import { nanoid } from "nanoid";
import type { GameEngine } from "./games/base";
import { createGame } from "./games/factory";
import type { GameType, PlayerColor } from "../src/shared/types";

export interface Room {
  id: string;
  gameType: GameType;
  engine: GameEngine;
  players: Map<string, PlayerColor>;
  createdAt: number;
}

class RoomManager {
  private rooms = new Map<string, Room>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  createRoom(gameType: GameType): string {
    const id = nanoid(8);
    const room: Room = {
      id,
      gameType,
      engine: createGame(gameType),
      players: new Map(),
      createdAt: Date.now(),
    };
    this.rooms.set(id, room);
    return id;
  }

  joinRoom(roomId: string, socketId: string): { room: Room; color: PlayerColor } | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.players.has(socketId)) {
      return { room, color: room.players.get(socketId)! };
    }

    if (room.players.size >= 2) return null;

    const color: PlayerColor = room.players.size === 0 ? "black" : "white";
    room.players.set(socketId, color);
    return { room, color };
  }

  leaveRoom(roomId: string, socketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.players.delete(socketId);
    if (room.players.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  resetRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.engine = createGame(room.gameType);
  }

  startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      const maxAge = 60 * 60 * 1000; // 1 hour
      for (const [id, room] of this.rooms) {
        if (room.players.size === 0 && now - room.createdAt > maxAge) {
          this.rooms.delete(id);
        }
      }
    }, 5 * 60 * 1000);
  }
}

// use globalThis to share singleton between custom server and Next.js API routes
const globalForRoom = globalThis as unknown as { __roomManager?: RoomManager };

export const roomManager = globalForRoom.__roomManager ?? new RoomManager();
if (!globalForRoom.__roomManager) {
  globalForRoom.__roomManager = roomManager;
  roomManager.startCleanup();
}
