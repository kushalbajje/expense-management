import React, { useState } from "react";
import { Building, User, Receipt } from "lucide-react";
import { AppProvider, useAppContext } from "./context/AppContext";
import { Button } from "./components/ui";
import { DepartmentsPage } from "./pages/DepartmentsPage";
import { UsersPage } from "./pages/UsersPage";
import { ExpensesPage } from "./pages/ExpensesPage";

type Page = "departments" | "users" | "expenses";

const AppContent: React.FC = () => {
  const { dispatch } = useAppContext();
  const [activePage, setActivePage] = useState<Page>("departments");

  const loadMockData = () => {
    dispatch({ type: "LOAD_MOCK_DATA" });
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
              <Button onClick={loadMockData}>Load Data</Button>
              <Button onClick={resetData}>Reset</Button>
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
          {activePage === "departments" && <DepartmentsPage />}
          {activePage === "users" && <UsersPage />}
          {activePage === "expenses" && <ExpensesPage />}
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
