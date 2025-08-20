export type ExpenseCategory =
  | "Supplies"
  | "Software"
  | "Gas"
  | "Food"
  | "Other";

export interface Department {
  id: string;
  name: string;
  userCount: number;
  totalSpending: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  departmentId: string;
  totalSpending: number;
  expenseCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  category: ExpenseCategory;
  description: string;
  cost: number;
  createdAt: Date;
  updatedAt: Date;
}

// Application State Types
export interface AppState {
  departments: Map<string, Department>;
  users: Map<string, User>;
  expenses: Map<string, Expense>;
  usersByDepartment: Map<string, Set<string>>;
  expensesByUser: Map<string, Set<string>>;
}

// Action Types for Context
export type DepartmentAction =
  | { type: "CREATE_DEPARTMENT"; payload: { name: string } }
  | { type: "UPDATE_DEPARTMENT"; payload: { id: string; name: string } }
  | { type: "DELETE_DEPARTMENT"; payload: { id: string; reassignTo?: string } };

export type UserAction =
  | {
      type: "CREATE_USER";
      payload: { firstName: string; lastName: string; departmentId: string };
    }
  | {
      type: "UPDATE_USER";
      payload: {
        id: string;
        firstName: string;
        lastName: string;
        departmentId: string;
      };
    }
  | { type: "DELETE_USER"; payload: { id: string } };

export type ExpenseAction =
  | {
      type: "CREATE_EXPENSE";
      payload: {
        userId: string;
        category: ExpenseCategory;
        description: string;
        cost: number;
      };
    }
  | {
      type: "UPDATE_EXPENSE";
      payload: {
        id: string;
        userId: string;
        category: ExpenseCategory;
        description: string;
        cost: number;
      };
    }
  | { type: "DELETE_EXPENSE"; payload: { id: string } };

export type AppAction =
  | DepartmentAction
  | UserAction
  | ExpenseAction
  | { type: "LOAD_MOCK_DATA" }
  | { type: "RESET_DATA" };

// Modal and UI Types
export interface ModalState {
  department: boolean;
  user: boolean;
  expense: boolean;
  deleteConfirm: boolean;
}

export interface DeleteTarget {
  type: "department" | "user" | "expense";
  id: string;
  name?: string;
}

// Form Types
export interface DepartmentFormData {
  name: string;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  departmentId: string;
}

export interface ExpenseFormData {
  userId: string;
  category: ExpenseCategory;
  description: string;
  cost: number;
}
