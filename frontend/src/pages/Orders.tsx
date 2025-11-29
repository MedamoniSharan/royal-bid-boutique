import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { getOrdersForUser, Order } from "@/utils/orders";

type OrdersTab = "all" | "completed" | "cancelled";

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<OrdersTab>("all");

  const orders: Order[] = useMemo(() => {
    if (!user?.id) return [];
    return getOrdersForUser(user.id);
  }, [user?.id]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    if (activeTab === "completed") {
      return orders.filter((o) => o.status === "completed");
    }
    if (activeTab === "cancelled") {
      return orders.filter((o) => o.status === "cancelled");
    }
    return orders;
  }, [orders, activeTab]);

  const renderStatusBadge = (status: Order["status"]) => (
    <Badge
      variant={
        status === "completed"
          ? "default"
          : status === "processing"
          ? "secondary"
          : status === "pending"
          ? "outline"
          : "destructive"
      }
      className="text-xs"
    >
      {status.toUpperCase()}
    </Badge>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Your Orders
              </h1>
              <p className="text-muted-foreground text-sm">
                Track your purchases and order status
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-crimson" />
                <CardTitle>Order History</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as OrdersTab)}
            >
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <OrdersList orders={filteredOrders} renderStatusBadge={renderStatusBadge} />
              </TabsContent>
              <TabsContent value="completed">
                <OrdersList orders={filteredOrders} renderStatusBadge={renderStatusBadge} />
              </TabsContent>
              <TabsContent value="cancelled">
                <OrdersList orders={filteredOrders} renderStatusBadge={renderStatusBadge} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const OrdersList = ({
  orders,
  renderStatusBadge,
}: {
  orders: Order[];
  renderStatusBadge: (status: Order["status"]) => JSX.Element;
}) => {
  if (!orders.length) {
    return (
      <div className="py-10 text-center text-muted-foreground space-y-2">
        <p className="font-medium">No orders in this view yet.</p>
        <p className="text-sm">
          Place an order from the dashboard to see it appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex flex-col md:flex-row md:items-center gap-4 border border-border rounded-lg p-4"
        >
          {order.productImage && (
            <div className="w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
              <img
                src={order.productImage}
                alt={order.productTitle}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{order.productTitle}</p>
                <p className="text-xs text-muted-foreground">
                  Order ID:{" "}
                  <span className="font-mono">
                    {order.id}
                  </span>
                </p>
              </div>
              {renderStatusBadge(order.status)}
            </div>
            <p className="text-xs text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-semibold">
              ${order.amount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.quantity} item{order.quantity !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;


