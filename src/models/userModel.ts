import mongoose from "mongoose";
import bcrypt from "bcrypt";
import uniqueValidator from "mongoose-unique-validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es necesario y unico"],
      unique: true,
    },
    img: { type: String, default: "" },
    email: {
      type: String,
      unique: true,
      required: [true, "El correo es necesario y unico"],
    },
    password: { type: String, required: [true, "La clave esnecesaria"] },
    created: { type: Date, default: Date.now },
  },
  // {
  //   toJSON: {
  //     transform(doc, ret) {
  //       ret.id = ret._id;
  //       delete ret._id;
  //     },
  //     versionKey: false,
  //   },
  // }
);

userSchema.method(
  "compararClave",
  function name(password: string = ""): boolean {
    if (bcrypt.compareSync(password, this.password)) {
      return true;
    } else {
      return false;
    }
  }
);

interface User extends mongoose.Document {
  name?: string;
  img?: string;
  email?: string;
  password?: string;
  compararClave(password?: string): boolean;
}

userSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });
export const Usuario = mongoose.model<User>("users", userSchema);
