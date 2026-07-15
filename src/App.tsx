import React, { useState, Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { CallProvider } from "./context/CallContext";
import { AuthCard } from "./components/Auth/AuthCard";
import { Sidebar } from "./components/Dashboard/Sidebar";
import { ChatPane } from "./components/Dashboard/ChatPane";
import { CallModal } from "./components/Dashboard/CallModal";
import { ContactsView } from "./components/Dashboard/ContactsView";
import { HistoryView } from "./components/Dashboard/HistoryView";
import { SettingsView } from "./components/Dashboard/SettingsView";

const DashboardView: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-background p-0 ">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <div className="flex-grow h-full flex flex-col min-w-0 md:ml-4 bg-transparent md:rounded-3xl overflow-hidden relative z-0">
        <Outlet />
      </div>

      <CallModal />
    </div>
  );
};

const UnderConstructionView: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex-grow h-full flex flex-col items-center justify-center p-8 bg-transparent">
      <div className="bg-surface-lowest rounded-[32px] p-10 flex flex-col items-center justify-center text-center max-w-[380px] ambient-shadow">
        <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-6">
          <span className="text-[28px]">🚧</span>
        </div>
        <h2 className="text-[22px] font-extrabold text-on-surface mb-2">
          {title}
        </h2>
        <p className="text-[14px] text-on-surface-variant font-medium leading-relaxed">
          This feature is currently under construction. Please check back later!
        </p>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background gap-4 select-none">
        <span className="animate-spin h-8 w-8 border-4 border-[#FF6B35] border-t-transparent rounded-full"></span>
        <span className="text-[14px] font-bold text-on-surface-variant">
          Initializing Secure Session...
        </span>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const LoginRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background gap-4 select-none">
        <span className="animate-spin h-8 w-8 border-4 border-[#FF6B35] border-t-transparent rounded-full"></span>
        <span className="text-[14px] font-bold text-on-surface-variant">
          Initializing Secure Session...
        </span>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/chat" replace /> : <AuthCard />;
};

const ProtectedLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <ChatProvider>
        <CallProvider>
          <Outlet />
        </CallProvider>
      </ChatProvider>
    </ProtectedRoute>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/chat" element={<DashboardView />}>
          <Route index element={<ChatPane />} />
          <Route path=":roomId" element={<ChatPane />} />
          <Route path="contacts" element={<ContactsView />} />
          <Route path="history" element={<HistoryView />} />
          <Route
            path="overview"
            element={<UnderConstructionView title="Dashboard" />}
          />
          <Route path="settings" element={<SettingsView />} />
        </Route>
      </Route>
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/chat" : "/login"} replace />}
      />
    </Routes>
  );
};

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-6 text-center select-none">
          <h2 className="text-[20px] font-extrabold text-on-surface mb-2">
            Something went wrong
          </h2>
          <p className="text-[14px] text-on-surface-variant mb-6">
            An unexpected error has occurred in the application.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-[#E05621] transition-all"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
