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
  StatsSection,
} from "../components/ui";
import type { StatItem } from "../components/ui";
import { DepartmentModal } from "../components/modals/DepartmentModal";
import { DeleteConfirmModal } from "../components/modals/DeleteConfirmModal";
import { formatCurrency, formatNumber } from "../lib/utils";
import type { Department, DeleteTarget } from "../types/types";
import { AlertCircle } from "lucide-react";
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
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, data.name);
      } else {
        await createDepartment(data.name);
      }
      handleModalClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
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

  const statsData: StatItem[] = [
    {
      icon: Building,
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-100",
      label: "Total Departments",
      value: totalDepartments,
      formatType: "number",
    },
    {
      icon: Users,
      iconColor: "text-green-600",
      iconBgColor: "bg-green-100",
      label: "Total Users",
      value: totalUsers,
      formatType: "number",
    },
    {
      icon: DollarSign,
      iconColor: "text-yellow-600",
      iconBgColor: "bg-yellow-100",
      label: "Total Spending",
      value: totalSpending,
      formatType: "currency",
    },
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
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
      <StatsSection stats={statsData} />

      {/* Departments Table */}

      {departmentList.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Get Started with Departments
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first department to begin organizing and tracking
            expenses across your organization.
          </p>
        </Card>
      ) : (
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
                {departmentList.map((department) => (
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
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Edit department"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(department)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Delete department"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

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
