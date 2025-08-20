import React, { useState, useEffect } from 'react';
import { Modal, Select, Button } from '../ui';
import type { DeleteTarget, AppState } from '../../types/types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reassignTo?: string) => Promise<void>;
  deleteTarget: DeleteTarget | null;
  state: AppState;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  deleteTarget,
  state,
}) => {
  const [reassignTo, setReassignTo] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReassignTo('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(reassignTo || undefined);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!deleteTarget) return null;

  const isDepartment = deleteTarget.type === 'department';
  const hasUsers = isDepartment && (state.usersByDepartment.get(deleteTarget.id)?.size || 0) > 0;
  const userCount = hasUsers ? state.usersByDepartment.get(deleteTarget.id)?.size : 0;
  
  const otherDepartments = isDepartment 
    ? Array.from(state.departments.values()).filter(d => d.id !== deleteTarget.id)
    : [];

  const canDelete = !hasUsers || reassignTo;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete">
      <div className="space-y-4">
        <p>Delete "{deleteTarget.name}"?</p>
        
        {hasUsers && (
          <div className="space-y-2">
            <p className="text-sm">
              {userCount} user{userCount !== 1 ? 's' : ''} need reassignment:
            </p>
            <Select
              value={reassignTo}
              onChange={(e) => setReassignTo(e.target.value)}
              required
            >
              <option value="">Select department</option>
              {otherDepartments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        {deleteTarget.type === 'user' && (
          <p className="text-sm">Expenses will also be deleted.</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={!canDelete || isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};