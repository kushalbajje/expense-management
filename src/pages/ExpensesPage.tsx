import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Receipt,
  DollarSign,
  User,
  AlertCircle,
} from "lucide-react";
import { FixedSizeList as List } from "react-window";
import { useAppContext } from "../context/AppContext";
import { useExpenses } from "../hooks/useExpenses";
import { Button, Card, StatsSection } from "../components/ui";
import type { StatItem } from "../components/ui";
import { ExpenseModal } from "../components/modals/ExpenseModal";
import { DeleteConfirmModal } from "../components/modals/DeleteConfirmModal";
import { formatCurrency, formatDate } from "../lib/utils";
import type { Expense, ExpenseCategory, DeleteTarget } from "../types/types";

const ITEM_HEIGHT = 80;
const MAX_LIST_HEIGHT = 400;
const MIN_LIST_HEIGHT = 120;

interface ExpenseRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    expenses: Expense[];
    users: Map<string, { firstName: string; lastName: string }>;
    onEdit: (expense: Expense) => void;
    onDelete: (expense: Expense) => void;
  };
}

const ExpenseRow: React.FC<ExpenseRowProps> = ({ index, style, data }) => {
  const { expenses, users, onEdit, onDelete } = data;
  const expense = expenses[index];
  const user = users.get(expense.userId);

  return (
    <div
      style={style}
      className="grid grid-cols-6 gap-4 p-4 border-b hover:bg-gray-50"
    >
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-gray-400" />
        <span className="font-medium">
          {user ? `${user.firstName} ${user.lastName}` : "Unknown User"}
        </span>
      </div>
      <div className="flex items-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {expense.category}
        </span>
      </div>
      <div className="flex items-center">
        <div className="max-w-xs truncate" title={expense.description}>
          {expense.description}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <DollarSign className="w-4 h-4 text-gray-400" />
        <span className="font-medium">{formatCurrency(expense.cost)}</span>
      </div>
      <div className="flex items-center">
        <span className="text-gray-500">{formatDate(expense.createdAt)}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(expense)}
          className="p-1 hover:bg-gray-100 rounded"
          title="Edit expense"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(expense)}
          className="p-1 hover:bg-gray-100 rounded"
          title="Delete expense"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const ExpensesPage: React.FC = () => {
  const { state } = useAppContext();
  const { expenses, createExpense, updateExpense, deleteExpense } =
    useExpenses();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [listHeight, setListHeight] = useState(MAX_LIST_HEIGHT);

  const listContainerRef = useRef<HTMLDivElement>(null);

  const handleCreate = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleDelete = (expense: Expense) => {
    const user = state.users.get(expense.userId);
    setDeleteTarget({
      type: "expense",
      id: expense.id,
      name: `${expense.description} (${
        user ? `${user.firstName} ${user.lastName}` : "Unknown User"
      })`,
    });
    setShowDeleteModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingExpense(null);
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleSubmit = async (data: {
    userId: string;
    category: ExpenseCategory;
    description: string;
    cost: number;
  }) => {
    if (editingExpense) {
      await updateExpense(
        editingExpense.id,
        data.userId,
        data.category,
        data.description,
        data.cost
      );
    } else {
      await createExpense(
        data.userId,
        data.category,
        data.description,
        data.cost
      );
    }
    handleModalClose();
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteExpense(deleteTarget.id);
      handleDeleteModalClose();
    }
  };

  const expenseList = useMemo(
    () =>
      Array.from(expenses.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [expenses]
  );
  const userList = Array.from(state.users.values());
  const hasUsers = userList.length > 0;

  useEffect(() => {
    const updateHeight = () => {
      // Calculate height based on number of items
      const itemCount = expenseList.length;
      const headerHeight = 60;

      if (itemCount === 0) {
        setListHeight(MIN_LIST_HEIGHT);
        return;
      }

      // Calculate ideal height based on items (with some padding)
      const calculatedHeight = itemCount * ITEM_HEIGHT + 20; // 20px for padding

      // Use container height if available, otherwise use calculated height
      if (listContainerRef.current) {
        const containerHeight = listContainerRef.current.clientHeight;
        const availableHeight = containerHeight - headerHeight;

        // Use the smaller of available space or calculated height, but respect min/max
        const idealHeight = Math.min(calculatedHeight, availableHeight);
        setListHeight(
          Math.max(MIN_LIST_HEIGHT, Math.min(MAX_LIST_HEIGHT, idealHeight))
        );
      } else {
        // Fallback when container ref is not available
        setListHeight(
          Math.max(MIN_LIST_HEIGHT, Math.min(MAX_LIST_HEIGHT, calculatedHeight))
        );
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [expenseList.length]); // Depend on expense list length to recalculate when items change

  const totalExpenses = expenseList.length;
  const totalSpending = expenseList.reduce(
    (sum, expense) => sum + expense.cost,
    0
  );
  const averageExpense = totalExpenses > 0 ? totalSpending / totalExpenses : 0;

  const statsData: StatItem[] = [
    {
      icon: Receipt,
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-100",
      label: "Total Expenses",
      value: totalExpenses,
      formatType: "number",
    },
    {
      icon: DollarSign,
      iconColor: "text-green-600",
      iconBgColor: "bg-green-100",
      label: "Total Spending",
      value: totalSpending,
      formatType: "currency",
    },
    {
      icon: DollarSign,
      iconColor: "text-purple-600",
      iconBgColor: "bg-purple-100",
      label: "Average Expense",
      value: averageExpense,
      formatType: "currency",
    },
  ];

  // Check if no users exist
  if (!hasUsers) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
            <p className="text-gray-600">
              Manage and track organizational expenses
            </p>
          </div>
        </div>
        <StatsSection stats={statsData} />
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Users Found
          </h3>
          <p className="text-gray-600 mb-4">
            You must create at least one user before you can manage expenses.
          </p>
          <Button onClick={() => (window.location.href = "/users")}>
            Go to User Management
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Expense Management
            </h1>
            <p className="text-gray-600">
              Manage and track organizational expenses
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsSection stats={statsData} />

      {/* Expenses Table */}
      <Card className="border rounded flex flex-col" ref={listContainerRef}>
        <div className="grid grid-cols-6 gap-4 p-4 border-b bg-gray-50 font-medium flex-shrink-0">
          <div>User</div>
          <div>Category</div>
          <div>Description</div>
          <div>Cost</div>
          <div>Date</div>
          <div>Actions</div>
        </div>

        {expenseList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No expenses found. Create your first expense to get started.
          </div>
        ) : (
          <List
            height={listHeight}
            width="100%"
            itemCount={expenseList.length}
            itemSize={ITEM_HEIGHT}
            itemData={{
              expenses: expenseList,
              users: state.users,
              onEdit: handleEdit,
              onDelete: handleDelete,
            }}
          >
            {ExpenseRow}
          </List>
        )}
      </Card>

      {/* Modals */}
      <ExpenseModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        editingExpense={editingExpense}
        users={userList}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteModalClose}
        onConfirm={handleConfirmDelete}
        deleteTarget={deleteTarget}
        state={state}
      />
    </div>
  );
};
