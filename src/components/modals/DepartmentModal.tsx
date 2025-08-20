import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../ui';
import { validateDepartmentName } from '../../lib/utils';
import type { Department } from '../../types/types';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => Promise<void>;
  editingDepartment: Department | null;
  existingDepartments: Department[];
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingDepartment,
  existingDepartments,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(editingDepartment?.name || '');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, editingDepartment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const existingNames = existingDepartments.map(d => d.name);
    const currentName = editingDepartment?.name;
    
    const validationError = validateDepartmentName(name, existingNames, currentName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim() });
      onClose();
    } catch (err) {
      setError('Failed to save department. Please try again.' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = editingDepartment ? 'Edit Department' : 'Create Department';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Department Name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          error={error || undefined}
          placeholder="Enter department name"
          autoFocus
          required
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (editingDepartment ? 'Updating...' : 'Creating...') 
              : (editingDepartment ? 'Update' : 'Create')
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
};