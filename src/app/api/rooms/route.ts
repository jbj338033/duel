import { NextResponse } from "next/server";

// Room creation is handled by the custom server's RoomManager.
// Since the API route and Socket.io server share the same Node.js process,
// we import the singleton directly.
import { roomManager } from "../../../../server/room-manager";
import type { GameType } from "@/shared/types";

export async function POST(request: Request) {
  const body = await request.json();
  const gameType = body.gameType as GameType;

  const validTypes: GameType[] = ["gomoku", "chess", "connect4"];
  if (!validTypes.includes(gameType)) {
    return NextResponse.json({ error: "invalid game type" }, { status: 400 });
  }

  const roomId = roomManager.createRoom(gameType);
  return NextResponse.json({ roomId });
}
