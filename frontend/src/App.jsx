import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRouter";

// Root component that wires up auth context and app routing
export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
