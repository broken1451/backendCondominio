import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import { verificaToken, verificaTokenAdm } from "../middlewares/auth";
import Token from "../utils/token";
import { ServiciosAdmModelSchema } from "../models/serviciosAdmModel";

const ServiciosAdmRoutes = Router();

ServiciosAdmRoutes.get("/services-adm", async (req: any, res: Response) => {
    try {
      let desde = req.query.desde || 0;
      desde = Number(desde);
      const ServiciosAdm = await ServiciosAdmModelSchema.find({})
        .skip(desde)
        .limit(5)
        .populate("administracion")
        .populate("usuario")
        .exec();
      const ServiciosAdmModelSchemaNumbers = await ServiciosAdmModelSchema.countDocuments({});
      return res.status(200).json({
        ok: true,
        mensaje: "Todo funciona bien",
        ServiciosAdm,
        ServiciosAdmModelSchemaNumbers,
      });
    } catch (error) {
      console.log(error);
    }
});


ServiciosAdmRoutes.post(
    "/create-services-adm",
    [verificaTokenAdm, verificaToken],
    async (req: any, res: Response) => {
      console.log({ user: req.usuario, adm: req.adm });
      try {
        const { nameService, type } = req.body;
        if (!validator.isEmpty(nameService) && !validator.isEmpty(type)) {
          const serviceAdm = {
            nameService,
            type,
            administracion: req.adm,
            usuario: req.usuario,
          };
          const serviceAdmCreated = await ServiciosAdmModelSchema.create(serviceAdm);
          const token = Token.getJwtToken(serviceAdmCreated);
          return res.status(201).json({
            ok: true,
            message: "service Adm guardado",
            serviceAdmCreated,
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
});

ServiciosAdmRoutes.put("/service-admUpdate/:id", async (req: any, res: Response) => {
    const { id } = req.params;
    try {
        const { nameService, type } = req.body;
      const servicenUpdate: any = await ServiciosAdmModelSchema.findById(id).exec();
      if (servicenUpdate) {
        if (!validator.isEmpty(nameService)) {
          servicenUpdate.nameService = nameService || "";
          servicenUpdate.type = type || "";
          const personSaved = await servicenUpdate.save();
          return res.status(200).json({
            ok: true,
            mensaje: "Servio Actualizado exitosamente",
            personSaved,
          });
        } else {
          return res.status(400).json({
            ok: false,
            message: "Los datos no son validos",
            error: {
              errors: {
                message: "Se debe ingresar al menos el nombre del servicio.",
              },
            },
          });
        }
      } else {
        return res.status(400).json({
          ok: true,
          mensaje: "El servicio con el " + id + "no existe",
          errors: { message: "No existe la persona con ese ID" },
        });
      }
    } catch (error) {
      return res.status(500).json({
        ok: false,
        mensaje: "El servicio con el id " + id + " no existe",
        errors: { message: "No existe un servicio con ese ID" },
      });
    }
      
});


ServiciosAdmRoutes.delete("/delete-serviceAdm/:id", async (req: any, res: Response) => {
    const { id } = req.params;
    try {
      const serviceDeleted: any = await ServiciosAdmModelSchema.findByIdAndRemove(id).exec();
      if (serviceDeleted) {
        res.status(204).json({
          ok: true,
          mensaje: "El servicio  eiminado exitosamente",
          serviceDeleted,
        });
        return [];
      } else {
        return res.status(400).json({
          ok: false,
          mensaje: "El servicio con el " + id + " ya no existe",
          errors: { message: "No existe un servicio  con ese ID" },
          adm: []
        });
      }
    } catch (error) {
      return res.status(500).json({
        ok: false,
        mensaje: "El servicio  con el id " + id + " no existe",
        errors: { message: "No existe una servicio con ese ID" },
        error,
      });
    }
  });

export default ServiciosAdmRoutes;