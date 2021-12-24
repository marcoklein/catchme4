import { Room, Client } from "colyseus";
import { environment } from "../environment";
import { createLogger } from "../logger";
import { DirectionMessage } from "./messages/DirectionMessage";
import {
  BodySchema,
  GameState,
  Player,
  Tile,
  TileMap,
} from "./schema/GameState";
import {
  World,
  Events,
  Bodies,
  Runner,
  Engine,
  Body,
  Vector,
  Bounds,
} from "matter-js";
const log = createLogger("gameroom");

export class ServerBody {
  directions = { up: false, down: false, left: false, right: false };
}

export class MyRoom extends Room<GameState> {
  lastBodyId = 1;
  engine!: Engine;
  schemaToMatterBodyMap = new Map<BodySchema, Body>();
  matterBodyToSchemaBodyMap = new Map<Body, BodySchema>();

  onCreate(options: any) {
    this.setState(new GameState());
    this.createTileMap();
    this.schemaToMatterBodyMap = new Map();
    this.matterBodyToSchemaBodyMap = new Map();

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

    const tileMap = this.state.tileMap;
    this.createWorldBoundaries(
      tileMap.mapSize.width * tileMap.tileSize,
      tileMap.mapSize.height * tileMap.tileSize
    );
  }

  private createPhysics() {
    this.engine = Engine.create({
      gravity: { x: 0, y: 0 },
    });
    // TODO put this into game rules
    Events.on(this.engine, "collisionStart", (e) => {
      e.pairs.forEach((pair) => {
        const bodyA = this.matterBodyToSchemaBodyMap.get(pair.bodyA);
        const bodyB = this.matterBodyToSchemaBodyMap.get(pair.bodyB);

        if (bodyA && bodyB) {
          const catchBody = (bodyA: BodySchema, bodyB: BodySchema) => {
            if (bodyA.isCatcher && !bodyB.isCatcher) {
              bodyA.isCatcher = false;
              bodyB.isCatcher = true;
              return true;
            }
            return false;
          };
          if (!catchBody(bodyA, bodyB)) catchBody(bodyB, bodyA);
        }
      });
    });
  }

  private createWorldBoundaries(
    width: number,
    height: number,
    thickness = 100
  ) {
    const x = -width / 2,
      y = -height / 2;
    World.add(this.engine.world, [
      Bodies.rectangle(
        x - thickness + (width + 2 * thickness) / 2,
        y - thickness / 2,
        width + 2 * thickness,
        thickness,
        {
          isStatic: true,
        }
      ),
      Bodies.rectangle(
        x + width + thickness / 2,
        y + height / 2,
        thickness,
        height,
        { isStatic: true }
      ),
      Bodies.rectangle(
        x - thickness + (width + 2 * thickness) / 2,
        y + height + thickness / 2,
        width + 2 * thickness,
        thickness,
        { isStatic: true }
      ),
      Bodies.rectangle(x - thickness / 2, y + height / 2, thickness, height, {
        isStatic: true,
      }),
    ]);
  }

  private createTileMap() {
    const tileMap = new TileMap();
    tileMap.mapSize.width = 15;
    tileMap.mapSize.height = 10;
    tileMap.tileSize = 64;
    for (let i = 0; i < tileMap.mapSize.width * tileMap.mapSize.height; i++) {
      const tile = new Tile();
      const x = i % tileMap.mapSize.width;
      const y = Math.floor(i / tileMap.mapSize.height);
      tile.position.x = x;
      tile.position.y = y;
      tileMap.tiles.set(`${tile.position.x};${tile.position.y}`, tile);
    }
    this.state.tileMap = tileMap;
  }

  update(millis: number) {
    // update body forces / directions
    this.state.bodies.forEach((body) => {
      const matterBody = this.schemaToMatterBodyMap.get(body);
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
    for (const [bodySchema, matterBody] of this.schemaToMatterBodyMap) {
      bodySchema.position.x = matterBody.position.x;
      bodySchema.position.y = matterBody.position.y;
    }
  }

  onJoin(client: Client, options: any) {
    log(client.sessionId, "joined!");
    const player = new Player(client.sessionId, "<player name>");
    const body = new BodySchema(`${this.lastBodyId++}`);
    body.radius = 16;
    body.position.x = 50;
    body.position.y = 50;
    player.bodyId = body.id;
    this.state.players.set(player.id, player);
    this.state.bodies.set(body.id, body);
    const matterBody = Bodies.circle(
      body.position.x,
      body.position.y,
      body.radius
    );
    World.add(this.engine.world, matterBody);
    this.schemaToMatterBodyMap.set(body, matterBody);
    this.matterBodyToSchemaBodyMap.set(matterBody, body);

    // TODO put this into game rules
    body.isCatcher = false;
    let catchingPlayer = false;
    for (const [_, body] of this.state.bodies) {
      if (body.isCatcher) catchingPlayer = true;
    }
    if (!catchingPlayer) {
      body.isCatcher = true;
    }
  }

  onLeave(client: Client, consented: boolean) {
    log(client.sessionId, "left!");
    const { player, body } = this.state.findPlayerAndBody(client.sessionId);
    if (player) this.state.players.delete(player.id);
    if (body) {
      this.state.bodies.delete(body.id);
      const matterBody = this.schemaToMatterBodyMap.get(body);
      if (matterBody) {
        World.remove(this.engine.world, matterBody);
        this.schemaToMatterBodyMap.delete(body);
        this.matterBodyToSchemaBodyMap.delete(matterBody);
      }
    }
  }

  onDispose() {
    log("room", this.roomId, "disposing...");
  }
}
