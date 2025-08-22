import { useCallback, useMemo } from "react";
import { useAppContext } from "../context/AppContext";

interface UseDepartmentsOptions {
  searchTerm?: string;
}

export const useDepartments = (options: UseDepartmentsOptions = {}) => {
  const { state, dispatch } = useAppContext();
  const { searchTerm = '' } = options;

  const createDepartment = useCallback(
    async (name: string) => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      dispatch({
        type: "CREATE_DEPARTMENT",
        payload: { name },
      });
    },
    [dispatch]
  );

  const updateDepartment = useCallback(
    async (id: string, name: string) => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      dispatch({
        type: "UPDATE_DEPARTMENT",
        payload: { id, name },
      });
    },
    [dispatch]
  );

  const deleteDepartment = useCallback(
    async (id: string, reassignTo?: string) => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      dispatch({
        type: "DELETE_DEPARTMENT",
        payload: { id, reassignTo },
      });
    },
    [dispatch]
  );

  // Filter departments based on search term
  const filteredDepartments = useMemo(() => {
    const trimmedSearch = searchTerm?.trim();
    if (!trimmedSearch) {
      return state.departments;
    }
    
    const lowerSearchTerm = trimmedSearch.toLowerCase();
    const filtered = new Map();
    
    for (const [id, department] of state.departments) {
      try {
        const name = department.name?.toLowerCase() || '';
        if (name.includes(lowerSearchTerm)) {
          filtered.set(id, department);
        }
      } catch (error) {
        console.warn('Error filtering department:', id, error);
      }
    }
    
    return filtered;
  }, [state.departments, searchTerm]);

  const isSearching = !!searchTerm?.trim();

  return {
    departments: state.departments,
    filteredDepartments,
    usersByDepartment: state.usersByDepartment,
    isSearching,
    searchTerm: searchTerm?.trim() || '',
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
};
