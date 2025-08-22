import { useCallback, useMemo } from "react";
import { useAppContext } from "../context/AppContext";

interface UseUsersOptions {
  searchTerm?: string;
}

export const useUsers = (options: UseUsersOptions = {}) => {
  const { state, dispatch } = useAppContext();
  const { searchTerm = '' } = options;

  const createUser = useCallback(
    async (firstName: string, lastName: string, departmentId: string) => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      dispatch({
        type: "CREATE_USER",
        payload: { firstName, lastName, departmentId },
      });
    },
    [dispatch]
  );

  const updateUser = useCallback(
    async (
      id: string,
      firstName: string,
      lastName: string,
      departmentId: string
    ) => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      dispatch({
        type: "UPDATE_USER",
        payload: { id, firstName, lastName, departmentId },
      });
    },
    [dispatch]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      dispatch({
        type: "DELETE_USER",
        payload: { id },
      });
    },
    [dispatch]
  );

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    const trimmedSearch = searchTerm?.trim();
    if (!trimmedSearch) {
      return state.users;
    }
    
    const lowerSearchTerm = trimmedSearch.toLowerCase();
    const filtered = new Map();
    
    for (const [id, user] of state.users) {
      try {
        const firstName = user.firstName?.toLowerCase() || '';
        const lastName = user.lastName?.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        const department = state.departments.get(user.departmentId);
        const departmentName = department?.name?.toLowerCase() || '';
        
        if (
          fullName.includes(lowerSearchTerm) ||
          firstName.includes(lowerSearchTerm) ||
          lastName.includes(lowerSearchTerm) ||
          departmentName.includes(lowerSearchTerm)
        ) {
          filtered.set(id, user);
        }
      } catch (error) {
        console.warn('Error filtering user:', id, error);
      }
    }
    
    return filtered;
  }, [state.users, state.departments, searchTerm]);

  const isSearching = !!searchTerm?.trim();

  return {
    users: state.users,
    filteredUsers,
    departments: state.departments,
    expensesByUser: state.expensesByUser,
    isSearching,
    searchTerm: searchTerm?.trim() || '',
    createUser,
    updateUser,
    deleteUser,
  };
};
