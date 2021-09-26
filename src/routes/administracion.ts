import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import { Administracion } from "../models/administracionModel";
import { verificaToken } from "../middlewares/auth";
import Token from "../utils/token";

const admRoutes = Router();

admRoutes.get("/adm", async (req: any, res: Response) => {
  try {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    const adms = await Administracion.find({})
      .skip(desde)
      .limit(5)
      .populate("usuario", "name")
      .exec();
    const admsNumbers = await Administracion.countDocuments({});
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

admRoutes.post(
  "/create-adm",
  [verificaToken],
  async (req: any, res: Response) => {
    console.log({ user: req.usuario });
    try {
      const { salary, vacaciones, enfermedad } = req.body;
      if (
        !validator.isEmpty(salary) &&
        !validator.isEmpty(vacaciones) &&
        !validator.isEmpty(enfermedad)
      ) {
        const adm = {
          salary,
          vacaciones,
          enfermedad,
          usuario: req.usuario,
        };
        const admCreated = await Administracion.create(adm);
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

export default admRoutes;
