import type { GameType } from "../../src/shared/types";
import type { GameEngine } from "./base";
import { GomokuEngine } from "./gomoku";
import { ChessEngine } from "./chess";
import { Connect4Engine } from "./connect4";

export function createGame(type: GameType): GameEngine {
  switch (type) {
    case "gomoku":
      return new GomokuEngine();
    case "chess":
      return new ChessEngine();
    case "connect4":
      return new Connect4Engine();
    default:
      throw new Error(`unknown game type: ${type}`);
  }
}
