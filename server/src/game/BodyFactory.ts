import { BodySchema, Texture } from "./schema/GameState";
import { gameEnvironment } from "./gameEnvironment";

export class BodyFactory {
  lastBodyId = 1;

  createPlayerBody() {
    const body = new BodySchema(`${this.lastBodyId++}`);
    body.radius = 16;
    body.position.x = 50;
    body.position.y = 50;
    body.energy = 0;
    body.texture = new Texture("body.blue.1");
    body.maxEnergy = gameEnvironment.normalEnergy;
    body.speed = gameEnvironment.speedNormal;
    body.remainingCatcherTimeMillis = -1;
    body.isSprinting = false;
    return body;
  }
}
