import { Client, Room } from "colyseus";
import { Bodies, Body, Engine, Events, Vector, World } from "matter-js";
import { environment } from "../environment";
import { createLogger } from "../logger";
import { SprintAction } from "./actions/SprintAction";
import { BodyFactory } from "./BodyFactory";
import { gameEnvironment } from "./gameEnvironment";
import { DirectionMessage } from "./messages/DirectionMessage";
import { PingMessage } from "./messages/PingMessage";
import { BodySchema, GameState, Player } from "./schema/GameState";
import { createTileMap } from "./TileMapController";
const log = createLogger("gameroom");

export class MyRoom extends Room<GameState> {
  engine!: Engine;
  schemaToMatterBodyMap = new Map<BodySchema, Body>();
  matterBodyToSchemaBodyMap = new Map<Body, BodySchema>();
  bodyFactory = new BodyFactory();
  sprintLogic = new SprintAction();

  onCreate(options: any) {
    this.setState(new GameState());
    this.schemaToMatterBodyMap = new Map();
    this.matterBodyToSchemaBodyMap = new Map();
    this.bodyFactory = new BodyFactory();
    this.sprintLogic = new SprintAction();

    this.onMessage<PingMessage>("ping", (client, pingId) =>
      client.send("pong", pingId)
    );
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
    this.sprintLogic.attachToRoom(this, this.state);
    this.setSimulationInterval(
      (millis) => this.update(millis),
      environment.SIMULATION_INTERVAL
    );
    this.createPhysics();
    this.initTileMap();

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
              bodyA.maxEnergy = gameEnvironment.normalEnergy;
              bodyB.isCatcher = true;
              bodyB.maxEnergy = gameEnvironment.catcherEnergy;
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

  private initTileMap() {
    const tileMap = createTileMap();

    this.state.tileMap = tileMap;

    // TODO add to TileMapController.ts
    const tileWorldX =
      -tileMap.mapSize.width * tileMap.tileSize * 0.5 + tileMap.tileSize / 2;
    const tileWorldY =
      -tileMap.mapSize.height * tileMap.tileSize * 0.5 + tileMap.tileSize / 2;
    this.state.tileMap.tiles.forEach((tile) => {
      if (tile.walkable) return;
      World.add(
        this.engine.world,
        Bodies.rectangle(
          tileWorldX + tile.position.x * tileMap.tileSize,
          tileWorldY + tile.position.y * tileMap.tileSize,
          tileMap.tileSize,
          tileMap.tileSize,
          {
            isStatic: true,
          }
        )
      );
    });
  }

  update(millis: number) {
    // apply body effects
    this.state.bodies.forEach((body) => {
      this.sprintLogic.updateBody(millis, body);

      // update body forces / directions
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
    this.state.players.set(player.id, player);
    const body = this.bodyFactory.createPlayerBody();
    player.bodyId = body.id;
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
      body.maxEnergy = gameEnvironment.catcherEnergy;
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
