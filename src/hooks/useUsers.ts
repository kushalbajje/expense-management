import { useCallback } from "react";
import { useAppContext } from "../context/AppContext";

export const useUsers = () => {
  const { state, dispatch } = useAppContext();

  const createUser = useCallback(
    async (firstName: string, lastName: string, departmentId: string) => {
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
      dispatch({
        type: "UPDATE_USER",
        payload: { id, firstName, lastName, departmentId },
      });
    },
    [dispatch]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      dispatch({
        type: "DELETE_USER",
        payload: { id },
      });
    },
    [dispatch]
  );

  return {
    users: state.users,
    departments: state.departments,
    expensesByUser: state.expensesByUser,
    createUser,
    updateUser,
    deleteUser,
  };
};
