import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Expense } from '../types/types';

interface UseSimpleExpensesOptions {
  pageSize?: number;
}

export const useSimpleExpenses = (options: UseSimpleExpensesOptions = {}) => {
  const { state } = useAppContext();
  const { pageSize = 1000 } = options;
  
  const [loadedPages, setLoadedPages] = useState(new Set([0]));

  // Simply use Map values in insertion order - NO SORTING!
  const allExpenseIds = useMemo(() => {
    return Array.from(state.expenses.keys());
  }, [state.expenses]);

  // Get expenses for currently loaded pages
  const paginatedExpenses = useMemo(() => {
    const expenses: Expense[] = [];
    const sortedPages = Array.from(loadedPages).sort((a, b) => a - b);
    
    for (const pageNum of sortedPages) {
      const startIdx = pageNum * pageSize;
      const endIdx = Math.min(startIdx + pageSize, allExpenseIds.length);
      
      for (let i = startIdx; i < endIdx; i++) {
        const expenseId = allExpenseIds[i];
        const expense = state.expenses.get(expenseId);
        if (expense) {
          expenses.push(expense);
        }
      }
    }
    
    return expenses;
  }, [allExpenseIds, loadedPages, pageSize, state.expenses]);

  const loadPage = useCallback((pageNum: number) => {
    setLoadedPages(prev => new Set([...prev, pageNum]));
  }, []);

  const loadNextPage = useCallback(() => {
    const nextPage = Math.max(...Array.from(loadedPages)) + 1;
    const maxPage = Math.ceil(allExpenseIds.length / pageSize) - 1;
    
    if (nextPage <= maxPage) {
      loadPage(nextPage);
      return true;
    }
    return false;
  }, [loadedPages, allExpenseIds.length, pageSize, loadPage]);

  const resetPagination = useCallback(() => {
    setLoadedPages(new Set([0]));
  }, []);

  const totalPages = Math.ceil(allExpenseIds.length / pageSize);
  const totalExpenses = allExpenseIds.length;
  const hasNextPage = Math.max(...Array.from(loadedPages)) < totalPages - 1;
  const loadedExpenseCount = paginatedExpenses.length;

  // Reset pagination when data changes
  useEffect(() => {
    resetPagination();
  }, [state.expenses.size, resetPagination]);

  return {
    expenses: paginatedExpenses,
    totalPages,
    totalExpenses,
    loadedExpenseCount,
    hasNextPage,
    loadNextPage,
    loadPage,
    resetPagination,
    pageSize,
    isInitialLoading: false, // Never loading since no sorting!
    hasPrefetchedData: false, // Not needed anymore
  };
};