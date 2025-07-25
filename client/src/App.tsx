import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import VendorManagement from "@/pages/vendor-management";
import VendorDiscovery from "@/pages/vendor-discovery";
import ProductCatalogue from "@/pages/product-catalogue";
import BomManagement from "@/pages/bom-management";
import RfxManagement from "@/pages/rfx-management";
import AuctionCenter from "@/pages/auction-center";
import PurchaseOrders from "@/pages/purchase-orders";
import Analytics from "@/pages/analytics";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/vendors" component={VendorManagement} />
          <Route path="/vendor-discovery" component={VendorDiscovery} />
          <Route path="/products" component={ProductCatalogue} />
          <Route path="/boms" component={BomManagement} />
          <Route path="/rfx" component={RfxManagement} />
          <Route path="/auctions" component={AuctionCenter} />
          <Route path="/purchase-orders" component={PurchaseOrders} />
          <Route path="/analytics" component={Analytics} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
