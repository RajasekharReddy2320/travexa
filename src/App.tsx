import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Welcome from "./pages/Welcome";
import Wanderlust from "./pages/Wanderlust";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import PlanTrip from "./pages/PlanTrip";
import Book from "./pages/Book";
import Profile from "./pages/Profile";
import CreateTrip from "./pages/CreateTrip";
import Connections from "./pages/Connections";
import SearchUsers from "./pages/SearchUsers";
import BookTransport from "./pages/BookTransport";
import BookConfirm from "./pages/BookConfirm";
import MyTickets from "./pages/MyTickets";
import TicketDetails from "./pages/TicketDetails";
import Cart from "./pages/Cart";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Wanderlust />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/plan-trip" element={<Dashboard />} />
            <Route path="/ai-planner" element={<PlanTrip />} />
            <Route path="/create-trip" element={<CreateTrip />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/search" element={<SearchUsers />} />
            <Route path="/book-transport" element={<BookTransport />} />
            <Route path="/book-confirm" element={<BookConfirm />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/ticket-details" element={<TicketDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/book" element={<Book />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
