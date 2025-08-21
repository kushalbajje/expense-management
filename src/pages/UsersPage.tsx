import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  User,
  Building,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { FixedSizeList as List } from "react-window";
import { useAppContext } from "../context/AppContext";
import { useUsers } from "../hooks/useUsers";
import { Button, Card, StatsSection } from "../components/ui";
import { SearchBar } from "../components/ui/SearchBar";
import type { StatItem } from "../components/ui";
import { UserModal } from "../components/modals/UserModal";
import { DeleteConfirmModal } from "../components/modals/DeleteConfirmModal";
import { formatCurrency, formatNumber } from "../lib/utils";
import type { User as UserType, DeleteTarget } from "../types/types";

const ITEM_HEIGHT = 60;
const MAX_LIST_HEIGHT = 400;
const MIN_LIST_HEIGHT = 120;
interface UserRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    users: UserType[];
    departments: Map<string, { name: string }>;
    onEdit: (user: UserType) => void;
    onDelete: (user: UserType) => void;
  };
}

const UserRow: React.FC<UserRowProps> = ({ index, style, data }) => {
  const { users, departments, onEdit, onDelete } = data;
  const user = users[index];
  const department = departments.get(user.departmentId);

  return (
    <div
      style={style}
      className="grid grid-cols-6 gap-4 p-4 border-b hover:bg-gray-50"
    >
      <div className="flex items-center">
        <span className="text-sm text-gray-500 font-mono">#{index + 1}</span>
      </div>
      <div className="flex items-center">
        {user.firstName} {user.lastName}
      </div>
      <div className="flex items-center">{department?.name || "Unknown"}</div>
      <div className="flex items-center">
        {formatCurrency(user.totalSpending)}
      </div>
      <div className="flex items-center">{formatNumber(user.expenseCount)}</div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(user)}
         className="p-1 text-black hover:bg-gray-300 rounded"
          title="Edit user"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(user)}
         className="p-1 text-black hover:bg-gray-300 rounded"
          title="Delete user"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const UsersPage: React.FC = () => {
  const { state } = useAppContext();
  const [searchInput, setSearchInput] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const { filteredUsers, isSearching, createUser, updateUser, deleteUser } =
    useUsers({ searchTerm: activeSearchTerm });

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [listHeight, setListHeight] = useState(MAX_LIST_HEIGHT);

  const listContainerRef = useRef<HTMLDivElement>(null);

  const handleSearch = async () => {
    const trimmed = searchInput.trim();
    if (trimmed === activeSearchTerm) return;
    
    setIsSearchLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setActiveSearchTerm(trimmed);
    setIsSearchLoading(false);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearchTerm("");
    setIsSearchLoading(false);
  };

  const userList = useMemo(
    () => Array.from(filteredUsers.values()),
    [filteredUsers]
  );
  const departmentList = Array.from(state.departments.values());

  useEffect(() => {
    const updateHeight = () => {
      // Calculate height based on number of items
      const itemCount = userList.length;
      if (itemCount === 0) {
        setListHeight(MIN_LIST_HEIGHT);
        return;
      }

      if (itemCount * ITEM_HEIGHT > MAX_LIST_HEIGHT) {
        setListHeight(MAX_LIST_HEIGHT);
        return;
      }

      const calculatedHeight = itemCount * ITEM_HEIGHT + 20;
      setListHeight(Math.max(MIN_LIST_HEIGHT, calculatedHeight));
    };

    // Use setTimeout to ensure DOM updates are complete
    const timeoutId = setTimeout(updateHeight, 0);

    window.addEventListener("resize", updateHeight);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateHeight);
    };
  }, [userList.length, activeSearchTerm]);

  const totalUsers = userList.length;
  const totalSpending = userList.reduce(
    (sum, user) => sum + user.totalSpending,
    0
  );
  const totalExpenses = userList.reduce(
    (sum, user) => sum + user.expenseCount,
    0
  );

  const statsData: StatItem[] = [
    {
      icon: User,
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-100",
      label: "Total Users",
      value: totalUsers,
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
      icon: Building,
      iconColor: "text-purple-600",
      iconBgColor: "bg-purple-100",
      label: "Total Expenses",
      value: totalExpenses,
      formatType: "number",
    },
  ];

  const handleCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = (user: UserType) => {
    setDeleteTarget({
      type: "user",
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
    });
    setShowDeleteModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleSubmit = async (data: {
    firstName: string;
    lastName: string;
    departmentId: string;
  }) => {
    if (editingUser) {
      await updateUser(
        editingUser.id,
        data.firstName,
        data.lastName,
        data.departmentId
      );
    } else {
      await createUser(data.firstName, data.lastName, data.departmentId);
    }
    handleModalClose();
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteUser(deleteTarget.id);
      handleDeleteModalClose();
    }
  };

  if (departmentList.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">
              Manage organizational users and track their expenses
            </p>
          </div>
        </div>
        <StatsSection stats={statsData} />
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Departments Found
          </h3>
          <p className="text-gray-600 mb-4">
            You must create at least one Department before you can manage users.
          </p>
        </Card>
      </div>
    );
  }

  const itemData = {
    users: userList,
    departments: state.departments,
    onEdit: handleEdit,
    onDelete: handleDelete,
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">
            Manage organizational users and track their expenses
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onSearch={handleSearch}
            onClear={handleClearSearch}
            placeholder="Search users, departments"
            isSearching={isSearching}
            isLoading={isSearchLoading}
            className="w-72"
          />
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </div>
      </div>
      <StatsSection stats={statsData} />
      <Card className="border rounded flex flex-col" ref={listContainerRef}>
        <div className="grid grid-cols-6 gap-4 p-4 border-b bg-gray-50 font-medium flex-shrink-0">
          <div>#</div>
          <div>Name</div>
          <div>Department</div>
          <div>Spending</div>
          <div>Expenses</div>
          <div>Actions</div>
        </div>

        {isSearchLoading ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <span>Searching users...</span>
            </div>
          </div>
        ) : userList.length === 0 ? (
          <div className="p-8 text-center">
            {isSearching ? (
              <div>
                <p>No users found matching "{activeSearchTerm}"</p>
                <p className="text-sm mt-2">Try adjusting your search terms or <button 
                  onClick={handleClearSearch}
                  className="text-blue-600 hover:underline"
                >clear the search</button></p>
              </div>
            ) : (
              <p>No users found</p>
            )}
          </div>
        ) : (
          <List
            height={listHeight}
            width="100%"
            itemCount={userList.length}
            itemSize={ITEM_HEIGHT}
            itemData={itemData}
          >
            {UserRow}
          </List>
        )}
      </Card>

      <UserModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        editingUser={editingUser}
        departments={departmentList}
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
