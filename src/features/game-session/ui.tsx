"use client";

import type { GameResult, PlayerColor } from "@/shared/types";

interface GameStatusBarProps {
  currentTurn: PlayerColor;
  myColor: PlayerColor;
  result: GameResult | null;
  gameType: "gomoku" | "chess";
}

export function GameStatusBar({ currentTurn, myColor, result, gameType }: GameStatusBarProps) {
  const isMyTurn = currentTurn === myColor;
  const colorLabel = (c: PlayerColor) =>
    gameType === "gomoku"
      ? c === "black" ? "Black" : "White"
      : c === "white" ? "White" : "Black";

  return (
    <div className="flex items-center justify-between rounded-lg bg-neutral-100 px-4 py-3 text-sm">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-3 w-3 rounded-full ${
            myColor === "black" ? "bg-neutral-900" : "bg-white border border-neutral-300"
          }`}
        />
        <span className="text-neutral-600">
          You are <span className="font-medium text-neutral-900">{colorLabel(myColor)}</span>
        </span>
      </div>
      {!result && (
        <span className={`font-medium ${isMyTurn ? "text-emerald-600" : "text-neutral-400"}`}>
          {isMyTurn ? "Your turn" : "Opponent's turn"}
        </span>
      )}
    </div>
  );
}

interface ResultOverlayProps {
  result: GameResult;
  myColor: PlayerColor;
  onRematch: () => void;
}

export function ResultOverlay({ result, myColor, onRematch }: ResultOverlayProps) {
  const isDraw = "draw" in result;
  const isWinner = !isDraw && result.winner === myColor;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-xl">
        <span className="text-4xl">
          {isDraw ? "\u{1F91D}" : isWinner ? "\u{1F389}" : "\u{1F614}"}
        </span>
        <h2 className="text-xl font-semibold text-neutral-900">
          {isDraw ? "Draw" : isWinner ? "You win!" : "You lose"}
        </h2>
        <button
          onClick={onRematch}
          className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          Play again
        </button>
      </div>
    </div>
  );
}
