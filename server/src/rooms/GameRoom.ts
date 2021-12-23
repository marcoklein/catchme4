import { Room, Client } from "colyseus";
import { environment } from "../environment";
import { createLogger } from "../logger";
import { DirectionMessage } from "./messages/DirectionMessage";
import { BodySchema, GameState, Player } from "./schema/GameState";
import { runGameSimulation } from "./Simulation";
import { World, Bodies, Runner, Engine, Body, Vector } from "matter-js";
const log = createLogger("gameroom");

export class ServerBody {
  directions = { up: false, down: false, left: false, right: false };
}

export class MyRoom extends Room<GameState> {
  lastBodyId = 1;
  engine!: Engine;
  matterMap = new Map<BodySchema, Body>();

  onCreate(options: any) {
    this.setState(new GameState());
    this.matterMap = new Map<BodySchema, Body>();

    this.onMessage<DirectionMessage>("direction", (client, message) => {
      log("direction message", message, "from", client.sessionId);
      const { body } = this.state.findPlayerAndBody(client.sessionId);
      if (body) {
        let moveX = 0;
        let moveY = 0;
        if (message.down) moveY++;
        if (message.up) moveY--;
        if (message.left) moveX--;
        if (message.right) moveX++;
        if (moveX !== 0 || moveY !== 0) {
          log("move direction %j", { moveX, moveY });
          const { x, y } = Vector.normalise(Vector.create(moveX, moveY));
          log("after direction %j", { x, y });
          body.moveDirection.x = x;
          body.moveDirection.y = y;
          log("move direction %j", body.moveDirection);
        } else {
          body.moveDirection.x = 0;
          body.moveDirection.y = 0;
        }
      }
    });
    this.setSimulationInterval(
      (millis) => this.update(millis),
      environment.SIMULATION_INTERVAL
    );
    this.createPhysics();
  }
  private createPhysics() {
    this.engine = Engine.create({ gravity: { x: 0, y: 0 } });
  }

  update(millis: number) {
    // update body forces / directions
    this.state.bodies.forEach((body) => {
      const matterBody = this.matterMap.get(body);
      if (!matterBody) return;
      const speed = body.speed;
      const force = Vector.mult(body.moveDirection, speed * millis * 0.002);
      Body.applyForce(matterBody, body.position, force);
      matterBody.friction = 0.9;
      matterBody.frictionAir = 0.9;
      matterBody.frictionStatic = 0.9;
    });
    // run physics simulation
    Engine.update(this.engine, millis);
    // sync positions
    for (const [bodySchema, matterBody] of this.matterMap) {
      bodySchema.position.x = matterBody.position.x;
      bodySchema.position.y = matterBody.position.y;
    }
  }

  onJoin(client: Client, options: any) {
    log(client.sessionId, "joined!");
    const player = new Player(client.sessionId, "<player name>");
    const body = new BodySchema(`${this.lastBodyId++}`);
    body.radius = 16;
    player.bodyId = body.id;
    this.state.players.set(player.id, player);
    this.state.bodies.set(body.id, body);
    const matterBody = Bodies.circle(
      body.position.x,
      body.position.y,
      body.radius
    );
    World.add(this.engine.world, matterBody);
    this.matterMap.set(body, matterBody);
  }

  onLeave(client: Client, consented: boolean) {
    log(client.sessionId, "left!");
    const { player, body } = this.state.findPlayerAndBody(client.sessionId);
    if (player) this.state.players.delete(player.id);
    if (body) {
      this.state.bodies.delete(body.id);
      const matterBody = this.matterMap.get(body);
      if (matterBody) {
        World.remove(this.engine.world, matterBody);
        this.matterMap.delete(body);
      }
    }
  }

  onDispose() {
    log("room", this.roomId, "disposing...");
  }
}
