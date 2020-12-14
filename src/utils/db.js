import mongoose from "mongoose";
import config from "../config";

export const connect = (url = config.dbURL, opts = {}) => {
  return mongoose.connect(url, opts);
};
