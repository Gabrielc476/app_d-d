export type UserRole = "player" | "dungeon_master" | "admin";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends Omit<User, "password"> {
  // Additional profile information
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: UserRole;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}
