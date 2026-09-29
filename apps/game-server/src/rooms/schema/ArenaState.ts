import { Schema, type, MapSchema } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("string") id: string = "";
  @type("number") x: number = 1000;
  @type("number") y: number = 1000;
  @type("number") health: number = 100;
  @type("boolean") isDead: boolean = false;
  @type("string") action: string = "idle"; // "idle", "attacking", "dodging"
}

export class ArenaState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
}
