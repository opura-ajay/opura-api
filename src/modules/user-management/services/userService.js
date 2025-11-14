import User from "../models/User.js";

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const createUser = async (data) => {
  return await User.create(data);
};

export const getUsers = async () => {
  return await User.find().select("-password");
};
