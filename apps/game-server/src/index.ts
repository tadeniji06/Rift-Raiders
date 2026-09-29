import http from "http";
import express from "express";
import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { ArenaRoom } from "./rooms/ArenaRoom";

const port = Number(process.env.PORT || 2567);
const app = express();

const server = http.createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({
    server
  })
});

// Register our Arena Room
gameServer.define("arena", ArenaRoom);

// Basic health check
app.get("/health", (req, res) => {
  res.send("Server is running!");
});

server.listen(port, () => {
  console.log(`[Rift Raiders] Game Server listening on http://localhost:${port}`);
});
