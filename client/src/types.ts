export type TypeRole = "god" | "Mafia" | "Healer" | "Detective" | "Citizen";

export type TypeUser = {
  socketId: string;
  name: string;
  role?: string;
  voted?: string;
  alive: boolean;
};
