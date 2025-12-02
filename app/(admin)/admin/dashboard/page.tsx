import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabaseServer } from "@/lib/supabase/server";
import { formatNepaliCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);
  const last30Days = new Date(today);
  last30Days.setDate(last30Days.getDate() - 30);

  // Fetch stats for different time periods
  const [todayOrders, last7DaysOrders, last30DaysOrders, allTimeOrders] = await Promise.all([
    supabase.from("orders").select("total", { count: "exact" }).gte("created_at", today.toISOString()),
    supabase.from("orders").select("total", { count: "exact" }).gte("created_at", last7Days.toISOString()),
    supabase.from("orders").select("total", { count: "exact" }).gte("created_at", last30Days.toISOString()),
    supabase.from("orders").select("total", { count: "exact" }),
  ]);

  // Calculate revenues
  const todayRevenue = todayOrders.data?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0;
  const last7DaysRevenue = last7DaysOrders.data?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0;
  const last30DaysRevenue = last30DaysOrders.data?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0;
  const allTimeRevenue = allTimeOrders.data?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0;

  // Fetch product and customer counts
  const [{ count: productsCount }, { count: customersCount }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, total, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch low stock products
  const { data: lowStockProducts } = await supabase
    .from("products")
    .select("id, name, stock, sku")
    .eq("is_active", true)
    .lte("stock", 10)
    .order("stock", { ascending: true })
    .limit(5);

  const stats = {
    today: {
      orders: todayOrders.count || 0,
      revenue: todayRevenue,
    },
    last7Days: {
      orders: last7DaysOrders.count || 0,
      revenue: last7DaysRevenue,
    },
    last30Days: {
      orders: last30DaysOrders.count || 0,
      revenue: last30DaysRevenue,
    },
    allTime: {
      orders: allTimeOrders.count || 0,
      revenue: allTimeRevenue,
    },
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to GearsNP Admin Portal</p>
      </div>

      <Tabs defaultValue="today" className="space-y-6">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="last7days">Last 7 Days</TabsTrigger>
          <TabsTrigger value="last30days">Last 30 Days</TabsTrigger>
          <TabsTrigger value="lifetime">Lifetime</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardDescription>Total Orders</CardDescription>
                <CardTitle className="text-3xl">{stats.today.orders}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Today&apos;s orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Revenue</CardDescription>
                <CardTitle className="text-3xl">{formatNepaliCurrency(stats.today.revenue)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Today&apos;s revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Products</CardDescription>
                <CardTitle className="text-3xl">{productsCount || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Active products</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Customers</CardDescription>
                <CardTitle className="text-3xl">{customersCount || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="last7days" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardDescription>Total Orders</CardDescription>
                <CardTitle className="text-3xl">{stats.last7Days.orders}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Last 7 days orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Revenue</CardDescription>
                <CardTitle className="text-3xl">{formatNepaliCurrency(stats.last7Days.revenue)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Last 7 days revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Products</CardDescription>
                <CardTitle className="text-3xl">{productsCount || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Active products</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Customers</CardDescription>
                <CardTitle className="text-3xl">{customersCount || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="last30days" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardDescription>Total Orders</CardDescription>
                <CardTitle className="text-3xl">{stats.last30Days.orders}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Last 30 days orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Revenue</CardDescription>
                <CardTitle className="text-3xl">{formatNepaliCurrency(stats.last30Days.revenue)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Last 30 days revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Products</CardDescription>
                <CardTitle className="text-3xl">{productsCount || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Active products</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Customers</CardDescription>
                <CardTitle className="text-3xl">{customersCount || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lifetime" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardDescription>Total Orders</CardDescription>
                <CardTitle className="text-3xl">{stats.allTime.orders}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">All time orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Revenue</CardDescription>
                <CardTitle className="text-3xl">{formatNepaliCurrency(stats.allTime.revenue)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Total revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Products</CardDescription>
                <CardTitle className="text-3xl">{productsCount || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Active products</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Customers</CardDescription>
                <CardTitle className="text-3xl">{customersCount || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {!recentOrders || recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatNepaliCurrency(order.total)}</p>
                      <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
            <CardDescription>Products running low on inventory</CardDescription>
          </CardHeader>
          <CardContent>
            {!lowStockProducts || lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">All products in stock</p>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-orange-500">{product.stock} units</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
