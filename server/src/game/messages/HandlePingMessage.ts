import { GameController } from "../GameController";
import { GameRoom } from "../GameRoom";

export type PingMessage = number;

export class HandlePingMessage implements GameController {
  attachToRoom(room: GameRoom) {
    room.onMessage<PingMessage>("ping", (client, pingId) =>
      client.send("pong", pingId)
    );
  }
}
