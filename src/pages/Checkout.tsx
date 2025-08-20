import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Truck, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CheckoutForm } from "@/types";
import { UserService, AddressService, OrderService, CartService } from "@/services/cyoda";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.object({
    line1: z.string().min(5, "Address line 1 is required"),
    city: z.string().min(2, "City is required"),
    postcode: z.string().min(3, "Postcode is required"),
    country: z.string().min(2, "Country is required"),
  }),
});

export function Checkout() {
  const navigate = useNavigate();
  const { cart, convertCart, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: {
        line1: "",
        city: "",
        postcode: "",
        country: "",
      },
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const onSubmit = async (data: CheckoutForm) => {
    if (!cart || cart.lines.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create/Find User via standard entity endpoints
      let userResult;
      try {
        const existingUsers = await UserService.findByEmail(data.email);
        if (existingUsers.items.length > 0) {
          // Update existing user
          const existingUser = existingUsers.items[0];
          userResult = await UserService.update(existingUser.userId, {
            name: data.name,
            phone: data.phone,
          });
          userResult.id = existingUser.userId;
        } else {
          // Create new user
          userResult = await UserService.create({
            name: data.name,
            email: data.email,
            phone: data.phone,
          });
        }
      } catch (error) {
        console.error('User creation/update failed:', error);
        throw new Error('Failed to process user information');
      }

      // 2. Create Address via standard entity endpoints
      const addressResult = await AddressService.create({
        userId: userResult.id,
        line1: data.address.line1,
        city: data.address.city,
        postcode: data.address.postcode,
        country: data.address.country,
      });

      // 3. Create Order via standard entity endpoints
      const orderNumber = `CY${Date.now().toString().slice(-8)}`;
      const orderResult = await OrderService.create({
        orderNumber,
        userId: userResult.id,
        shippingAddressId: addressResult.id,
        lines: cart.lines.map(line => ({
          sku: line.sku,
          name: line.name,
          unitPrice: line.price,
          qty: line.qty,
          lineTotal: line.lineTotal,
        })),
        totals: {
          items: cart.grandTotal,
          grand: cart.grandTotal,
        },
        status: 'WAITING_TO_FULFILL',
        createdAt: new Date().toISOString(),
      });

      // 4. Update Cart status to CONVERTED via standard entity endpoints
      await CartService.update(cart.cartId, { status: 'CONVERTED' });
      convertCart();
      clearCart();

      // Store order ID for confirmation page navigation
      localStorage.setItem('latest-order-id', orderResult.id);

      toast({
        title: "Order placed successfully!",
        description: `Your order ${orderNumber} has been confirmed.`,
      });

      navigate(`/order-confirmation?orderId=${orderResult.id}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cart || cart.lines.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/cart')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground">Complete your order securely</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="john@company.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Truck className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">Shipping Address</h3>
                    </div>

                    <FormField
                      control={form.control}
                      name="address.line1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 1</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Business Street" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="address.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.postcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postcode</FormLabel>
                            <FormControl>
                              <Input placeholder="10001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="United States" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    variant="premium"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Place Order"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cart.lines.map((line) => (
                  <div key={line.sku} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <div className="font-medium">{line.name}</div>
                      <div className="text-muted-foreground">Qty: {line.qty}</div>
                    </div>
                    <div className="text-right font-medium">
                      {formatPrice(line.lineTotal)}
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(cart.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-success">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>Calculated at delivery</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(cart.grandTotal)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="w-5 h-5 text-success" />
                <div>
                  <div className="font-medium text-foreground">Secure Checkout</div>
                  <div>Your information is protected by enterprise-grade encryption</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}