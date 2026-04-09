"use client";

import type { PlayerColor, Connect4Move } from "@/shared/types";

const ROWS = 6;
const COLS = 7;

interface Connect4BoardProps {
  board: (PlayerColor | null)[][];
  currentTurn: PlayerColor;
  myColor: PlayerColor;
  disabled: boolean;
  onMove: (move: Connect4Move) => void;
}

export function Connect4Board({
  board,
  currentTurn,
  myColor,
  disabled,
  onMove,
}: Connect4BoardProps) {
  const isMyTurn = currentTurn === myColor && !disabled;

  return (
    <div className="inline-block select-none" style={{ "--cell": "min(12vw, 56px)" } as React.CSSProperties}>
      <div className="rounded-xl bg-blue-700 p-2 sm:p-3 shadow-lg">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${COLS}, var(--cell))`, gap: "calc(var(--cell) * 0.1)" }}
        >
          {Array.from({ length: ROWS * COLS }, (_, i) => {
            const row = Math.floor(i / COLS);
            const col = i % COLS;
            const cell = board[row]?.[col] ?? null;
            const canDrop = isMyTurn && cell === null && isTopEmpty(board, col);

            return (
              <button
                key={i}
                disabled={!canDrop && cell !== null}
                onClick={() => onMove({ col })}
                className="rounded-full bg-blue-900/50 flex items-center justify-center transition-transform hover:scale-105"
                style={{ width: "var(--cell)", height: "var(--cell)", cursor: canDrop ? "pointer" : "default" }}
              >
                {cell !== null && (
                  <div
                    className={`rounded-full shadow-inner transition-all duration-200 ${
                      cell === "black"
                        ? "bg-red-500 shadow-red-700/50"
                        : "bg-yellow-400 shadow-yellow-600/50"
                    }`}
                    style={{ width: "82%", height: "82%" }}
                  />
                )}
                {cell === null && canDrop && (
                  <div
                    className={`rounded-full opacity-0 hover:opacity-40 transition-opacity ${
                      myColor === "black" ? "bg-red-400" : "bg-yellow-300"
                    }`}
                    style={{ width: "82%", height: "82%" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function isTopEmpty(board: (PlayerColor | null)[][], col: number): boolean {
  return board[0]?.[col] === null;
}
