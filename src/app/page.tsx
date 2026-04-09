"use client";

import { useRouter } from "next/navigation";
import { useCreateRoom } from "@/features/game-session";
import type { GameType } from "@/shared/types";

const games: { type: GameType; name: string; description: string; icon: string }[] = [
  { type: "gomoku", name: "Gomoku", description: "Place 5 stones in a row to win", icon: "\u26AB" },
  { type: "chess", name: "Chess", description: "The classic strategy game", icon: "\u265F" },
  { type: "connect4", name: "Connect 4", description: "Drop discs, connect four to win", icon: "\u{1F534}" },
];

export default function Home() {
  const router = useRouter();
  const { loading, createRoom } = useCreateRoom();

  async function handleSelect(gameType: GameType) {
    const roomId = await createRoom(gameType);
    if (roomId) router.push(`/play/${gameType}/${roomId}`);
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-neutral-900">Duel</h1>
        <p className="mt-3 text-lg text-neutral-500">Pick a game, share the link, play.</p>
      </div>

      <div className="grid w-full max-w-md gap-3">
        {games.map((game) => (
          <button
            key={game.type}
            onClick={() => handleSelect(game.type)}
            disabled={loading !== null}
            className="group flex items-center gap-5 rounded-xl border border-neutral-200 bg-white px-6 py-5 text-left shadow-sm transition-all hover:border-neutral-300 hover:shadow-md active:scale-[0.98] disabled:opacity-60"
          >
            <span className="text-3xl">{game.icon}</span>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 group-hover:text-neutral-700">
                {game.name}
              </h2>
              <p className="text-sm text-neutral-500">{game.description}</p>
            </div>
            {loading === game.type && (
              <div className="ml-auto h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
            )}
          </button>
        ))}
      </div>
    </main>
  );
}
