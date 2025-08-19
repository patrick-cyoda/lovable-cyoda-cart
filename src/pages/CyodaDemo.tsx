import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useAsync, useAsyncCallback } from "@/hooks/useAsync";
import { ProductService, querySql, CyodaApiError } from "@/services/cyoda";
import { Product } from "@/types";
import { Plus, Search, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function CyodaDemo() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantityAvailable: '',
    category: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products
  const { data: productsData, loading: productsLoading, error: productsError, refetch } = useAsync(
    () => ProductService.list({ limit: 10 }),
    []
  );

  // Create product
  const { execute: createProduct, loading: createLoading, error: createError } = useAsyncCallback(
    async (productData: Omit<Product, 'sku'>) => {
      const result = await ProductService.create(productData);
      toast({
        title: "Product created",
        description: `Product created with ID: ${result.id}`,
      });
      refetch();
      setFormData({ name: '', description: '', price: '', quantityAvailable: '', category: '' });
      return result;
    }
  );

  // SQL Query
  const { execute: executeQuery, data: queryResults, loading: queryLoading, error: queryError } = useAsyncCallback(
    async (sql: string) => {
      return await querySql(sql);
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      quantityAvailable: parseInt(formData.quantityAvailable),
      category: formData.category,
    };

    createProduct(product);
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      executeQuery(searchQuery);
    }
  };

  const renderError = (error: Error | null) => {
    if (!error) return null;
    
    const isApiError = error instanceof CyodaApiError;
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {isApiError ? `API Error (${error.status}): ${error.message}` : error.message}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Cyoda Integration Demo
        </h1>
        <p className="text-lg text-muted-foreground">
          Test live connections to the Cyoda Entity Database Management System
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Create Product Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Product
            </CardTitle>
            <CardDescription>
              Add a new product to the Cyoda entity database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantityAvailable}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantityAvailable: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                />
              </div>
              
              {renderError(createError)}
              
              <Button type="submit" disabled={createLoading} className="w-full">
                {createLoading ? 'Creating...' : 'Create Product'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* SQL Query */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              SQL Query
            </CardTitle>
            <CardDescription>
              Execute SQL queries against the Cyoda database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleQuerySubmit} className="space-y-4">
              <div>
                <Label htmlFor="query">SQL Query</Label>
                <Input
                  id="query"
                  placeholder="SELECT * FROM Product LIMIT 10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
              </div>
              
              {renderError(queryError)}
              
              <Button type="submit" disabled={queryLoading}>
                {queryLoading ? 'Executing...' : 'Execute Query'}
              </Button>
            </form>
            
            {queryResults && (
              <div className="mt-4">
                <Separator className="mb-4" />
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">
                    Query executed successfully. {Array.isArray(queryResults) ? queryResults.length : 0} rows returned.
                  </span>
                </div>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(queryResults, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Products from Cyoda</CardTitle>
          <CardDescription>
            Live data from the Cyoda Entity Database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderError(productsError)}
          
          {productsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading products...</p>
            </div>
          ) : productsData?.items ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {productsData.items.length} of {productsData.total} products
                </Badge>
                <Button onClick={refetch} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Available</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsData.items.map((product) => (
                    <TableRow key={product.sku}>
                      <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.quantityAvailable}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No products found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}