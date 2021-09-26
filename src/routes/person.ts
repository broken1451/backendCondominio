import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import { verificaToken, verificaTokenAdm } from "../middlewares/auth";
import Token from "../utils/token";
import { Person } from "../models/personasModel";

const personRoutes = Router();

personRoutes.get("/person", async (req: any, res: Response) => {
  try {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    const adms = await Person.find({})
      .skip(desde)
      .limit(5)
      .populate("usuario")
      .populate("administracion")
      .exec();
    const admsNumbers = await Person.countDocuments({});
    return res.status(200).json({
      ok: true,
      mensaje: "Todo funciona bien",
      adms,
      admsNumbers,
    });
  } catch (error) {
    console.log(error);
  }
});

personRoutes.post(
  "/create-person",
  [verificaToken, verificaTokenAdm],
  async (req: any, res: Response) => {
    console.log({ user: req.usuario, adm: req.adm });
    try {
      const { name, salary } = req.body;
      if (!validator.isEmpty(name) && !validator.isEmpty(salary)) {
        const person = {
          name,
          salary,
          usuario: req.usuario,
          administracion: req.adm,
        };
        const admCreated = await Person.create(person);
        const token = Token.getJwtToken(admCreated);
        return res.status(201).json({
          ok: true,
          message: "adm guardado",
          admCreated,
          token,
        });
      } else {
        return res.status(400).json({
          ok: false,
          message: "Los datos no son validos",
        });
      }
    } catch (error) {
      // console.log(error);
      return res.status(500).json({
        message: "Faltan datos por enviar",
        error,
      });
    }
  }
);

export default personRoutes;
