import { Schema, type } from "@colyseus/schema";
import { Room } from "colyseus";
import { createLogger } from "../../logger";
import { gameEnvironment } from "../gameEnvironment";
import { SprintMessage } from "../messages/SprintMessage";
import { BodySchema, GameState } from "../schema/GameState";
const log = createLogger("sprintlogic");

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

export class SprintAction {
  config = new SprintActionRules();

  attachToRoom(room: Room<GameState>, state: GameState) {
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

  updateBody(millis: number, body: BodySchema) {
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
