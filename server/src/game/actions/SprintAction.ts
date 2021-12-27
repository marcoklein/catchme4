import { Schema, type } from "@colyseus/schema";
import { createLogger } from "../../logger";
import { GameController } from "../GameController";
import { gameEnvironment } from "../gameEnvironment";
import { GameRoom } from "../GameRoom";
import { BodySchema, GameState } from "../schema/GameState";
const log = createLogger("sprintlogic");

export type SprintMessage = boolean;

export class SprintActionRules extends Schema {
  /**
   * With `burst` a player can stop the sprint but with `unload` the body
   * runs until its energy is 0.
   */
  @type("string") mode: "burst" | "unload" = "burst";
  @type("boolean") startSprintOnlyWithFullEnergy = false;
  @type("number") speedSprint = gameEnvironment.speedSprint;
  @type("number") sprintEnergyDrainPerMillisecond =
    gameEnvironment.sprintEnergyDrainPerMillisecond;
}

export class SprintAction implements GameController {
  config = new SprintActionRules();

  attachToRoom(room: GameRoom, state: GameState) {
    this.config = state.gameRules.sprintActionRules;
    room.onMessage<SprintMessage>("sprint", (client, sprint) => {
      log("sprint message from %s", client.sessionId);
      const { body } = state.findPlayerAndBody(client.sessionId);
      if (body) {
        if (sprint) {
          body.wantsToSprint = true;
        } else if (!sprint) {
          body.wantsToSprint = false;
        }
      }
    });
  }

  updateBody(_room: GameRoom, millis: number, body: BodySchema) {
    // update body effects (e.g. player sprinting)
    body.speed = gameEnvironment.speedNormal;
    if (
      (body.wantsToSprint && !this.config.startSprintOnlyWithFullEnergy) ||
      (this.config.startSprintOnlyWithFullEnergy &&
        body.energy === body.maxEnergy)
    ) {
      body.isSprinting = true;
    } else if (!body.wantsToSprint) {
      if (this.config.mode === "burst") body.isSprinting = false;
    }

    if (body.isSprinting) {
      body.energy = Math.max(
        0,
        body.energy - millis * gameEnvironment.sprintEnergyDrainPerMillisecond
      );
      if (body.energy <= 0) body.isSprinting = false;
      else body.speed = gameEnvironment.speedSprint;
    } else if (!body.isSprinting) {
      body.energy = Math.min(
        body.maxEnergy,
        body.energy + millis * gameEnvironment.energyGainPerMillisecond
      );
    }
  }
}
