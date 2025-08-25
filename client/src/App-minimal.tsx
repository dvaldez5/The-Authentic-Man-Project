import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";

// Import only essential pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";

function SimpleHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            The AM Project
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Redefining what it means to be a man in the modern world.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors">
              Get Started
            </button>
            <button className="border border-amber-600 text-amber-600 px-8 py-3 rounded-lg hover:bg-amber-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppRouter(): React.JSX.Element {
  return (
    <Switch>
      <Route path="/" component={SimpleHome} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <TooltipProvider>
      <main>
        <AppRouter />
      </main>
      <Toaster />
    </TooltipProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppContent />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}