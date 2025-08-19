import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProductCard } from "@/components/ProductCard";
import { ProductService } from "@/services/cyoda";
import { useAsync } from "@/hooks/useAsync";
import { Product } from "@/types";
import { AlertCircle } from "lucide-react";

const categories = ["All", "Drivetrain", "Wheels", "Frames", "Brakes", "Pedals", "Safety", "Tires"];

export function ProductList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch products from Cyoda
  const { data: productsData, loading, error, refetch } = useAsync(
    () => ProductService.search(searchTerm, selectedCategory),
    [searchTerm, selectedCategory]
  );

  const filteredProducts = productsData?.items || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Premium Bike Parts
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          High-performance bicycle components and accessories for road, mountain, and gravel cycling
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search products and services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">Filter by:</span>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="transition-all duration-200"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading products: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `Showing ${filteredProducts.length} of ${productsData?.total || 0} products`}
          </span>
          {selectedCategory !== "All" && (
            <Badge variant="secondary">
              {selectedCategory}
            </Badge>
          )}
        </div>
        <Button onClick={refetch} variant="outline" size="sm" disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.sku} className="animate-slide-in">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          </div>
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
}