import React from "react";

// Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      {children}
    </div>
  );
};

// Table Components
interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = "" }) => {
  return (
    <div className="overflow-hidden">
      <table className={`w-full ${className}`}>{children}</table>
    </div>
  );
};

export const TableHeader: React.FC<TableProps> = ({ children }) => {
  return <thead className="bg-gray-50">{children}</thead>;
};

export const TableBody: React.FC<TableProps> = ({ children }) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
  );
};

export const TableRow: React.FC<TableProps> = ({
  children,
  className = "",
}) => {
  return <tr className={className}>{children}</tr>;
};

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  isHeader?: boolean;
  colSpan?: number;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className = "",
  isHeader = false,
  colSpan,
  ...props
}) => {
  const baseClasses = "px-6 py-4 text-sm";
  const headerClasses =
    "font-medium text-gray-500 uppercase tracking-wider text-left";
  const cellClasses = "text-gray-900";

  const Component = isHeader ? "th" : "td";

  return (
    <Component
      className={`${baseClasses} ${
        isHeader ? headerClasses : cellClasses
      } ${className}`}
      colSpan={colSpan}
      {...props}
    >
      {children}
    </Component>
  );
};
