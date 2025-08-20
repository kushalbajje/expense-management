import { DepartmentsPage } from "./pages/DepartmentsPage";
import { AppProvider, } from "./context/AppContext";
function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <AppProvider>
          <DepartmentsPage />
        </AppProvider>
      </div>
    </div>
  );
}

export default App;
