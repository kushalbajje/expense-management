import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { AppState, AppAction, Department } from "../types/types";
import { generateId } from "../lib/utils";

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
