import React, { useState, useEffect } from "react";
import { Modal, Input, Select, Button } from "../ui";
import { validateUserData } from "../../lib/utils";
import type { User, Department } from "../../types/types";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    departmentId: string;
  }) => Promise<void>;
  editingUser: User | null;
  departments: Department[];
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingUser,
  departments,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFirstName(editingUser?.firstName || "");
      setLastName(editingUser?.lastName || "");
      setDepartmentId(editingUser?.departmentId || "");
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, editingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateUserData(firstName, lastName, departmentId);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        departmentId,
      });
      onClose();
    } catch (err) {
      setError("Failed to save user. Please try again." + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = editingUser ? "Edit User" : "Create User";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setError(null);
            }}
            placeholder="Enter first name"
            autoFocus
            required
          />

          <Input
            label="Last Name"
            type="text"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setError(null);
            }}
            placeholder="Enter last name"
            required
          />
        </div>

        <Select
          label="Department"
          value={departmentId}
          onChange={(e) => {
            setDepartmentId(e.target.value);
            setError(null);
          }}
          required
        >
          <option value="">Select a department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name} ({dept.userCount} users)
            </option>
          ))}
        </Select>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? editingUser
                ? "Updating..."
                : "Creating..."
              : editingUser
              ? "Update"
              : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
