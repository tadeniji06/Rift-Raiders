import { Room, Client } from "@colyseus/core";
import { ArenaState, PlayerState } from "./schema/ArenaState";

export class ArenaRoom extends Room<ArenaState> {
  maxClients = 12;

  onCreate(options: any) {
    console.log("ArenaRoom created!", options);
    this.setState(new ArenaState());

    // Handle client movement updates
    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player && !player.isDead) {
        player.x = data.x;
        player.y = data.y;
      }
    });

    // Handle player actions (attack/dodge)
    this.onMessage("action", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player && !player.isDead) {
        player.action = data.action;
        // In a fully authoritative server, we would validate hits here.
        // For early Milestone 3, we just sync the animation state to others.
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const player = new PlayerState();
    player.id = client.sessionId;
    // Spawn near the center
    player.x = 1000 + (Math.random() * 100 - 50);
    player.y = 1000 + (Math.random() * 100 - 50);
    
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
