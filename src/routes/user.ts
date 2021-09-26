import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import { Usuario } from "../models/userModel";
import Token from "../utils/token";
import { verificaToken } from "../middlewares/auth";

const userRoutes = Router();

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

userRoutes.post(
  "/create-user",
  [verificaToken],
  async (req: Request, res: Response) => {
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

export default userRoutes;
