import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateId = (): string => {
  return nanoid();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};


export const validateDepartmentName = (
  name: string,
  existingNames: string[],
  currentName?: string
): string | null => {
  const sanitizedName = name.trim();
  if (!sanitizedName) {
    return "Department name is required";
  }

  if (sanitizedName.length < 2) {
    return "Department name must be atleast 2 characters";
  }

  const normalizedName = sanitizedName.toLowerCase();
  const normalizedExistingNames = existingNames.map((n) => n.toLowerCase());
  const normalizedCurrent = currentName?.toLocaleLowerCase();

  if (
    normalizedExistingNames.includes(normalizedName) &&
    normalizedName !== normalizedCurrent
  ) {
    return "Department name must be unique";
  }

  return null;
};

export const validateUserData = (firstName: string, lastName: string, departmentId: string): string | null => {
  if (!firstName.trim()) {
    return 'First name is required';
  }
  
  if (!lastName.trim()) {
    return 'Last name is required';
  }
  
  if (!departmentId) {
    return 'Department selection is required';
  }
  
  if (firstName.trim().length < 2 || lastName.trim().length < 2) {
    return 'Names must be at least 2 characters';
  }
  
  return null;
};
