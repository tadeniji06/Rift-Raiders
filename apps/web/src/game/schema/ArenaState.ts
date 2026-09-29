import { Schema, MapSchema, defineTypes } from "@colyseus/schema";

export class PlayerState extends Schema {
  id: string = "";
  x: number = 1000;
  y: number = 1000;
  health: number = 100;
  isDead: boolean = false;
  action: string = "idle"; // "idle", "attacking", "dodging"
}

defineTypes(PlayerState, {
  id: "string",
  x: "number",
  y: "number",
  health: "number",
  isDead: "boolean",
  action: "string"
});

export class ArenaState extends Schema {
  players = new MapSchema<PlayerState>();
}

defineTypes(ArenaState, {
  players: { map: PlayerState }
});
