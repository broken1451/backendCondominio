import mongoose from "mongoose";
import { Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const administracionSchema = new mongoose.Schema(
  {
    salary: {
      type: String,
      required: [true, "El sueldo es necesario"],
    },
    usuario:{
        type: Schema.Types.ObjectId, 
        ref: 'users', 
        required: [ true, 'El id users es un campo obligatorio'] 
    },
    type:{
        type: String,
        required: [true, "El tipo es requerido"],
    },
    vacaciones: {
        type: String,
    },
    enfermedad: {
        type: String,
    },
    leyesSociales: {
        type: String,
    },
    administracion: {
        type: String,
    },
    seguroRentaNacional: {
        type: String,
    },
    cuerpoBomberos: {
        type: String,
    },
    gastosNotariales: {
        type: String,
    },
    otrosGastos: {
        type: String,
    },
  }
);
administracionSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });
export const Administracion = mongoose.model("administracion", administracionSchema);
