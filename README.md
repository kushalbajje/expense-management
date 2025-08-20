# Expense Management System

A comprehensive web application for managing expenses across organizational departments and users. Built with React, TypeScript, and optimized for handling large datasets with O(1) time complexity operations.

## Features

### Department Management
- Create, edit, and delete organizational departments
- View department statistics (total users, total spending)
- Department deletion with user reassignment functionality
- Unique department name validation

### User Management  
- Create, edit, and delete users with department assignments
- Track individual user spending and expense counts
- Prerequisite: At least one department must exist
- Cascade deletion: Removing users automatically deletes their expenses

### Expense Management
- Create, edit, and delete expenses for any user
- Support for expense categories: Supplies, Software, Gas, Food, Other
- View all expenses across the organization
- Prerequisite: At least one user must exist
- Real-time updates across all related data

## Installation and Setup

### Prerequisites
- Node.js (version 16 or higher)
- pnpm package manager

### Installation Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd expense-management
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build

## Technical Architecture & Design Decisions

### Data Structure & Performance
- **Maps over Arrays**: Used JavaScript Maps throughout for O(1) lookup, insertion, and deletion operations
- **Relational Data Management**: Maintained separate Maps for `departments`, `users`, `expenses`, `usersByDepartment`, and `expensesByUser` to ensure referential integrity
- **Time Complexity**: All CRUD operations achieve O(1) complexity as required

### State Management
- **React Context + useReducer**: Centralized state management without external dependencies
- **Immutable Updates**: All state updates create new Map instances to ensure React re-renders
- **Action-based Updates**: Clear separation of concerns with typed actions

### Performance Optimizations
- **React Window**: Implemented virtualization for large lists (1000+ users/expenses)
- **Memoization**: Strategic use of `useMemo` for expensive calculations
- **Efficient Re-renders**: Minimized unnecessary re-renders through proper state structure

### UI/UX Decisions
- **Tab-based Navigation**: Clean separation of the three main sections
- **Responsive Design**: Mobile-friendly layout using Tailwind CSS
- **Loading States**: Visual feedback for data operations
- **Confirmation Modals**: Prevent accidental deletions with confirmation dialogs

### Component Architecture
- **Modular Design**: Separated UI components, hooks, pages, and business logic
- **Custom Hooks**: Domain-specific hooks (`useDepartments`, `useUsers`, `useExpenses`)
- **Reusable Components**: Common UI elements in `components/ui/`

## Mock Data Generation

The application includes a robust mock data generator that creates:
- 5 predefined departments (Engineering, Marketing, Sales, HR, Finance)
- 1,000 users randomly distributed across departments
- 1,000-2,000 expenses per user (1,000,000-2,000,000 total expenses)
- Realistic data relationships and spending patterns

### Using Mock Data
1. Click the "Load Data" button in the header to generate mock data
2. Click the "Reset" button to clear all data and start fresh
3. The application works with both empty state and pre-populated data

## Edge Cases Handled

### Department Management
- **Empty State**: Graceful handling when no departments exist
- **Deletion with Users**: Prompts for user reassignment to prevent data loss
- **Unique Names**: Prevents duplicate department names
- **Last Department**: Cannot delete if it would leave users orphaned

### User Management
- **Department Prerequisite**: Blocks user creation without departments
- **Department Changes**: Properly updates department totals when users move
- **Cascade Deletion**: Removes all user expenses when user is deleted
- **Name Duplicates**: Allows duplicate names but maintains unique IDs

### Expense Management
- **User Prerequisite**: Blocks expense creation without users
- **User Assignment Changes**: Properly transfers expenses between users
- **Department Impact**: Updates department totals when expenses change users
- **Data Consistency**: Maintains accurate totals across all related entities

### General
- **Large Dataset Performance**: Handles 100,000+ expenses without performance degradation
- **Memory Management**: Efficient cleanup when deleting related data
- **State Consistency**: Maintains data integrity across all operations
- **Browser Compatibility**: Works across modern browsers

## Technology Stack

- **React 19**: Latest React with concurrent features
- **TypeScript**: Full type safety and developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first styling framework
- **React Window**: Virtualization for large lists
- **Lucide React**: Consistent icon library
- **Nanoid**: Lightweight unique ID generation

## Development Approach

This project follows modern React development best practices with:
- Comprehensive TypeScript integration for type safety
- Performance-optimized architecture and data structures
- Modular component design and reusable hooks
- Thorough testing of edge cases and user scenarios
- Clean, maintainable code organization

## AI Tools Usage

AI assistance was utilized in the following areas to enhance development efficiency:

- **Project Scaffolding**: Initial project structure and configuration setup
- **UI Components**: Creation of reusable components in the `src/components/ui/` folder
- **Code Completion**: GitHub Copilot for intelligent code suggestions and completions
- **Styling**: CSS class generation and Tailwind utility combinations for responsive design
- **Architecture Ideation**: Exploring different architectural approaches and weighing pros and cons based on trade-offs

The core business logic, architectural decisions, and implementation strategy remain human-designed, with AI tools serving as productivity enhancers for repetitive and boilerplate tasks.

## Future Enhancements

### Data Management & Performance
- **Cursor-based Pagination**: Implement server-side cursor pagination for efficient large dataset handling
- **Web Workers**: Offload heavy computational tasks (data processing, sorting, filtering) to background threads
- **IndexedDB Integration**: Client-side data storage for offline capabilities and reduced server requests
- **Virtual Scrolling**: Enhanced virtualization for millions of records with dynamic row heights
- **Data Streaming**: Real-time data updates and progressive loading for live expense tracking


Happy Otto