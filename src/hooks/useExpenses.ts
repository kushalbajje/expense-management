import { useState, useMemo, useCallback, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import type { Expense, ExpenseCategory } from "../types/types";

interface UseExpensesOptions {
  pageSize?: number;
  searchTerm?: string;
}

export const useExpenses = (options: UseExpensesOptions = {}) => {
  const { state, dispatch } = useAppContext();
  const { pageSize = 1000, searchTerm = "" } = options;

  const [loadedPages, setLoadedPages] = useState(new Set([0]));

  // Filter expenses based on search term
  const filteredExpenseIds = useMemo(() => {
    const allIds = Array.from(state.expenses.keys());

    // Handle empty/whitespace search
    const trimmedSearch = searchTerm?.trim();
    if (!trimmedSearch) {
      return allIds;
    }

    const lowerSearchTerm = trimmedSearch.toLowerCase();

    return allIds.filter((id) => {
      const expense = state.expenses.get(id);
      if (!expense) return false;

      try {
        const user = state.users.get(expense.userId);
        const userName =
          user && user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`.toLowerCase()
            : "";

        // Safe string operations with null checks
        const description = expense.description?.toLowerCase() || "";
        const category = expense.category?.toLowerCase() || "";
        const costStr = expense.cost?.toString() || "";

        return (
          description.includes(lowerSearchTerm) ||
          category.includes(lowerSearchTerm) ||
          userName.includes(lowerSearchTerm) ||
          costStr.includes(trimmedSearch)
        );
      } catch (error) {
        console.warn("Error filtering expense:", id, error);
        return false;
      }
    });
  }, [state.expenses, state.users, searchTerm]);

  const paginatedExpenses = useMemo(() => {
    const expenses: Expense[] = [];
    const sortedPages = Array.from(loadedPages).sort((a, b) => a - b);

    for (const pageNum of sortedPages) {
      const startIdx = pageNum * pageSize;
      const endIdx = Math.min(startIdx + pageSize, filteredExpenseIds.length);

      for (let i = startIdx; i < endIdx; i++) {
        const expenseId = filteredExpenseIds[i];
        const expense = state.expenses.get(expenseId);
        if (expense) {
          expenses.push(expense);
        }
      }
    }

    return expenses;
  }, [filteredExpenseIds, loadedPages, pageSize, state.expenses]);

  const createExpense = useCallback(
    async (
      userId: string,
      category: ExpenseCategory,
      description: string,
      cost: number
    ) => {
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 1000 + 500) // Simulating network delay
      );
      dispatch({
        type: "CREATE_EXPENSE",
        payload: { userId, category, description, cost },
      });
    },
    [dispatch]
  );

  const updateExpense = useCallback(
    async (
      id: string,
      userId: string,
      category: ExpenseCategory,
      description: string,
      cost: number
    ) => {
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 1000 + 500)
      );
      dispatch({
        type: "UPDATE_EXPENSE",
        payload: { id, userId, category, description, cost },
      });
    },
    [dispatch]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 1000 + 500)
      );
      dispatch({
        type: "DELETE_EXPENSE",
        payload: { id },
      });
    },
    [dispatch]
  );

  const loadPage = useCallback((pageNum: number) => {
    setLoadedPages((prev) => new Set([...prev, pageNum]));
  }, []);

  const loadNextPage = useCallback(() => {
    const nextPage = Math.max(...Array.from(loadedPages)) + 1;
    const maxPage = Math.ceil(filteredExpenseIds.length / pageSize) - 1;

    if (nextPage <= maxPage) {
      loadPage(nextPage);
      return true;
    }
    return false;
  }, [loadedPages, filteredExpenseIds.length, pageSize, loadPage]);

  const resetPagination = useCallback(() => {
    setLoadedPages(new Set([0]));
  }, []);

  const totalPages = Math.ceil(filteredExpenseIds.length / pageSize);
  const totalExpenses = filteredExpenseIds.length;
  const hasNextPage = Math.max(...Array.from(loadedPages)) < totalPages - 1;
  const loadedExpenseCount = paginatedExpenses.length;

  useEffect(() => {
    resetPagination();
  }, [state.expenses.size, searchTerm, resetPagination]);

  const isSearching = !!searchTerm?.trim();
  const totalUnfilteredExpenses = state.expenses.size;

  return {
    // Raw data (for compatibility)
    expenses: state.expenses,
    users: state.users,
    expensesByUser: state.expensesByUser,

    // Paginated data
    paginatedExpenses,
    totalPages,
    totalExpenses,
    loadedExpenseCount,
    hasNextPage,
    pageSize,
    isInitialLoading: false,
    hasPrefetchedData: false,

    // Search indicators
    isSearching,
    totalUnfilteredExpenses,
    searchTerm: searchTerm?.trim() || "",

    // CRUD operations
    createExpense,
    updateExpense,
    deleteExpense,

    // Pagination operations
    loadNextPage,
    loadPage,
    resetPagination,
  };
};
