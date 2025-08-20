import type {
  AppState,
  User,
  Expense,
  ExpenseCategory,
  Department,
} from "../types/types";
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
  ];
  const categories: ExpenseCategory[] = [
    "Supplies",
    "Software",
    "Gas",
    "Food",
    "Other",
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
    "Thomas",
    "Lisa",
    "Charles",
    "Angela",
    "Christopher",
    "Heather",
    "Mark",
    "Amy",
    "Donald",
    "Anna",
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
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Perez",
    "Thompson",
    "White",
    "Harris",
    "Sanchez",
    "Clark",
    "Ramirez",
    "Lewis",
    "Robinson",
  ];

  const expenseDescriptions = [
    "Office supplies purchase",
    "Software license renewal",
    "Client meeting lunch",
    "Travel expenses",
    "Equipment maintenance",
    "Training materials",
    "Conference attendance",
    "Team building event",
    "Marketing campaign",
    "Research materials",
    "Presentation supplies",
    "Internet services",
    "Phone bill",
    "Printing costs",
    "Parking fees",
    "Taxi fare",
    "Hotel accommodation",
    "Flight tickets",
    "Meal allowance",
    "Office rent",
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
      ), // Random date within last year
      updatedAt: now,
    };

    mockState.departments.set(id, department);
    mockState.usersByDepartment.set(id, new Set());
  });

  const departmentIds = Array.from(mockState.departments.keys());

  // Create users and expenses
  for (let i = 0; i < 1000; i++) {
    const userId = generateId();
    const departmentId =
      departmentIds[Math.floor(Math.random() * departmentIds.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    const userCreatedAt = new Date(
      now.getTime() - Math.random() * 300 * 24 * 60 * 60 * 1000
    ); // Within last 10 months

    const user: User = {
      id: userId,
      firstName,
      lastName,
      departmentId,
      totalSpending: 0,
      expenseCount: 0,
      createdAt: userCreatedAt,
      updatedAt: now,
    };

    mockState.users.set(userId, user);
    mockState.expensesByUser.set(userId, new Set());

    const deptUsers = mockState.usersByDepartment.get(departmentId)!;
    deptUsers.add(userId);

    const department = mockState.departments.get(departmentId)!;
    department.userCount++;

    // Create expenses for each user
    const expenseCount = Math.floor(Math.random() * 1000) + 1000; // 1000-2000 expenses per user
    for (let j = 0; j < expenseCount; j++) {
      const expenseId = generateId();
      const cost = Math.floor(Math.random() * 1000) + 10; // $10-$1010
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const description =
        expenseDescriptions[
          Math.floor(Math.random() * expenseDescriptions.length)
        ];

      // Random date between user creation and now
      const expenseDate = new Date(
        userCreatedAt.getTime() +
          Math.random() * (now.getTime() - userCreatedAt.getTime())
      );

      const expense: Expense = {
        id: expenseId,
        userId,
        category,
        description: `${description} - ${j + 1}`,
        cost,
        createdAt: expenseDate,
        updatedAt: expenseDate,
      };

      mockState.expenses.set(expenseId, expense);

      const userExpenses = mockState.expensesByUser.get(userId)!;
      userExpenses.add(expenseId);

      user.totalSpending += cost;
      user.expenseCount++;
      department.totalSpending += cost;
    }

    user.updatedAt = now;
    department.updatedAt = now;
  }

  return mockState;
}

// Updated AppContext to handle LOAD_MOCK_DATA action
export const loadMockDataAction = (): AppState => {
  return generateMockData();
};
