import { Usuario } from "../models/userModel";
import fileSystem from "fs";
import { Response } from "express";
import copydir from "copy-dir";


const borrarImg = (path: any) => {
  console.log('path', {path})
  // copydir(path, '../../dist/uploads', function(err){
  //   console.log('path 3333', {__dirname})
  //     if(err) throw err;
  //     console.log('done');
  // });

  if (fileSystem.existsSync(path)) {
    fileSystem.unlinkSync(path);
  }
};

export const subirImg = async ( id: string, nombreArchivo: string, res?: Response ) => {
  try {
    let pathViejo = "";
    try {
        const user = await Usuario.findById(id).exec();
        if (user) {
          if (!pathViejo && user.img == "") {
            console.log({pathViejo})
            pathViejo = "../uploads/" + user.img;
            borrarImg(pathViejo);
            user.img = nombreArchivo;
            await user.save();
            user.password = ":)";
            return res?.status(200).json({
              ok: true,
              mensaje: "user actualizado con exito",
              user,
            });
          } else {
            console.log('else', {pathViejo})
            pathViejo = "./uploads/" + user.img; // pathViejo de la imagen si el usuario ya tiene una guardada
            borrarImg(pathViejo);
            user.img = nombreArchivo;
            // copydir.sync(user.img, '../../dist/uploads/');
            // copydir('/my/from/path', '/my/target/path', {
            //   utimes: true,  // keep add time and modify time
            //   mode: true,    // keep file mode
            //   cover: true    // cover file when exists, default is true
            // }, function(err){
            //   if(err) throw err;
            //   console.log('done');
            // });
            await user.save();
            user.password = ":)";
            return res?.status(200).json({
              ok: true,
              mensaje: "user actualizado con exito",
              user,
            });
          }
        }
      } catch (error) {
        console.log({ error });
        return res?.json({
          ok: false,
          mensaje: "No existe un usuario por ese id",
        });
      }
    
  } catch (error) {
    console.log(error);
  }
};

