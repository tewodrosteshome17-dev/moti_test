import { User, Request, UserRole, RequestStatus, RequestType } from '../types';
import { INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_ID, INITIAL_ADMIN_PASSWORD } from '../constants';

const USERS_KEY = 'ems_users';
const REQUESTS_KEY = 'ems_requests';
const CURRENT_USER_KEY = 'ems_current_user';

// Initialize with a default admin if empty
const initializeStorage = () => {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    const adminUser: User = {
      id: 'admin-fixed-id', // Fixed ID to prevent session issues during resets if possible
      employeeId: INITIAL_ADMIN_ID,
      name: 'System Administrator',
      email: INITIAL_ADMIN_EMAIL,
      password: INITIAL_ADMIN_PASSWORD,
      role: UserRole.ADMIN,
      otHours: 0,
      leaveDays: 0,
      joinedDate: new Date().toISOString(),
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([adminUser]));
  }
  if (!localStorage.getItem(REQUESTS_KEY)) {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify([]));
  }
};

initializeStorage();

export const getUsers = (): User[] => {
  const usersStr = localStorage.getItem(USERS_KEY);
  return usersStr ? JSON.parse(usersStr) : [];
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const updateUser = (updatedUser: User): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Update session if it's the current user
    const currentUser = getCurrentSession();
    if (currentUser && currentUser.id === updatedUser.id) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }
  }
};

export const getRequests = (): Request[] => {
  const reqStr = localStorage.getItem(REQUESTS_KEY);
  return reqStr ? JSON.parse(reqStr) : [];
};

export const saveRequest = (request: Request): void => {
  const requests = getRequests();
  requests.push(request);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
};

export const updateRequestStatus = (requestId: string, status: RequestStatus): void => {
  const requests = getRequests();
  const requestIndex = requests.findIndex(r => r.id === requestId);
  
  if (requestIndex !== -1) {
    const request = requests[requestIndex];
    request.status = status;
    requests[requestIndex] = request;
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));

    // Business Logic: Update User Balances
    if (status === RequestStatus.APPROVED) {
        const users = getUsers();
        const user = users.find(u => u.id === request.userId);
        
        if (user) {
            if (request.type === RequestType.OVERTIME && request.details.otHours) {
                user.otHours += Number(request.details.otHours);
            } else if (request.type === RequestType.LEAVE && request.details.startDate && request.details.endDate) {
                // Simple day calculation
                const start = new Date(request.details.startDate);
                const end = new Date(request.details.endDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
                user.leaveDays = Math.max(0, user.leaveDays - diffDays);
            }
            updateUser(user);
        }
    }
  }
};

export const getCurrentSession = (): User | null => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentSession = (user: User | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Database Management Functions
export const resetDatabase = (): void => {
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(REQUESTS_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  initializeStorage();
  window.location.reload();
};

export const seedDatabase = (): void => {
  const users = getUsers();
  const requests = getRequests();

  const dummyUsers: User[] = [
    {
      id: 'user-john',
      employeeId: 'EMP_001',
      name: 'John Doe',
      email: 'john@company.com',
      password: '123',
      role: UserRole.EMPLOYEE,
      otHours: 12.5,
      leaveDays: 10,
      joinedDate: '2023-01-15T09:00:00.000Z',
    },
    {
      id: 'user-jane',
      employeeId: 'EMP_002',
      name: 'Jane Smith',
      email: 'jane@company.com',
      password: '123',
      role: UserRole.EMPLOYEE,
      otHours: 0,
      leaveDays: 14,
      joinedDate: '2023-03-20T09:00:00.000Z',
    },
    {
      id: 'user-mike',
      employeeId: 'EMP_003',
      name: 'Mike Ross',
      email: 'mike@company.com',
      password: '123',
      role: UserRole.EMPLOYEE,
      otHours: 5,
      leaveDays: 13,
      joinedDate: '2023-06-10T09:00:00.000Z',
    }
  ];

  let usersAdded = false;
  dummyUsers.forEach(u => {
    if (!users.some(existing => existing.email === u.email)) {
      users.push(u);
      usersAdded = true;
    }
  });

  if (usersAdded) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      const dummyRequests: Request[] = [
        {
            id: 'req-1',
            userId: 'user-john',
            userName: 'John Doe',
            employeeId: 'EMP_001',
            type: RequestType.LEAVE,
            status: RequestStatus.APPROVED,
            date: new Date().toISOString(),
            details: {
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                district: 'North',
                reason: 'Family Holiday'
            },
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
        },
        {
            id: 'req-2',
            userId: 'user-jane',
            userName: 'Jane Smith',
            employeeId: 'EMP_002',
            type: RequestType.OVERTIME,
            status: RequestStatus.PENDING,
            date: new Date().toISOString(),
            details: {
                otDate: new Date().toISOString().split('T')[0],
                otHours: 4,
                district: 'Central',
                bank: 'Chase',
                reason: 'Server Migration'
            },
            createdAt: new Date().toISOString()
        }
      ];
      
      const newRequests = [...requests, ...dummyRequests];
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(newRequests));
  }
};