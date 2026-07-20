import { UserRepository } from "@/repositories/user.repository";
import bcrypt from "bcryptjs";

export class AuthService {
  static async register({
    name,
    email,
    password,
    phoneNumber,
  }: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
  }) {
    const existingUser = await UserRepository.findByEmail(email);

    if (existingUser) {
      throw new Error("Email sudah terdaftar. Silakan gunakan email lain.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return UserRepository.createUser({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "CUSTOMER", // default register role
    });
  }
}
