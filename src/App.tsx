import React, { useState, Suspense, lazy } from "react";
import { Building, User, Receipt } from "lucide-react";
import { AppProvider, useAppContext } from "./context/AppContext";
import { Button } from "./components/ui";

// Lazy load page components for better performance
const DepartmentsPage = lazy(() => import("./pages/DepartmentsPage").then(m => ({ default: m.DepartmentsPage })));
const UsersPage = lazy(() => import("./pages/UsersPage").then(m => ({ default: m.UsersPage })));
const ExpensesPage = lazy(() => import("./pages/ExpensesPage").then(m => ({ default: m.ExpensesPage })));

type Page = "departments" | "users" | "expenses";

const AppContent: React.FC = () => {
  const { dispatch } = useAppContext();
  const [activePage, setActivePage] = useState<Page>("departments");
  const [isLoading, setIsLoading] = useState(false);

  const loadMockData = async () => {
    setIsLoading(true);
    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      dispatch({ type: "LOAD_MOCK_DATA" });
      setIsLoading(false);
    }, 100);
  };

  const resetData = () => {
    dispatch({ type: "RESET_DATA" });
  };

  const navigation = [
    { id: "departments" as Page, label: "Departments", icon: Building },
    { id: "users" as Page, label: "Users", icon: User },
    { id: "expenses" as Page, label: "Expenses", icon: Receipt },
  ];

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-medium">Expense Management</h1>
            <div className="flex gap-2">
              <Button onClick={loadMockData} disabled={isLoading}>
                {isLoading ? "Loading..." : "Load Data"}
              </Button>
              <Button onClick={resetData} disabled={isLoading}>Reset</Button>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {navigation.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 ${
                  activePage === id
                    ? "border-black"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 py-8">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">
                  {activePage === "expenses" ? "Loading expenses (large dataset)..." : "Loading page..."}
                </p>
              </div>
            </div>
          }>
            {activePage === "departments" && <DepartmentsPage />}
            {activePage === "users" && <UsersPage />}
            {activePage === "expenses" && <ExpensesPage />}
          </Suspense>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
