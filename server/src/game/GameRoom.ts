import { Client, Room } from "colyseus";
import { Bodies, Body, Engine, World } from "matter-js";
import { environment } from "../environment";
import { createLogger } from "../logger";
import { SprintAction } from "./actions/SprintAction";
import { BodyFactory } from "./BodyFactory";
import { CreatePhysicsController } from "./controllers/CreatePhysics";
import { CreateTileMap } from "./controllers/CreateTileMap";
import { UpdateBodyMoveDirection } from "./controllers/UpdateBodyMoveDirection";
import { UpdatePhysicalBodyPosition } from "./controllers/UpdatePhysicalBodyPosition";
import { GameController } from "./GameController";
import { GameEvents } from "./GameEvents";
import { HandleDirectionMessage } from "./messages/HandleDirectionMessage";
import { HandlePingMessage } from "./messages/HandlePingMessage";
import { CatchTimerRule } from "./rules/CatchTimerRule";
import { InitialCatcherGameRule } from "./rules/InitialCatcherGameRule";
import { TotalGameTimeRule } from "./rules/TotalGameTimeRule";
import { BodySchema, GameState, Player } from "./schema/GameState";
const log = createLogger("gameroom");

export type FinishGameReason = "totalTime";

export class GameRoom extends Room<GameState> {
  engine!: Engine;
  schemaToMatterBodyMap = new Map<BodySchema, Body>();
  matterBodyToSchemaBodyMap = new Map<Body, BodySchema>();
  bodyFactory = new BodyFactory();
  gameEvents = new GameEvents();
  controllers: GameController[] = [];

  finishGame(reason: FinishGameReason) {
    // TODO finish this game session
    log('finishing game with reason "%s"', reason);
  }

  onCreate(options: any) {
    this.setState(new GameState());
    this.schemaToMatterBodyMap = new Map();
    this.matterBodyToSchemaBodyMap = new Map();
    this.bodyFactory = new BodyFactory();
    this.gameEvents = new GameEvents();
    this.controllers = [
      new CreatePhysicsController(),
      new CreateTileMap(),
      new UpdateBodyMoveDirection(),
      new UpdatePhysicalBodyPosition(),

      new HandleDirectionMessage(),
      new HandlePingMessage(),

      new InitialCatcherGameRule(),
      new CatchTimerRule(),
      new TotalGameTimeRule(),

      new SprintAction(),
    ];
    this.engine = Engine.create({
      gravity: { x: 0, y: 0 },
    });

    this.setSimulationInterval(
      (millis) => this.update(millis),
      environment.SIMULATION_INTERVAL
    );

    this.controllers.forEach((controller) =>
      controller.attachToRoom?.call(controller, this, this.state)
    );
  }

  update(millis: number) {
    // apply body effects
    this.state.bodies.forEach((body) =>
      this.controllers.forEach((controller) =>
        // TODO optimization: do not call update methods on all objects but filter
        // different controller methods into separate lists!
        controller.updateBody?.call(controller, this, millis, body)
      )
    );
    this.controllers.forEach((controller) =>
      controller.update?.call(controller, this, millis)
    );
    // run physics simulation
    Engine.update(this.engine, millis);
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
    this.gameEvents.emit("newPlayer", { player, body });
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
