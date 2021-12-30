import { GameRoom } from "./GameRoom";

export type PingMessage = number;

export class HandlePingMessage {
  attachToRoom(room: GameRoom) {
    room.onMessage<PingMessage>("ping", (client, pingId) =>
      client.send("pong", pingId)
    );
  }
}
