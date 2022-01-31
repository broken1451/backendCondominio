import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import path from "path";
import fileSystem from "fs";
import validator from "validator";
import { Usuario } from "../models/userModel";
import Token from "../utils/token";
import { verificaToken } from "../middlewares/auth";
import fileUpload from "express-fileupload";
import express from "express";
import uniqid from "uniqid";
import fse from "fs-extra";
import copydir from "copy-dir";
import { subirImg } from "../utils/subirImg";



const userRoutes = Router();
const app = express();
const fileUploadUpload = fileUpload();
app.use(fileUpload());



userRoutes.get("/user", [], async (req: any, res: Response) => {
  try {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    const users = await Usuario.find({}, "name email _id img created")
      .skip(desde)
      .limit(15)
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

userRoutes.get("/user/:id", [], async (req: any, res: Response) => {
  try {
    let desde = req.query.desde || 0;
    let {id} = req.params;
    desde = Number(desde);
    const user = await Usuario.findById(id)
      .skip(desde)
      .exec();
    return res.status(200).json({
      ok: true,
      mensaje: "Todo funciona bien",
      user
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

userRoutes.put("/update-user/:id", [verificaToken], async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const { name, email } = req.body;
    const userUpdate: any = await Usuario.findById(id).exec();
    if (userUpdate) {
      if (!validator.isEmpty(name)) {
        userUpdate.name = name || "";
        userUpdate.email = email || "";
        const userSaved = await userUpdate.save();
        userSaved.password = ":)";
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
        mensaje: "User eiminado exitosamente",
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

userRoutes.put("/upload-img/:id", [fileUploadUpload], async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "No selecciono ningun archivo",
        errors: { message: 'Debe seleccionar una imagen' }
      });
    }


    const nombreArchivo = req.files.image; //imagen es el nombre que esta en el postman
    const nombreArchivoSeparado = nombreArchivo.name.split('.'); // separar en un arreglo el archivo para tener su extension
    const extensionArchivo = nombreArchivoSeparado[nombreArchivoSeparado.length - 1]; // obtener la extension del archivo

    const extensionesValida = ['png', 'jpg', 'gif', 'jpeg'];
    if (!extensionesValida.includes(extensionArchivo)) {
      // Si manda un -1 o cualquier otro valor menor a cero manda error
      return res.status(400).json({
        ok: false,
        mensaje: 'Extension no valida',
        errors: {
          message:
            'La extesion agregada no es permitida solo se admiten estas extensiones: ' +
            extensionesValida.join(','),
        },
      });
    }

    const idUnico = uniqid();
    const nombreImagenPersonalizado = `${idUnico}.${extensionArchivo}`;
    const Path = `./uploads/${nombreImagenPersonalizado}`;

    // copydir(path, '../../dist/uploads', {
    //   utimes: true,  // keep add time and modify time
    //   mode: true,    // keep file mode
    //   cover: true    // cover file when exists, default is true
    // }, function(err){
    //   if(err) throw err;
    //   console.log('done');
    // });

    // const currentPath = path.join(__dirname, `../../../uploads/${nombreImagenPersonalizado}`);
    // const destinationPath = path.join(__dirname, "../../dist/uploads/"+ nombreImagenPersonalizado);
    // console.log({__dirname,currentPath, destinationPath})
    // var source = fileSystem.createReadStream(currentPath);
    // var dest = fileSystem.createWriteStream(destinationPath);

    // source.pipe(dest);
    // source.on('end', function() { /* copied */ });
    // source.on('error', function(err) { /* error */ });
    // fileSystem.rename(currentPath, destinationPath, function (err) {
    //     if (err) {
    //         throw err
    //     } else {
    //         console.log("Successfully moved the file!");
    //     }
    // });

    nombreArchivo.mv(Path, (err: any) => {
      if (err) {
        console.log({ err })
        return res.status(500).json({
          ok: false,
          mensaje: "Error al mover archivo",
          errors: err
        });
      }
      subirImg(id, nombreImagenPersonalizado, res);
    });


  } catch (error) {
    return res.status(500).json({
      ok: false,
      error,
    });
  }
});


userRoutes.get("/get-img-user/:imagen", (req, res, next) => {
  const { imagen } = req.params;
  try {

    // Creacion del path  __dirname(toda la ruta donde se encuentra en este momento), `referencia a donde se encuentra la imagen`
    // const pathImagen = path.resolve(__dirname, `../../../uploads/${imagen}`); // Resolver el path para que siempre quede correcto, tipoImagen = usuarios / estudiantes, imagen = nombre de imagen
    const pathImagen = path.resolve(__dirname, `../../../uploads/${imagen}`); // Resolver el path para que siempre quede correcto, tipoImagen = usuarios / estudiantes, imagen = nombre de imagen
    console.log({ __dirname, pathImagen })
    if (fileSystem.existsSync(pathImagen)) {
      return res.sendFile(pathImagen);
    } else {
      const pathNoImage = path.resolve(__dirname, `../../../assets/no-img.jpg`);
      return res.sendFile(pathNoImage);
    }

  } catch (error) { }
});

export default userRoutes;
