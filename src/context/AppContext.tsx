/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { AppState, AppAction, Department, User, Expense } from "../types/types";
import { generateId } from "../lib/utils";
import { generateMockData } from "../data/mockData";

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  isLoading: boolean;
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

     case 'CREATE_EXPENSE': {
      const { userId, category, description, cost } = action.payload;
      const id = generateId();
      const now = new Date();
      const newExpense: Expense = {
        id,
        userId,
        category,
        description,
        cost,
        createdAt: now,
        updatedAt: now,
      };

      const newState = { ...state };
      newState.expenses = new Map(state.expenses).set(id, newExpense);
      newState.users = new Map(state.users);
      newState.departments = new Map(state.departments);
      newState.expensesByUser = new Map(state.expensesByUser);
      
      const userExpenses = newState.expensesByUser.get(userId) || new Set();
      userExpenses.add(id);
      newState.expensesByUser.set(userId, userExpenses);
      
      const user = newState.users.get(userId);
      if (user) {
        newState.users.set(userId, {
          ...user,
          totalSpending: user.totalSpending + cost,
          expenseCount: user.expenseCount + 1,
          updatedAt: now,
        });
        
        const dept = newState.departments.get(user.departmentId);
        if (dept) {
          newState.departments.set(user.departmentId, {
            ...dept,
            totalSpending: dept.totalSpending + cost,
            updatedAt: now,
          });
        }
      }
      
      return newState;
    }

    case 'UPDATE_EXPENSE': {
      const { id, userId, category, description, cost } = action.payload;
      const oldExpense = state.expenses.get(id);
      if (!oldExpense) return state;

      const newState = { ...state };
      newState.expenses = new Map(state.expenses);
      newState.users = new Map(state.users);
      newState.departments = new Map(state.departments);
      newState.expensesByUser = new Map(state.expensesByUser);
      
      const oldUser = newState.users.get(oldExpense.userId);
      const newUser = newState.users.get(userId);
      
      if (!newUser) return state;
      
      const now = new Date();
      
      // Update expense
      newState.expenses.set(id, { 
        ...oldExpense, 
        userId, 
        category, 
        description, 
        cost,
        updatedAt: now,
      });
      
      // If user changed, move expense
      if (oldExpense.userId !== userId && oldUser) {
        const oldUserExpenses = newState.expensesByUser.get(oldExpense.userId) || new Set();
        oldUserExpenses.delete(id);
        newState.expensesByUser.set(oldExpense.userId, oldUserExpenses);
        
        const newUserExpenses = newState.expensesByUser.get(userId) || new Set();
        newUserExpenses.add(id);
        newState.expensesByUser.set(userId, newUserExpenses);
        
        // Update old user totals
        newState.users.set(oldExpense.userId, {
          ...oldUser,
          totalSpending: oldUser.totalSpending - oldExpense.cost,
          expenseCount: oldUser.expenseCount - 1,
          updatedAt: now,
        });
        
        // Update old department totals
        const oldDept = newState.departments.get(oldUser.departmentId);
        if (oldDept) {
          newState.departments.set(oldUser.departmentId, {
            ...oldDept,
            totalSpending: oldDept.totalSpending - oldExpense.cost,
            updatedAt: now,
          });
        }
      }
      
      // Update new user totals
      const costDiff = cost - (oldExpense.userId === userId ? oldExpense.cost : 0);
      const countDiff = oldExpense.userId === userId ? 0 : 1;
      
      newState.users.set(userId, {
        ...newUser,
        totalSpending: newUser.totalSpending + costDiff,
        expenseCount: newUser.expenseCount + countDiff,
        updatedAt: now,
      });
      
      // Update new department totals
      const newDept = newState.departments.get(newUser.departmentId);
      if (newDept) {
        newState.departments.set(newUser.departmentId, {
          ...newDept,
          totalSpending: newDept.totalSpending + costDiff,
          updatedAt: now,
        });
      }
      
      return newState;
    }

    case 'DELETE_EXPENSE': {
      const { id } = action.payload;
      const expense = state.expenses.get(id);
      if (!expense) return state;

      const newState = { ...state };
      newState.expenses = new Map(state.expenses);
      newState.users = new Map(state.users);
      newState.departments = new Map(state.departments);
      newState.expensesByUser = new Map(state.expensesByUser);
      
      const user = newState.users.get(expense.userId);
      const now = new Date();
      
      if (user) {
        newState.users.set(expense.userId, {
          ...user,
          totalSpending: user.totalSpending - expense.cost,
          expenseCount: user.expenseCount - 1,
          updatedAt: now,
        });
        
        const dept = newState.departments.get(user.departmentId);
        if (dept) {
          newState.departments.set(user.departmentId, {
            ...dept,
            totalSpending: dept.totalSpending - expense.cost,
            updatedAt: now,
          });
        }
      }
      
      const userExpenses = newState.expensesByUser.get(expense.userId) || new Set();
      userExpenses.delete(id);
      newState.expensesByUser.set(expense.userId, userExpenses);
      
      newState.expenses.delete(id);
      
      return newState;
    }


    case "LOAD_MOCK_DATA":
      return action.payload || state;

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
  const [isLoading, setIsLoading] = React.useState(false);

  const loadMockData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const mockData = await generateMockData();
      dispatch({ type: "LOAD_MOCK_DATA", payload: mockData });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const enhancedDispatch = React.useCallback(async (action: AppAction | (() => Promise<void>)) => {
    if (typeof action === 'function') {
      await action();
    } else if (action.type === 'LOAD_MOCK_DATA' && !action.payload) {
      await loadMockData();
    } else {
      dispatch(action);
    }
  }, [loadMockData]);

  return (
    <AppContext.Provider value={{ state, dispatch: enhancedDispatch, isLoading }}>
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
