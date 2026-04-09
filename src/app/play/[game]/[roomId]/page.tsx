"use client";

import { use } from "react";
import { useGameSocket, GameStatusBar, ResultOverlay } from "@/features/game-session";
import { GomokuBoard } from "@/features/gomoku";
import { ChessBoardView } from "@/features/chess";
import { Connect4Board } from "@/features/connect4";
import { CopyLink } from "@/shared/ui";
import type { GameType, PlayerColor, GomokuMove } from "@/shared/types";

export default function GameRoom({
  params,
}: {
  params: Promise<{ game: string; roomId: string }>;
}) {
  const { game, roomId } = use(params);
  const gameType = game as GameType;
  const { snapshot, myColor, status, errorMsg, makeMove, rematch } = useGameSocket(gameType, roomId);

  if (status === "error") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900">Oops</h2>
          <p className="mt-2 text-neutral-500">{errorMsg || "Something went wrong"}</p>
          <a href="/" className="mt-4 inline-block text-sm font-medium text-neutral-900 underline">
            Back to home
          </a>
        </div>
      </main>
    );
  }

  if (status === "connecting" || status === "waiting") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-6">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-neutral-900">
              {status === "connecting" ? "Connecting..." : "Waiting for opponent"}
            </h2>
            {status === "waiting" && (
              <p className="mt-2 text-sm text-neutral-500">Share this link with your friend</p>
            )}
          </div>
          {status === "waiting" && <CopyLink />}
        </div>
      </main>
    );
  }

  if (!snapshot || !myColor) return null;

  const isEnded = status === "ended" || status === "disconnected";

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-6">
      <GameStatusBar
        currentTurn={snapshot.currentTurn}
        myColor={myColor}
        result={snapshot.result}
        gameType={gameType}
      />

      <div className="relative">
        {gameType === "gomoku" && (
          <GomokuBoard
            board={snapshot.board as (PlayerColor | null)[][]}
            currentTurn={snapshot.currentTurn}
            myColor={myColor}
            lastMove={
              snapshot.moveHistory.length > 0
                ? (snapshot.moveHistory[snapshot.moveHistory.length - 1] as GomokuMove)
                : null
            }
            disabled={isEnded}
            onMove={(move) => makeMove(move)}
          />
        )}
        {gameType === "chess" && (
          <ChessBoardView
            fen={snapshot.board as string}
            currentTurn={snapshot.currentTurn}
            myColor={myColor}
            disabled={isEnded}
            onMove={(move) => makeMove(move)}
          />
        )}
        {gameType === "connect4" && (
          <Connect4Board
            board={snapshot.board as (PlayerColor | null)[][]}
            currentTurn={snapshot.currentTurn}
            myColor={myColor}
            disabled={isEnded}
            onMove={(move) => makeMove(move)}
          />
        )}

        {snapshot.result && (
          <ResultOverlay result={snapshot.result} myColor={myColor} onRematch={rematch} />
        )}
      </div>

      {status === "disconnected" && !snapshot.result && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Opponent disconnected
        </div>
      )}
    </main>
  );
}
