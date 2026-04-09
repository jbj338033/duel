import type { GameMove, GameResult, GameSnapshot, GameType, PlayerColor } from "../../src/shared/types";

export abstract class GameEngine {
  abstract readonly gameType: GameType;
  abstract makeMove(move: GameMove, player: PlayerColor): boolean;
  abstract getSnapshot(): GameSnapshot;
  abstract getResult(): GameResult | null;
  abstract getCurrentTurn(): PlayerColor;
}
