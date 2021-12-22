import { Client } from "colyseus.js";
import { GameState } from "../generated/GameState";

export function createClient() {
  const client = new Client("ws://localhost:2567");

  client.joinOrCreate<GameState>("gameRoom").then((room) => {
    console.log(room.sessionId, "joined", room.id, room.name);
    room.onStateChange((state) => {
      console.log(room.name, "has new state", state);
    });
    room.onMessage("message", (message) => {
      console.log(room.id, "received", message);
    });
    room.state.players.onAdd = (player) => {
      console.log(player, "has id", player.id);

      player.onChange = (changes) => {
        changes.forEach((change) => {
          console.log(change.field);
          console.log(change.value);
          console.log(change.previousValue);
        });
      };

      player.triggerAll();
    };
  });
}
