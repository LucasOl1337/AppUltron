export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type AuthPayload = {
  sub: string;
  email: string;
  name: string;
};
