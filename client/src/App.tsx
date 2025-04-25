import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/lib/protected-route";
import { Header } from "@/components/layout/header";
import HomePage from "@/pages/home-page";
import EventDetailsPage from "@/pages/event-details-page";
import CalendarPage from "@/pages/calendar-page";
import AuthPage from "@/pages/auth-page";
import ManageEventsPage from "@/pages/admin/manage-events-page";
import CreateEventPage from "@/pages/admin/create-event-page";
import RegistrationPage from "@/pages/registration-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/events/:id" component={EventDetailsPage} />
      <Route path="/events/:id/register" component={RegistrationPage} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin routes */}
      <ProtectedRoute path="/admin/events" component={ManageEventsPage} adminOnly />
      <ProtectedRoute path="/admin/events/create" component={CreateEventPage} adminOnly />
      <ProtectedRoute 
        path="/admin/events/:id/edit" 
        component={() => <CreateEventPage isEditing />} 
        adminOnly 
      />
      
      {/* Fallback for 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8">
          <Router />
        </main>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
