
import mongoose from 'mongoose';

export const db =  async () => {
    mongoose.Promise = global.Promise;
    await mongoose.connect(String(process.env.URL_DB),  {})
}