import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertBomSchema, insertBomItemSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Layers, 
  Plus, 
  Minus, 
  Package, 
  Search, 
  Calculator, 
  Tag,
  Calendar,
  Trash2,
  Edit,
  Save,
  Eye
} from "lucide-react";

interface BomBuilderProps {
  onClose: () => void;
}

interface BomLineItem {
  productId: string;
  productName: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  totalPrice: number;
}

export default function BomBuilder({ onClose }: BomBuilderProps) {
  const [bomItems, setBomItems] = useState<BomLineItem[]>([]);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertBomSchema),
    defaultValues: {
      name: "",
      version: "1.0",
      description: "",
      category: "",
      validFrom: "",
      validTo: "",
      tags: [],
    },
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products", { isActive: true }],
    retry: false,
  });

  const createBomMutation = useMutation({
    mutationFn: async (data: any) => {
      // First create the BOM
      const bomResponse = await apiRequest("POST", "/api/boms", {
        ...data,
        validFrom: data.validFrom ? new Date(data.validFrom).toISOString() : undefined,
        validTo: data.validTo ? new Date(data.validTo).toISOString() : undefined,
      });
      
      // Then add all BOM items
      for (const item of bomItems) {
        await apiRequest("POST", `/api/boms/${bomResponse.id}/items`, {
          productId: item.productId,
          quantity: item.quantity.toString(),
          uom: item.uom,
          unitPrice: item.unitPrice.toString(),
          totalPrice: item.totalPrice.toString(),
        });
      }
      
      return bomResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boms"] });
      toast({
        title: "Success",
        description: "BOM created successfully",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create BOM",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (bomItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the BOM",
        variant: "destructive",
      });
      return;
    }
    createBomMutation.mutate(data);
  };

  const addProductToBom = () => {
    if (!selectedProduct) return;

    const existingItemIndex = bomItems.findIndex(item => item.productId === selectedProduct.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      setBomItems(prev => prev.map((item, index) => 
        index === existingItemIndex 
          ? { 
              ...item, 
              quantity: item.quantity + productQuantity,
              totalPrice: (item.quantity + productQuantity) * item.unitPrice
            }
          : item
      ));
    } else {
      // Add new item
      const newItem: BomLineItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.itemName,
        quantity: productQuantity,
        uom: selectedProduct.uom || 'units',
        unitPrice: parseFloat(selectedProduct.basePrice || '0'),
        totalPrice: productQuantity * parseFloat(selectedProduct.basePrice || '0'),
      };
      setBomItems(prev => [...prev, newItem]);
    }

    setSelectedProduct(null);
    setProductQuantity(1);
    setIsAddProductDialogOpen(false);
  };

  const removeItemFromBom = (index: number) => {
    setBomItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    setBomItems(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
        : item
    ));
  };

  const updateItemPrice = (index: number, unitPrice: number) => {
    setBomItems(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, unitPrice, totalPrice: item.quantity * unitPrice }
        : item
    ));
  };

  const totalBomValue = bomItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="max-w-6xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">BOM Details</TabsTrigger>
              <TabsTrigger value="items">Items ({bomItems.length})</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Layers className="w-5 h-5 mr-2" />
                    BOM Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>BOM Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Office Workstation Setup" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version</FormLabel>
                          <FormControl>
                            <Input placeholder="1.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the purpose and scope of this BOM..."
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="electronics">Electronics</SelectItem>
                                <SelectItem value="industrial">Industrial</SelectItem>
                                <SelectItem value="office">Office Equipment</SelectItem>
                                <SelectItem value="automotive">Automotive</SelectItem>
                                <SelectItem value="construction">Construction</SelectItem>
                                <SelectItem value="furniture">Furniture</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="validFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valid From</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="validTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valid To</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      BOM Items
                    </div>
                    <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add Product to BOM</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                              Search Products
                            </label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input placeholder="Search by product name..." className="pl-10" />
                            </div>
                          </div>
                          
                          <div className="max-h-64 overflow-y-auto space-y-2">
                            {products?.map((product: any) => (
                              <div
                                key={product.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  selectedProduct?.id === product.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => setSelectedProduct(product)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium">{product.itemName}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {product.internalCode} • {product.category}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">
                                      ₹{parseFloat(product.basePrice || '0').toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">per {product.uom}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {selectedProduct && (
                            <div className="p-4 bg-muted rounded-lg">
                              <h4 className="font-medium mb-3">Selected: {selectedProduct.itemName}</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-foreground mb-1 block">
                                    Quantity
                                  </label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={productQuantity}
                                    onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-foreground mb-1 block">
                                    Total Price
                                  </label>
                                  <Input
                                    readOnly
                                    value={`₹${(productQuantity * parseFloat(selectedProduct.basePrice || '0')).toLocaleString()}`}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsAddProductDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={addProductToBom} disabled={!selectedProduct}>
                              Add to BOM
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bomItems.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Quantity</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Unit Price</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {bomItems.map((item, index) => (
                            <tr key={index}>
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium">{item.productName}</p>
                                  <p className="text-sm text-muted-foreground">per {item.uom}</p>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                  className="w-20"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.unitPrice}
                                  onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                                  className="w-24"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <p className="font-semibold">₹{item.totalPrice.toLocaleString()}</p>
                              </td>
                              <td className="py-3 px-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItemFromBom(index)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No items added</h3>
                      <p className="text-muted-foreground mb-4">
                        Start building your BOM by adding products from your catalogue
                      </p>
                      <Button onClick={() => setIsAddProductDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Item
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calculator className="w-5 h-5 mr-2" />
                      Cost Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Items:</span>
                        <span className="font-semibold">{bomItems.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Quantity:</span>
                        <span className="font-semibold">
                          {bomItems.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg">
                        <span className="font-medium">Total Value:</span>
                        <span className="font-bold text-primary">₹{totalBomValue.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Tag className="w-5 h-5 mr-2" />
                      Category Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {bomItems.length > 0 ? (
                        Object.entries(
                          bomItems.reduce((acc, item) => {
                            const product = products?.find((p: any) => p.id === item.productId);
                            const category = product?.category || 'Uncategorized';
                            acc[category] = (acc[category] || 0) + item.totalPrice;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([category, value]) => (
                          <div key={category} className="flex justify-between">
                            <span className="text-muted-foreground capitalize">{category}:</span>
                            <span className="font-semibold">₹{value.toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No items to analyze</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex space-x-2">
              <Button type="button" variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button type="submit" disabled={createBomMutation.isPending || bomItems.length === 0}>
                {createBomMutation.isPending ? "Creating..." : "Create BOM"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
