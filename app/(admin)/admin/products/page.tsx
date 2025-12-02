import { supabaseServer } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddProductDialog } from "@/components/admin/products/AddProductDialog";
import { EditProductDialog } from "@/components/admin/products/EditProductDialog";
import { DeleteProductButton } from "@/components/admin/products/DeleteProductButton";
import { ManageSizesButton } from "@/components/admin/products/ManageSizesButton";
import { Badge } from "@/components/ui/badge";
import { formatNepaliCurrency } from "@/lib/utils";
import Image from "next/image";

export default async function ProductsPage() {
  const supabase = await supabaseServer();
  
  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(name), team:teams(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <AddProductDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>View and manage all products</CardDescription>
        </CardHeader>
        <CardContent>
          {!products || products.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No products yet. Add your first product to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.hero_image_url && (
                          <Image
                            src={product.hero_image_url}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.sku}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category?.name || "-"}</TableCell>
                    <TableCell>{product.team?.name || "-"}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatNepaliCurrency(product.base_price)}</div>
                        {product.compare_at_price && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatNepaliCurrency(product.compare_at_price)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                        {product.stock} units
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {product.is_featured && (
                          <Badge variant="default" className="bg-yellow-600">Featured</Badge>
                        )}
                        {product.is_active ? (
                          <Badge variant="default" className="bg-green-600">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <EditProductDialog product={product} />
                        <ManageSizesButton 
                          product={{
                            id: product.id,
                            name: product.name,
                            has_sizes: product.has_sizes || false,
                          }}
                        />
                        <DeleteProductButton
                          productId={product.id}
                          productName={product.name}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
