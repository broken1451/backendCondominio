import mongoose from "mongoose";
import { Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const personaModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es requerido"],
    },
    salary:{
        type: String,
        required: [true, "El sueldo es requerido"],
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
personaModelSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });
export const Person = mongoose.model("personas", personaModelSchema);
