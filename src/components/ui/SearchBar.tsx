import React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  placeholder: string;
  isSearching: boolean;
  isLoading?: boolean;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder,
  isSearching,
  isLoading = false,
  className = "w-80",
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={isLoading ? "Searching..." : placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isLoading}
        className={`pl-2 pr-16 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed ${className}`}
      />

      {isSearching && !isLoading && (
        <button
          onClick={onClear}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 p-1 rounded bg-white text-black  "
          title="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <button
        onClick={onSearch}
        disabled={isLoading}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded bg-black transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        title="Search"
      >
        <Search className="text-white hover:text-grey-600 w-4 h-4" />
      </button>
    </div>
  );
};
