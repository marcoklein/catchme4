import { GameRoom } from "./GameRoom";
import { BodySchema, GameState } from "./schema/GameState";

export interface GameController {
  attachToRoom?(room: GameRoom, state: GameState): void;
  updateBody?(room: GameRoom, millis: number, body: BodySchema): void;
  update?(room: GameRoom, millis: number): void;
}
