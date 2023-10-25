export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  phoneNumber?: string;
}

export interface UserExtended extends User {
  id: string;
  provider?: string;
  uid: string;
  email: string;
  role: Role;
  assignedDistricts?: string[];
}

export enum Role {
  Admin = 'admin',
  Guest = 'guest',
  SuperAdmin = 'super-admin',
}

export const isAdminRole = (role: Role) => {
  return [Role.Admin, Role.SuperAdmin].includes(role);
};
export const isSuperAdminRole = (role: Role) => {
  return [Role.SuperAdmin].includes(role);
};
