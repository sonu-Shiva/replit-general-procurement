import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Search,
  Package,
  Layers,
  FileText,
  Gavel,
  ShoppingCart,
  BarChart3,
  MessageSquare,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Vendor Management", href: "/vendors", icon: Users },
  { name: "Vendor Discovery", href: "/vendor-discovery", icon: Search },
  { name: "Product Catalogue", href: "/products", icon: Package },
  { name: "BOM Management", href: "/boms", icon: Layers },
  { name: "RFx Management", href: "/rfx", icon: FileText },
  { name: "Auction Center", href: "/auctions", icon: Gavel },
  { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-border shadow-sm">
      <div className="p-6">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "sidebar-nav",
                    isActive
                      ? "text-primary bg-primary/10 border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </a>
              </Link>
            );
          })}
        </nav>
        
        {/* AI Assistant Quick Access */}
        <Card className="mt-8 bg-gradient-to-r from-primary to-secondary text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">AI Assistant</CardTitle>
            <p className="text-sm text-primary-foreground/80">
              Need help with procurement? Ask me anything!
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="secondary" className="w-full" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Start Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
