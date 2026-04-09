import type { Server, Socket } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents, GameType } from "../src/shared/types";
import { roomManager } from "./room-manager";

type IOServer = Server<ClientToServerEvents, ServerToClientEvents>;
type IOSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

const socketRooms = new Map<string, string>(); // socketId -> roomId

export function setupSocket(io: IOServer): void {
  io.on("connection", (socket: IOSocket) => {
    socket.on("room:join", ({ gameType, roomId }) => {
      const validTypes: GameType[] = ["gomoku", "chess", "connect4"];
      if (!validTypes.includes(gameType)) {
        socket.emit("error", "invalid game type");
        return;
      }

      const result = roomManager.joinRoom(roomId, socket.id);
      if (!result) {
        socket.emit("error", "room not found or full");
        return;
      }

      const { room, color } = result;
      socket.join(roomId);
      socketRooms.set(socket.id, roomId);

      if (room.players.size < 2) {
        socket.emit("room:waiting");
      } else {
        for (const [sid, c] of room.players) {
          io.to(sid).emit("room:started", {
            color: c,
            snapshot: room.engine.getSnapshot(),
          });
        }
      }
    });

    socket.on("game:move", (move) => {
      const roomId = socketRooms.get(socket.id);
      if (!roomId) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      const playerColor = room.players.get(socket.id);
      if (!playerColor) return;

      const valid = room.engine.makeMove(move, playerColor);
      if (!valid) {
        socket.emit("error", "invalid move");
        return;
      }

      const snapshot = room.engine.getSnapshot();
      if (snapshot.result) {
        io.to(roomId).emit("game:ended", snapshot);
      } else {
        io.to(roomId).emit("game:updated", snapshot);
      }
    });

    socket.on("game:rematch", () => {
      const roomId = socketRooms.get(socket.id);
      if (!roomId) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      roomManager.resetRoom(roomId);
      for (const [sid, c] of room.players) {
        io.to(sid).emit("room:started", {
          color: c,
          snapshot: room.engine.getSnapshot(),
        });
      }
    });

    socket.on("disconnect", () => {
      const roomId = socketRooms.get(socket.id);
      if (!roomId) return;

      const room = roomManager.getRoom(roomId);
      if (room) {
        socket.to(roomId).emit("opponent:disconnected");
      }

      roomManager.leaveRoom(roomId, socket.id);
      socketRooms.delete(socket.id);
    });
  });
}
