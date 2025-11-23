export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export enum RequestType {
  LEAVE = 'LEAVE',
  OVERTIME = 'OVERTIME',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  password?: string; // stored in local storage, obviously not secure for prod but fine for this sim
  role: UserRole;
  otHours: number;
  leaveDays: number;
  joinedDate: string;
}

export interface Request {
  id: string;
  userId: string;
  userName: string; // denormalized for easier display
  employeeId: string;
  type: RequestType;
  status: RequestStatus;
  date: string; // Request date
  details: {
    startDate?: string;
    endDate?: string;
    otDate?: string;
    otHours?: number;
    district: string;
    bank?: string; // For OT
    reason: string;
  };
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}