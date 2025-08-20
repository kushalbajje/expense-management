import { useCallback } from "react";
import { useAppContext } from "../context/AppContext";

export const useDepartments = () => {
  const { state, dispatch } = useAppContext();

  const createDepartment = useCallback(
    async (name: string) => {
      dispatch({
        type: "CREATE_DEPARTMENT",
        payload: { name },
      });
    },
    [dispatch]
  );

  const updateDepartment = useCallback(
    async (id: string, name: string) => {
      dispatch({
        type: "UPDATE_DEPARTMENT",
        payload: { id, name },
      });
    },
    [dispatch]
  );

  const deleteDepartment = useCallback(
    async (id: string, reassignTo?: string) => {
      dispatch({
        type: "DELETE_DEPARTMENT",
        payload: { id, reassignTo },
      });
    },
    [dispatch]
  );

  return {
    departments: state.departments,
    usersByDepartment: state.usersByDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
};
