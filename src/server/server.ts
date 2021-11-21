import express from "express";
import cors from "cors";
import morgan from "morgan";
import userRoutes from "../routes/user";
import admRoutes from '../routes/administracion';
import personRoutes from '../routes/person';
import ServiciosAdmRoutes from '../routes/serviciosAdm';

export default class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors({ origin: true, credentials: true }));
    this.app.use(morgan("dev"));
  }

  async start(port: number, callback?: any) {
    this.app.listen(port, callback);
    console.log(`Servidor en puerto ${port}`);
    this.startRoutes();
  }

  startRoutes() {
    this.app.use("/api", userRoutes);
    this.app.use("/api", admRoutes);
    this.app.use("/api", personRoutes);
    this.app.use("/api", ServiciosAdmRoutes);
  }
}
