import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import { Usuario } from "../models/userModel";
import Token from "../utils/token";
import { verificaToken } from "../middlewares/auth";
import fileUpload from "express-fileupload";
import express from "express";
import uniqid from "uniqid";

const userRoutes = Router();
const app = express();
app.use(fileUpload());


userRoutes.get("/user", async (req: any, res: Response) => {
  try {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    const users = await Usuario.find({}, "name email _id img created")
      .skip(desde)
      .limit(5)
      .exec();
    const usersNumbers = await Usuario.countDocuments({});
    return res.status(200).json({
      ok: true,
      mensaje: "Todo funciona bien",
      users,
      usersNumbers,
    });
  } catch (error) {
    console.log(error);
  }
});

userRoutes.post("/create-user", [], async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      if (
        !validator.isEmpty(name) &&
        !validator.isEmpty(email) &&
        !validator.isEmpty(password)
      ) {
        const user = {
          name,
          email,
          password: bcrypt.hashSync(password, 10),
        };

        const userEmailExist = await Usuario.findOne({ email: email }).exec();
        if (userEmailExist) {
          return res.status(400).json({
            ok: false,
            message: `El usuario con el correo ${email} ya existe en el sistema`
          });
        }

        const userCreated = await Usuario.create(user);
        return res.status(201).json({
          ok: true,
          message: "user guardado",
          userCreated,
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

userRoutes.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const userLogin = await Usuario.findOne({ email: email }).exec();
    if (userLogin) {
      if (userLogin.compararClave(password)) {
        const payload = {
          _id: userLogin._id,
          name: userLogin.name,
          email: userLogin.email,
          img: userLogin.img,
        };
        const token = Token.getJwtToken(userLogin);
        return res.status(200).json({
          ok: true,
          userLogin,
          token,
        });
      } else if (password == "" || userLogin.password == "") {
        return res.status(400).json({
          ok: false,
          mensaje: "Campo vacio",
          // errors: {message:'Error no se encuentra email: ' + body.email +  ' asociado'}
          errors: { message: "El campo no puede estar vacio" },
        });
      } else if (password !== userLogin.password) {
        return res.status(400).json({
          ok: false,
          mensaje: "Clave incorrecta",
          errors: { message: "Clave incorrecta" },
        });
      }
    } else {
      throw new Error();
    }
  } catch (error) {
    return res.status(400).json({
      ok: false,
      mensaje: "Credenciales incorrectas",
      errors: {
        message: "Error no coincide El usuario registrado en la base de datos",
      },
    });
  }
});

userRoutes.put("/update-user/:id", async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const { name, email } = req.body;
    const userUpdate: any = await Usuario.findById(id).exec();
    if (userUpdate) {
      if (!validator.isEmpty(name)) {
        userUpdate.name = name || "";
        userUpdate.email = email || "";
        const userSaved = await userUpdate.save();
        return res.status(200).json({
          ok: true,
          mensaje: "Usuario Actualizado exitosamente",
          userSaved,
        });
      } else {
        return res.status(400).json({
          ok: false,
          message: "Los datos no son validos",
          error: {
            errors: {
              message: "Se debe ingresar al menos el nombre del usuario.",
            },
          },
        });
      }
    } else {
      return res.status(400).json({
        ok: true,
        mensaje: "El usuario con el " + id + "no existe",
        errors: { message: "No existe un usuario con ese ID" },
      });
    }
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: "El usuario con el id " + id + " no existe",
      errors: { message: "No existe un usuario con ese ID" },
    });
  }
    
});


userRoutes.delete("/delete-user/:id", async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const userDeleted: any = await Usuario.findByIdAndRemove(id).exec();
    if (userDeleted) {
      res.status(204).json({
        ok: true,
        mensaje: "Pc eiminado exitosamente",
        userDeleted,
      });
      return [];
    } else {
      return res.status(400).json({
        ok: false,
        mensaje: "El usuario con el " + id + " ya no existe",
        errors: { message: "No existe una usuario con ese ID" },
        user: []
      });
    }
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: "El usuario con el id " + id + " no existe",
      errors: { message: "No existe un usuario con ese ID" },
      error,
    });
  }
});

userRoutes.put("/upload-img/:id", async (req: any, res: Response) => {
  const { id } = req.params;
  const files = req.files;
  console.log({req:req.files, id})
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "No selecciono ningun archivo",
        errors: { message: "Debe seleccionar una imagen" },
      });
    }
   
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error,
    });
  }
});

export default userRoutes;
