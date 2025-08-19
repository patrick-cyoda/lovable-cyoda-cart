import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { Package, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    addItem(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Card className="h-full bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-[1.02] border border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 text-foreground line-clamp-2">
              {product.name}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {product.category || 'Product'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                SKU: {product.sku}
              </Badge>
            </div>
          </div>
        </div>
        <CardDescription className="text-sm text-muted-foreground line-clamp-3">
          {product.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-primary">
            {formatPrice(product.price)}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Package className="w-4 h-4" />
            <span>{product.quantityAvailable} available</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button
          onClick={handleAddToCart}
          className="w-full"
          variant="premium"
          disabled={product.quantityAvailable === 0}
        >
          <Plus className="w-4 h-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}