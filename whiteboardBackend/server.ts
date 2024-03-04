import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const port = process.env.PORT || 3001;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

io.on("connection", (socket) => {
  socket.emit("welcome", { mssg: "welcome to the server", id: socket.id });
  socket.on("joinRoom", (res) => {
    if (res !== "none") {
      console.log({ socket: socket.id, room: res });
      socket.join(res);
      socket.on("draw", (res) => {
        socket.to(res.r).emit("draw", res);
      });
      socket.on("mouseMove", (res) => {
        socket.to(res.r).emit("mouseMove", res);
      });
    }
  });
});

httpServer.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
