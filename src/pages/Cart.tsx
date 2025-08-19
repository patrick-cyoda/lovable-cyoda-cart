import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function Cart() {
  const navigate = useNavigate();
  const { cart, updateQty, removeItem, openCheckout } = useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleQuantityChange = (sku: string, newQty: number) => {
    if (newQty < 1) return;
    updateQty(sku, newQty);
  };

  const handleRemoveItem = (sku: string, name: string) => {
    removeItem(sku);
    toast({
      title: "Item removed",
      description: `${name} has been removed from your cart.`,
    });
  };

  const handleCheckout = () => {
    if (!cart || cart.lines.length === 0) return;
    openCheckout();
    navigate('/checkout');
  };

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">
            Start shopping to add products to your cart
          </p>
          <Button onClick={() => navigate('/')} variant="premium" size="lg">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''} in your cart
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.lines.map((line) => (
            <Card key={line.sku} className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{line.name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline">SKU: {line.sku}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Unit price: {formatPrice(line.price)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Quantity:</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(line.sku, line.qty - 1)}
                            disabled={line.qty <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">{line.qty}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(line.sku, line.qty + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {formatPrice(line.lineTotal)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(line.sku, line.name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="shadow-elevated sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items ({cart.totalItems})</span>
                  <span>{formatPrice(cart.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-success">Free</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(cart.grandTotal)}</span>
              </div>
              
              <Button
                onClick={handleCheckout}
                className="w-full"
                variant="premium"
                size="lg"
              >
                Proceed to Checkout
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Secure checkout powered by Cyoda platform
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}