import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Button } from '../ui';
import { validateExpenseData } from '../../lib/utils';
import type { Expense, ExpenseCategory, User } from '../../types/types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { userId: string; category: ExpenseCategory; description: string; cost: number }) => Promise<void>;
  editingExpense: Expense | null;
  users: User[];
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Supplies', 'Software', 'Gas', 'Food', 'Other'];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingExpense,
  users,
}) => {
  const [userId, setUserId] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Supplies');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUserId(editingExpense?.userId || '');
      setCategory(editingExpense?.category || 'Supplies');
      setDescription(editingExpense?.description || '');
      setCost(editingExpense?.cost?.toString() || '');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, editingExpense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const costNumber = parseFloat(cost);
    const validationError = validateExpenseData(userId, description, costNumber);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ 
        userId, 
        category, 
        description: description.trim(), 
        cost: costNumber 
      });
      onClose();
    } catch (err) {
      setError('Failed to save expense. Please try again.' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = editingExpense ? 'Edit Expense' : 'Create Expense';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="User"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            setError(null);
          }}
          required
        >
          <option value="">Select a user</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </Select>

        <Select
          label="Category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as ExpenseCategory);
            setError(null);
          }}
          required
        >
          {EXPENSE_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>

        <Input
          label="Description"
          type="text"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setError(null);
          }}
          placeholder="Enter expense description"
          required
        />

        <Input
          label="Cost"
          type="number"
          step="0.01"
          min="0"
          value={cost}
          onChange={(e) => {
            setCost(e.target.value);
            setError(null);
          }}
          placeholder="0.00"
          required
        />

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
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (editingExpense ? 'Updating...' : 'Creating...') 
              : (editingExpense ? 'Update' : 'Create')
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
};