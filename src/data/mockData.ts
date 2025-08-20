import type { AppState, User, Department } from "../types/types";
import { generateId } from "../lib/utils";

export function generateMockData(): AppState {
  const mockState: AppState = {
    departments: new Map(),
    users: new Map(),
    expenses: new Map(),
    usersByDepartment: new Map(),
    expensesByUser: new Map(),
  };

  const departmentNames = [
    "Engineering",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
    "Engineering2",
    "Marketing2",
    "Sales2",
    "HR2",
    "Finance2",
    "Engineering3",
    "Marketing3",
    "Sales3",
    "HR3",
    "Finance3",
  ];

  const firstNames = [
    "John",
    "Jane",
    "Michael",
    "Sarah",
    "David",
    "Emily",
    "Chris",
    "Jessica",
    "Matthew",
    "Ashley",
    "James",
    "Amanda",
    "Robert",
    "Melissa",
    "William",
    "Nicole",
    "Daniel",
    "Stephanie",
    "Joseph",
    "Jennifer",
  ];

  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Thompson",
    "White",
  ];

  const now = new Date();

  // Create departments
  departmentNames.forEach((name) => {
    const id = generateId();
    const department: Department = {
      id,
      name,
      userCount: 0,
      totalSpending: 0,
      createdAt: new Date(
        now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ),
      updatedAt: now,
    };

    mockState.departments.set(id, department);
    mockState.usersByDepartment.set(id, new Set());
  });

  const departmentIds = Array.from(mockState.departments.keys());

  // Create users
  for (let i = 0; i < 50; i++) {
    const userId = generateId();
    const departmentId =
      departmentIds[Math.floor(Math.random() * departmentIds.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    const user: User = {
      id: userId,
      firstName,
      lastName,
      departmentId,
      totalSpending: 0,
      expenseCount: 0,
      createdAt: new Date(
        now.getTime() - Math.random() * 300 * 24 * 60 * 60 * 1000
      ),
      updatedAt: now,
    };

    mockState.users.set(userId, user);
    mockState.expensesByUser.set(userId, new Set());

    // Add user to department
    const deptUsers = mockState.usersByDepartment.get(departmentId)!;
    deptUsers.add(userId);

    const department = mockState.departments.get(departmentId)!;
    department.userCount++;
    department.updatedAt = now;
  }

  return mockState;
}

export const loadMockDataAction = (): AppState => {
  return generateMockData();
};
