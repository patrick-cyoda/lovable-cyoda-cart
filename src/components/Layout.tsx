import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { useNavigate, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const cart = useCartStore(state => state.cart);

  const isCartPage = location.pathname === '/cart';
  const isCheckoutPage = location.pathname === '/checkout';

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-card shadow-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
              >
                Cyoda OMS
              </button>
              <span className="text-sm text-muted-foreground">Order Management System</span>
            </div>
            
            {!isCartPage && !isCheckoutPage && (
              <Button
                variant="cart"
                size="default"
                onClick={() => navigate('/cart')}
                className="relative"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
                {cart && cart.totalItems > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full animate-scale-in"
                  >
                    {cart.totalItems}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}