import dotenv from "dotenv";
import Server from "./src/server/server";
import { db } from './src/db/db';
dotenv.config();

const server = new Server();

const conn = async () => {
  try {
    await db()
    console.log("La conexion a la bd se ha realizado bien");
    await server.start(Number(process.env.PORT));
  } catch (error) {
    console.log(error);
  }
};

conn();
