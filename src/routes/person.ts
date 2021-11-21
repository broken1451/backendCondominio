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
    const personas = await Person.find({})
      .skip(desde)
      .limit(5)
      .populate("usuario")
      .populate("administracion")
      .exec();
    const personNumbers = await Person.countDocuments({});
    return res.status(200).json({
      ok: true,
      mensaje: "Todo funciona bien",
      personas,
      personNumbers,
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
        const personCreated = await Person.create(person);
        const token = Token.getJwtToken(personCreated);
        return res.status(201).json({
          ok: true,
          message: "person guardado",
          personCreated,
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

personRoutes.put("/update-person/:id", async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const { name, salary } = req.body;
    const personUpdate: any = await Person.findById(id).exec();
    if (personUpdate) {
      if (!validator.isEmpty(name)) {
        personUpdate.salary = salary || "";
        personUpdate.name = name || "";
        const personSaved = await personUpdate.save();
        return res.status(200).json({
          ok: true,
          mensaje: "Person Actualizado exitosamente",
          personSaved,
        });
      } else {
        return res.status(400).json({
          ok: false,
          message: "Los datos no son validos",
          error: {
            errors: {
              message: "Se debe ingresar al menos el name del usuario.",
            },
          },
        });
      }
    } else {
      return res.status(400).json({
        ok: true,
        mensaje: "La persona con el " + id + "no existe",
        errors: { message: "No existe la persona con ese ID" },
      });
    }
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: "La persona con el id " + id + " no existe",
      errors: { message: "No existe un usuario con ese ID" },
    });
  }
    
});

personRoutes.delete("/delete-person/:id", async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const personDeleted: any = await Person.findByIdAndRemove(id).exec();
    if (personDeleted) {
      res.status(204).json({
        ok: true,
        mensaje: "Adm eiminado exitosamente",
        personDeleted,
      });
      return [];
    } else {
      return res.status(400).json({
        ok: false,
        mensaje: "La persona con el " + id + " ya no existe",
        errors: { message: "No existe una persona con ese ID" },
        adm: []
      });
    }
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: "La persona con el id " + id + " no existe",
      errors: { message: "No existe una persona con ese ID" },
      error,
    });
  }
});

export default personRoutes;
