import mongoose from "mongoose";
import { Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const serviciosAdmModelSchema = new mongoose.Schema(
  {
    nameService: {
      type: String,
      required: [true, "El nombre del servicio es requerido"],
    },
    type:{
        type: String,
        required: [true, "El tipo es requerido"],
    },
    administracion:{
        type: Schema.Types.ObjectId, 
        ref: 'administracion', 
        required: [ true, 'El id administracion es un campo obligatorio'] 
    },
    usuario:{
        type: Schema.Types.ObjectId, 
        ref: 'users', 
        required: [ true, 'El id users es un campo obligatorio'] 
    },
  }
);
serviciosAdmModelSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });
export const ServiciosAdmModelSchema = mongoose.model("serviciosAdm", serviciosAdmModelSchema);