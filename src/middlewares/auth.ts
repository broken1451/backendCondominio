import { NextFunction, Request, Response } from "express";
import Token from "../utils/token";

export const verificaToken = (req: any, res: Response, next: NextFunction) => {
  // token enviado por los headers
  const userToken = req.get("x-token") || "";

  Token.comprobarToken(userToken)
    .then((decoded: any) => {
      req.usuario = decoded.usuario;
      next();
    })
    .catch((err) => {
      return res.status(400).json({
        ok: false,
        mensaje: "token no valido",
        err
      });
    });
};

export const verificaTokenAdm = (req: any, res: Response, next: NextFunction) => {
  // token enviado por los headers
  const admToken = req.get("adm-token") || "";

  Token.comprobarToken(admToken)
    .then((decoded: any) => {
      req.adm = decoded.usuario;
      next();
    })
    .catch((err) => {
      return res.status(400).json({
        ok: false,
        mensaje: "token no valido",
        err
      });
    });
};