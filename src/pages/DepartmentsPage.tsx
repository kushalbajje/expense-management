import React, { useState, useRef, useEffect } from "react";
import { Plus, Edit2, Trash2, Users, DollarSign, Building } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useDepartments } from "../hooks/useDepartments";
import {
  Button,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../components/ui";
import { DepartmentModal } from "../components/modals/DepartmentModal";
import { DeleteConfirmModal } from "../components/modals/DeleteConfirmModal";
import { formatCurrency, formatNumber } from "../lib/utils";
import type { Department, DeleteTarget } from "../types/types";

export const DepartmentsPage: React.FC = () => {
  const { state } = useAppContext();
  const { departments, createDepartment, updateDepartment, deleteDepartment } =
    useDepartments();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [tableHeight, setTableHeight] = useState(400);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (tableContainerRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight;
        const headerHeight = 64; // Height of table header
        setTableHeight(containerHeight - headerHeight);
      }
    };

    // Initial calculation
    setTimeout(updateHeight, 100); // Allow for layout to settle

    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const handleCreate = () => {
    setEditingDepartment(null);
    setShowModal(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setShowModal(true);
  };

  const handleDelete = (department: Department) => {
    setDeleteTarget({
      type: "department",
      id: department.id,
      name: department.name,
    });
    setShowDeleteModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingDepartment(null);
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleSubmit = async (data: { name: string }) => {
    if (editingDepartment) {
      await updateDepartment(editingDepartment.id, data.name);
    } else {
      await createDepartment(data.name);
    }
    handleModalClose();
  };

  const handleConfirmDelete = async (reassignTo?: string) => {
    if (deleteTarget) {
      await deleteDepartment(deleteTarget.id, reassignTo);
      handleDeleteModalClose();
    }
  };

  const departmentList: Department[] = Array.from(departments.values());
  const totalDepartments = departmentList.length;
  const totalSpending = departmentList.reduce(
    (sum, dept) => sum + dept.totalSpending,
    0
  );
  const totalUsers = departmentList.reduce(
    (sum, dept) => sum + dept.userCount,
    0
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Department</h1>
            <p className="text-gray-600">
              Manage organizational departments and track spending
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Department
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Departments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(totalDepartments)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
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
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
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
      </div>

      {/* Departments Table */}
      <Card className="flex-1 flex flex-col min-h-0" ref={tableContainerRef}>
        <div className="flex-shrink-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Department Name</TableCell>
                <TableCell isHeader>Total Users</TableCell>
                <TableCell isHeader>Total Spending</TableCell>
                <TableCell isHeader>Created</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        {/* Scrollable Table Body */}
        <div
          className="flex-1 overflow-auto"
          style={{ maxHeight: tableHeight }}
        >
          <Table>
            <TableBody>
              {departmentList.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="text-center py-8 text-gray-500"
                    colSpan={5}
                  >
                    No departments found. Create your first department to get
                    started.
                  </TableCell>
                </TableRow>
              ) : (
                departmentList.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {department.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{formatNumber(department.userCount)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span>{formatCurrency(department.totalSpending)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-500">
                        {new Date(department.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(department)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit department"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(department)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete department"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modals */}
      <DepartmentModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        editingDepartment={editingDepartment}
        existingDepartments={departmentList}
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
