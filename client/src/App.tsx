import { Head } from "@/components/Head";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Calendar from "./pages/Calendar";
import Admin from "./pages/Admin";
import EditorialDetail from "./pages/EditorialDetail";
import EditorialList from "./pages/EditorialList";
import Home from "./pages/Home";
import InfoPage from "./pages/InfoPage";
import NotFound from "./pages/NotFound";
import SearchPage from "./pages/SearchPage";
import ToolDetail from "./pages/ToolDetail";
import Tools from "./pages/Tools";

function Router() {
  return <Switch>
    <Route path="/admin" component={Admin} />
    <Route path="/" component={Home} />
    <Route path="/tools" component={Tools} />
    <Route path="/tools/:slug" component={ToolDetail} />
    <Route path="/calendar" component={Calendar} />
    <Route path="/guides" component={() => <EditorialList type="guide" />} />
    <Route path="/guides/:slug" component={() => <EditorialDetail type="guide" />} />
    <Route path="/articles" component={() => <EditorialList type="article" />} />
    <Route path="/articles/:slug" component={() => <EditorialDetail type="article" />} />
    <Route path="/search" component={SearchPage} />
    <Route path="/about" component={InfoPage} />
    <Route path="/privacy" component={InfoPage} />
    <Route path="/terms" component={InfoPage} />
    <Route path="/contact" component={InfoPage} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Head /><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
