"use client";

import type { PlayerColor, GomokuMove } from "@/shared/types";

const SIZE = 15;

interface GomokuBoardProps {
  board: (PlayerColor | null)[][];
  currentTurn: PlayerColor;
  myColor: PlayerColor;
  lastMove: GomokuMove | null;
  disabled: boolean;
  onMove: (move: GomokuMove) => void;
}

export function GomokuBoard({
  board,
  currentTurn,
  myColor,
  lastMove,
  disabled,
  onMove,
}: GomokuBoardProps) {
  const isMyTurn = currentTurn === myColor && !disabled;

  return (
    <div className="relative inline-block select-none" style={{ "--cell": "min(5.6vw, 36px)" } as React.CSSProperties}>
      <div
        className="grid bg-amber-200 rounded-lg p-1.5 sm:p-3 shadow-inner"
        style={{
          gridTemplateColumns: `repeat(${SIZE}, var(--cell))`,
          gap: 0,
        }}
      >
        {Array.from({ length: SIZE * SIZE }, (_, i) => {
          const row = Math.floor(i / SIZE);
          const col = i % SIZE;
          const cell = board[row]?.[col] ?? null;
          const isLast = lastMove?.row === row && lastMove?.col === col;

          return (
            <button
              key={i}
              disabled={!isMyTurn || cell !== null}
              onClick={() => onMove({ row, col })}
              className="relative"
              style={{ width: "var(--cell)", height: "var(--cell)", cursor: isMyTurn && cell === null ? "pointer" : "default" }}
            >
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="absolute bg-amber-900/30"
                  style={{
                    height: "1px",
                    top: "50%",
                    left: col === 0 ? "50%" : 0,
                    right: col === SIZE - 1 ? "50%" : 0,
                  }}
                />
                <div
                  className="absolute bg-amber-900/30"
                  style={{
                    width: "1px",
                    left: "50%",
                    top: row === 0 ? "50%" : 0,
                    bottom: row === SIZE - 1 ? "50%" : 0,
                  }}
                />
              </div>

              {isStarPoint(row, col) && cell === null && (
                <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-900/40" />
              )}

              {cell !== null && (
                <div
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-100 ${
                    cell === "black"
                      ? "bg-neutral-900 shadow-md"
                      : "bg-white border border-neutral-300 shadow-md"
                  } ${isLast ? "ring-2 ring-emerald-400" : ""}`}
                  style={{ width: "80%", height: "80%" }}
                />
              )}

              {isMyTurn && cell === null && (
                <div
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 hover:opacity-30 transition-opacity ${
                    myColor === "black" ? "bg-neutral-900" : "bg-neutral-400"
                  }`}
                  style={{ width: "80%", height: "80%" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function isStarPoint(row: number, col: number): boolean {
  const stars = [3, 7, 11];
  return stars.includes(row) && stars.includes(col);
}
