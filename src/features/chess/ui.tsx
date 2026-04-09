"use client";

import { useState, useCallback } from "react";
import { Chess } from "chess.js";
import type { PlayerColor, ChessMove } from "@/shared/types";

interface ChessBoardProps {
  fen: string;
  currentTurn: PlayerColor;
  myColor: PlayerColor;
  disabled: boolean;
  onMove: (move: ChessMove) => void;
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

const PIECE_UNICODE: Record<string, string> = {
  wk: "\u2654", wq: "\u2655", wr: "\u2656", wb: "\u2657", wn: "\u2658", wp: "\u2659",
  bk: "\u265A", bq: "\u265B", br: "\u265C", bb: "\u265D", bn: "\u265E", bp: "\u265F",
};

export function ChessBoardView({ fen, currentTurn, myColor, disabled, onMove }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const isMyTurn = currentTurn === myColor && !disabled;

  const chess = new Chess(fen);
  const boardData = chess.board();
  const legalMoves = selectedSquare
    ? chess.moves({ square: selectedSquare as Parameters<typeof chess.moves>[0]["square"], verbose: true })
    : [];
  const legalTargets = new Set(legalMoves.map((m) => m.to));

  const isFlipped = myColor === "black";
  const ranks = isFlipped ? [...RANKS].reverse() : RANKS;
  const files = isFlipped ? [...FILES].reverse() : FILES;

  const handleClick = useCallback(
    (square: string) => {
      if (!isMyTurn) return;

      if (selectedSquare) {
        if (legalTargets.has(square)) {
          const chess = new Chess(fen);
          try {
            const move = chess.move({ from: selectedSquare, to: square, promotion: "q" });
            if (move) {
              onMove({ from: selectedSquare, to: square, promotion: move.promotion || undefined });
              setSelectedSquare(null);
              return;
            }
          } catch { /* invalid */ }
        }
      }

      const chess2 = new Chess(fen);
      const piece = chess2.get(square as Parameters<typeof chess2.get>[0]);
      if (piece && ((myColor === "white" && piece.color === "w") || (myColor === "black" && piece.color === "b"))) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
    },
    [fen, isMyTurn, myColor, selectedSquare, onMove, legalTargets],
  );

  return (
    <div className="inline-block select-none rounded-lg overflow-hidden shadow-md" style={{ "--cell": "min(11vw, 64px)" } as React.CSSProperties}>
      <div className="grid" style={{ gridTemplateColumns: "repeat(8, var(--cell))" }}>
        {ranks.map((rank, ri) =>
          files.map((file, fi) => {
            const square = `${file}${rank}`;
            const isDark = (ri + fi) % 2 === 1;
            const rowIdx = RANKS.indexOf(rank);
            const colIdx = FILES.indexOf(file);
            const cell = boardData[rowIdx]?.[colIdx];
            const isSelected = selectedSquare === square;
            const isLegalTarget = legalTargets.has(square);
            const pieceKey = cell ? `${cell.color}${cell.type}` : null;

            return (
              <button
                key={square}
                onClick={() => handleClick(square)}
                className={`relative flex items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-amber-300"
                    : isDark
                      ? "bg-emerald-700"
                      : "bg-emerald-50"
                }`}
                style={{ width: "var(--cell)", height: "var(--cell)" }}
              >
                {pieceKey && (
                  <span className={`leading-none ${
                    cell!.color === "w" ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" : ""
                  }`} style={{ fontSize: "calc(var(--cell) * 0.7)" }}>
                    {PIECE_UNICODE[pieceKey]}
                  </span>
                )}
                {isLegalTarget && !pieceKey && (
                  <div className="absolute h-3 w-3 rounded-full bg-black/20" />
                )}
                {isLegalTarget && pieceKey && (
                  <div className="absolute inset-0 ring-2 ring-inset ring-black/20 rounded-sm" />
                )}
                {fi === 0 && (
                  <span className={`absolute top-0.5 left-0.5 text-[10px] font-medium ${isDark ? "text-emerald-200/70" : "text-emerald-800/40"}`}>
                    {rank}
                  </span>
                )}
                {ri === 7 && (
                  <span className={`absolute bottom-0.5 right-0.5 text-[10px] font-medium ${isDark ? "text-emerald-200/70" : "text-emerald-800/40"}`}>
                    {file}
                  </span>
                )}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
