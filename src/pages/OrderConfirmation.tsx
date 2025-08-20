import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, Truck, ArrowLeft, Download, AlertCircle } from "lucide-react";
import { OrderService } from "@/services/cyoda";
import { useAsync } from "@/hooks/useAsync";
import { Order } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function OrderConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get order ID from URL params or localStorage fallback
  const orderId = searchParams.get('orderId') || localStorage.getItem('latest-order-id');
  
  const { data: orderData, loading, error } = useAsync(
    () => orderId ? OrderService.get(orderId) : Promise.reject(new Error('No order ID')),
    [orderId]
  );

  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'WAITING_TO_FULFILL':
        return <Package className="w-5 h-5" />;
      case 'PICKING':
        return <Package className="w-5 h-5 text-warning" />;
      case 'SENT':
        return <Truck className="w-5 h-5 text-success" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING_TO_FULFILL':
        return 'secondary';
      case 'PICKING':
        return 'default';
      case 'SENT':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'WAITING_TO_FULFILL':
        return 'Order Received';
      case 'PICKING':
        return 'Preparing Order';
      case 'SENT':
        return 'Shipped';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Order not found'}. Please check your order confirmation email.
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Details</CardTitle>
                <Badge variant={getStatusColor(orderData.status)}>
                  {getStatusIcon(orderData.status)}
                  {getStatusText(orderData.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Order Number</span>
                  <div className="font-mono font-medium">{orderData.orderNumber}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Order Date</span>
                  <div className="font-medium">
                    {new Date(orderData.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Items Ordered</h4>
                {orderData.lines.map((line) => (
                  <div key={line.sku} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">{line.name}</div>
                      <div className="text-sm text-muted-foreground">
                        SKU: {line.sku} • Qty: {line.qty}
                        {line.unitPrice && ` • ${formatPrice(line.unitPrice)} each`}
                      </div>
                    </div>
                    <div className="text-right font-medium">
                      {formatPrice(line.lineTotal)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(orderData.totals.grand)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="font-medium">
                  Order will be shipped to the address provided during checkout
                </div>
                <div className="text-muted-foreground">
                  Shipping details are processed securely via Cyoda platform
                </div>
                <div className="text-muted-foreground pt-2">
                  You will receive tracking information via email once your order ships
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">1</span>
                  </div>
                  <div>
                    <div className="font-medium">Order Processing</div>
                    <div className="text-muted-foreground">Your order is being prepared</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-muted-foreground">2</span>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Shipping</div>
                    <div className="text-muted-foreground">We'll notify you when shipped</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-muted-foreground">3</span>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Delivery</div>
                    <div className="text-muted-foreground">Estimated 3-5 business days</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button variant="premium" className="w-full">
                  <Download className="w-4 h-4" />
                  Download Invoice
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <div className="text-sm font-medium">Need Help?</div>
                <div className="text-xs text-muted-foreground">
                  Contact our support team for any questions about your order
                </div>
                <Button variant="link" size="sm">
                  support@cyoda.com
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}