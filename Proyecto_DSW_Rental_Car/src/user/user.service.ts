import bcrypt from 'bcrypt';
import { IUser, User } from './user.entity.js';

export const register = async (username: string, name: string, password: string): Promise<IUser> => {
  if (!password || password.length < 3) {
    throw new Error('La contraseña debe tener al menos 3 caracteres');
  }
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new Error('El nombre de usuario ya existe');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ username, name, passwordHash });
  return await user.save();
};

export const getUsers = async (): Promise<IUser[]> => {
  return await User.find({});
};

export const findUserById = async (id: string): Promise<IUser | null> => {
  return await User.findById(id);
};

export const deleteUserById = async (id: string): Promise<IUser | null> => {
  return await User.findByIdAndDelete(id);
};

export const findUserByUsername = async (username: string): Promise<IUser | null> => {
  return await User.findOne({ username });
};