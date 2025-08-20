import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import type { ExpenseCategory } from '../types/types';

export const useExpenses = () => {
  const { state, dispatch } = useAppContext();

  const createExpense = useCallback(async (userId: string, category: ExpenseCategory, description: string, cost: number) => {
    dispatch({
      type: 'CREATE_EXPENSE',
      payload: { userId, category, description, cost },
    });
  }, [dispatch]);

  const updateExpense = useCallback(async (id: string, userId: string, category: ExpenseCategory, description: string, cost: number) => {
    dispatch({
      type: 'UPDATE_EXPENSE',
      payload: { id, userId, category, description, cost },
    });
  }, [dispatch]);

  const deleteExpense = useCallback(async (id: string) => {
    dispatch({
      type: 'DELETE_EXPENSE',
      payload: { id },
    });
  }, [dispatch]);

  return {
    expenses: state.expenses,
    users: state.users,
    expensesByUser: state.expensesByUser,
    createExpense,
    updateExpense,
    deleteExpense,
  };
};