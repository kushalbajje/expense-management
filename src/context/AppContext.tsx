import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { AppState, AppAction, Department, User } from "../types/types";
import { generateId } from "../lib/utils";
import { generateMockData } from "../data/mockData";

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  departments: new Map(),
  users: new Map(),
  expenses: new Map(),
  usersByDepartment: new Map(),
  expensesByUser: new Map(),
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "CREATE_DEPARTMENT": {
      const id = generateId();
      const now = new Date();
      const newDepartment: Department = {
        id,
        name: action.payload.name,
        userCount: 0,
        totalSpending: 0,
        createdAt: now,
        updatedAt: now,
      };

      return {
        ...state,
        departments: new Map(state.departments).set(id, newDepartment),
        usersByDepartment: new Map(state.usersByDepartment).set(id, new Set()),
      };
    }

    case "UPDATE_DEPARTMENT": {
      const { id, name } = action.payload;
      const department = state.departments.get(id);
      if (!department) return state;

      const updatedDepartment = {
        ...department,
        name,
        updatedAt: new Date(),
      };

      return {
        ...state,
        departments: new Map(state.departments).set(id, updatedDepartment),
      };
    }

    case "DELETE_DEPARTMENT": {
      const { id, reassignTo } = action.payload;
      const newState = { ...state };

      newState.departments = new Map(state.departments);
      newState.users = new Map(state.users);
      newState.usersByDepartment = new Map(state.usersByDepartment);

      const usersToReassign = state.usersByDepartment.get(id);

      if (reassignTo && usersToReassign) {
        const targetDeptUsers =
          newState.usersByDepartment.get(reassignTo) || new Set();
        const targetDept = newState.departments.get(reassignTo);

        usersToReassign.forEach((userId) => {
          const user = newState.users.get(userId);
          if (user) {
            newState.users.set(userId, {
              ...user,
              departmentId: reassignTo,
              updatedAt: new Date(),
            });
            targetDeptUsers.add(userId);
          }
        });

        if (targetDept) {
          newState.departments.set(reassignTo, {
            ...targetDept,
            userCount: targetDept.userCount + usersToReassign.size,
            updatedAt: new Date(),
          });
        }

        newState.usersByDepartment.set(reassignTo, targetDeptUsers);
      }

      newState.departments.delete(id);
      newState.usersByDepartment.delete(id);

      return newState;
    }

    case "CREATE_USER": {
      const { firstName, lastName, departmentId } = action.payload;
      const id = generateId();
      const now = new Date();
      const newUser: User = {
        id,
        firstName,
        lastName,
        departmentId,
        totalSpending: 0,
        expenseCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      const newState = { ...state };
      newState.users = new Map(state.users).set(id, newUser);
      newState.departments = new Map(state.departments);
      newState.usersByDepartment = new Map(state.usersByDepartment);
      newState.expensesByUser = new Map(state.expensesByUser).set(
        id,
        new Set()
      );

      const deptUsers =
        newState.usersByDepartment.get(departmentId) || new Set();
      deptUsers.add(id);
      newState.usersByDepartment.set(departmentId, deptUsers);

      const dept = newState.departments.get(departmentId);
      if (dept) {
        newState.departments.set(departmentId, {
          ...dept,
          userCount: dept.userCount + 1,
          updatedAt: new Date(),
        });
      }

      return newState;
    }

    case "UPDATE_USER": {
      const {
        id,
        firstName,
        lastName,
        departmentId: newDepartmentId,
      } = action.payload;
      const user = state.users.get(id);
      if (!user) return state;

      const newState = { ...state };
      newState.users = new Map(state.users);
      newState.departments = new Map(state.departments);
      newState.usersByDepartment = new Map(state.usersByDepartment);

      const oldDepartmentId = user.departmentId;

      // Update user
      newState.users.set(id, {
        ...user,
        firstName,
        lastName,
        departmentId: newDepartmentId,
        updatedAt: new Date(),
      });

      // Move user between departments if needed
      if (oldDepartmentId !== newDepartmentId) {
        const oldDeptUsers =
          newState.usersByDepartment.get(oldDepartmentId) || new Set();
        oldDeptUsers.delete(id);
        newState.usersByDepartment.set(oldDepartmentId, oldDeptUsers);

        const newDeptUsers =
          newState.usersByDepartment.get(newDepartmentId) || new Set();
        newDeptUsers.add(id);
        newState.usersByDepartment.set(newDepartmentId, newDeptUsers);

        // Update department counts
        const oldDept = newState.departments.get(oldDepartmentId);
        const newDept = newState.departments.get(newDepartmentId);

        if (oldDept) {
          newState.departments.set(oldDepartmentId, {
            ...oldDept,
            userCount: oldDept.userCount - 1,
            updatedAt: new Date(),
          });
        }
        if (newDept) {
          newState.departments.set(newDepartmentId, {
            ...newDept,
            userCount: newDept.userCount + 1,
            updatedAt: new Date(),
          });
        }
      }

      return newState;
    }

    case "DELETE_USER": {
      const { id } = action.payload;
      const user = state.users.get(id);
      if (!user) return state;

      const newState = { ...state };
      newState.users = new Map(state.users);
      newState.departments = new Map(state.departments);
      newState.usersByDepartment = new Map(state.usersByDepartment);
      newState.expenses = new Map(state.expenses);
      newState.expensesByUser = new Map(state.expensesByUser);

      // Delete all user expenses
      const userExpenses = state.expensesByUser.get(id) || new Set();
      userExpenses.forEach((expenseId) => {
        newState.expenses.delete(expenseId);
      });

      // Update department counts
      const dept = newState.departments.get(user.departmentId);
      if (dept) {
        newState.departments.set(user.departmentId, {
          ...dept,
          userCount: dept.userCount - 1,
          totalSpending: dept.totalSpending - user.totalSpending,
          updatedAt: new Date(),
        });
      }

      // Remove user from department
      const deptUsers =
        newState.usersByDepartment.get(user.departmentId) || new Set();
      deptUsers.delete(id);
      newState.usersByDepartment.set(user.departmentId, deptUsers);

      newState.users.delete(id);
      newState.expensesByUser.delete(id);

      return newState;
    }

    case "LOAD_MOCK_DATA":
      return generateMockData();

    case "RESET_DATA":
      return initialState;

    default:
      return state;
  }
}

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
