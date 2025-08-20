import React, { useState, useMemo, useRef, useEffect } from "react";
import { Plus, Edit2, Trash2, DollarSign, User, Building } from "lucide-react";
import { FixedSizeList as List } from "react-window";
import { useAppContext } from "../context/AppContext";
import { useUsers } from "../hooks/useUsers";
import { Button, Card } from "../components/ui";
import { UserModal } from "../components/modals/UserModal";
import { DeleteConfirmModal } from "../components/modals/DeleteConfirmModal";
import { formatCurrency, formatNumber } from "../lib/utils";
import type { User as UserType, DeleteTarget } from "../types/types";

const ITEM_HEIGHT = 60;
const LIST_HEIGHT = 400;
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
      className="grid grid-cols-5 gap-4 p-4 border-b hover:bg-gray-50"
    >
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
          className="p-1 hover:bg-gray-100 rounded"
          title="Edit user"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(user)}
          className="p-1 hover:bg-gray-100 rounded"
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
  const { users, createUser, updateUser, deleteUser } = useUsers();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [listHeight, setListHeight] = useState(LIST_HEIGHT);

  const listContainerRef = useRef<HTMLDivElement>(null);

  const userList = useMemo(() => Array.from(users.values()), [users]);
  const departmentList = Array.from(state.departments.values());

  useEffect(() => {
    const updateHeight = () => {
      if (listContainerRef.current) {
        const containerHeight = listContainerRef.current.clientHeight;
        const headerHeight = 60;
        setListHeight(containerHeight - headerHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const totalUsers = userList.length;
  const totalSpending = userList.reduce(
    (sum, user) => sum + user.totalSpending,
    0
  );
  const totalExpenses = userList.reduce(
    (sum, user) => sum + user.expenseCount,
    0
  );

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
        <h1 className="text-2xl font-medium">Users</h1>
        <div className="border rounded p-8 text-center">
          <p className="mb-4">
            No departments available. Create departments first.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
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
          <h1 className="text-3xl font-bold text-gray-900">User</h1>
          <p className="text-gray-600">
            Manage organizational users and track their expenses
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(totalUsers)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Spending
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalSpending)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(totalExpenses)}
              </p>
            </div>
          </div>
        </Card>
      </div>
      <Card
        className="border rounded flex-1 flex flex-col min-h-0"
        ref={listContainerRef}
      >
        <div className="grid grid-cols-5 gap-4 p-4 border-b bg-gray-50 font-medium flex-shrink-0">
          <div>Name</div>
          <div>Department</div>
          <div>Spending</div>
          <div>Expenses</div>
          <div>Actions</div>
        </div>

        {userList.length === 0 ? (
          <div className="p-8 text-center">No users found</div>
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
