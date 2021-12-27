import { GameController } from "../GameController";
import { gameEnvironment } from "../gameEnvironment";
import { GameRoom } from "../GameRoom";
import { GameState } from "../schema/GameState";

export class InitialCatcherGameRule implements GameController {
  attachToRoom(room: GameRoom, state: GameState) {
    room.gameEvents.on("newPlayer", ({ body }) => {
      body.isCatcher = false;
      let catchingPlayer = false;
      for (const [_, body] of state.bodies) {
        if (body.isCatcher) catchingPlayer = true;
      }
      if (!catchingPlayer) {
        body.isCatcher = true;
        // TODO create function to mark players as caught
        room.gameEvents.emit("caught", { catcher: undefined, caught: body });
        body.maxEnergy = gameEnvironment.catcherEnergy;
      }
    });
  }
}
