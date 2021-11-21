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
      const { salary, vacaciones, enfermedad, leyesSociales, administracion, seguroRentaNacional,cuerpoBomberos,gastosNotariales,otrosGastos,type} = req.body;
      if (
        !validator.isEmpty(salary) &&
        !validator.isEmpty(vacaciones) &&
        !validator.isEmpty(enfermedad)
      ) {
        const adm = {
          salary,
          vacaciones,
          enfermedad,
          leyesSociales,
          administracion,
          seguroRentaNacional,
          cuerpoBomberos,
          gastosNotariales,
          otrosGastos,
          type,
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

admRoutes.put("/update-adm/:id", async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const { salary, vacaciones, enfermedad, leyesSociales, administracion, seguroRentaNacional,cuerpoBomberos,gastosNotariales,otrosGastos} = req.body;
    const admUpdate: any = await Administracion.findById(id).exec();
    if (admUpdate) {
      if (!validator.isEmpty(salary)) {
        admUpdate.salary = salary || "";
        admUpdate.vacaciones = vacaciones || "";
        admUpdate.enfermedad = enfermedad || "";
        admUpdate.leyesSociales = leyesSociales || "";
        admUpdate.administracion = administracion || "";
        admUpdate.seguroRentaNacional = seguroRentaNacional || "";
        admUpdate.cuerpoBomberos = cuerpoBomberos || "";
        admUpdate.gastosNotariales = gastosNotariales || "";
        admUpdate.otrosGastos = otrosGastos || "";
        const admSaved = await admUpdate.save();
        return res.status(200).json({
          ok: true,
          mensaje: "Adm Actualizado exitosamente",
          admSaved,
        });
      } else {
        return res.status(400).json({
          ok: false,
          message: "Los datos no son validos",
          error: {
            errors: {
              message: "Se debe ingresar al menos el salario del usuario.",
            },
          },
        });
      }
    } else {
      return res.status(400).json({
        ok: true,
        mensaje: "La adm con el " + id + "no existe",
        errors: { message: "No existe la Adm con ese ID" },
      });
    }
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: "La adm con el id " + id + " no existe",
      errors: { message: "No existe un usuario con ese ID" },
    });
  }
    
});


admRoutes.delete("/delete-adm/:id", async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const admDeleted: any = await Administracion.findByIdAndRemove(id).exec();
    if (admDeleted) {
      res.status(204).json({
        ok: true,
        mensaje: "Adm eiminado exitosamente",
        admDeleted,
      });
      return [];
    } else {
      return res.status(400).json({
        ok: false,
        mensaje: "La adm con el " + id + " ya no existe",
        errors: { message: "No existe una adm con ese ID" },
        adm: []
      });
    }
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: "La adm con el id " + id + " no existe",
      errors: { message: "No existe una adm con ese ID" },
      error,
    });
  }
});

export default admRoutes;
