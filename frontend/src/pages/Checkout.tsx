import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { saveOrder } from "@/utils/orders";

interface CartItemState {
  cartItem?: {
    id: string | number;
    title: string;
    image?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    auctionType?: string;
  };
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const state = location.state as CartItemState | undefined;
  const cartItem = state?.cartItem;

  const [fullName, setFullName] = useState(
    user ? `${user.firstName} ${user.lastName}` : ""
  );
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  if (!cartItem) {
    // If user comes to checkout without a cart item, send back to cart
    navigate("/cart");
    return null;
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: "/checkout", cartItem } });
      return;
    }

    if (!fullName || !email || !street || !city || !country || !paymentMethod) {
      // Very lightweight validation
      return;
    }

    setIsPlacingOrder(true);

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

    saveOrder({
      id: orderId,
      userId: user.id,
      productTitle: cartItem.title,
      productImage: cartItem.image,
      quantity: cartItem.quantity,
      amount: cartItem.totalPrice,
      paymentMethod,
      status: "completed",
      createdAt: new Date().toISOString(),
      shippingAddress: {
        fullName,
        email,
        phone,
        street,
        city,
        state: stateRegion,
        zipCode,
        country,
      },
    });

    setIsPlacingOrder(false);
    navigate("/dashboard", {
      state: {
        orderPlaced: true,
        lastOrderId: orderId,
      },
    });
  };

  const formatPrice = (value: number) =>
    isNaN(value) ? "$0" : `$${value.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border bg-card/60 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-crimson" />
              <h1 className="text-xl font-semibold">Checkout</h1>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Address & Payment */}
          <form
            onSubmit={handlePlaceOrder}
            className="space-y-6 lg:col-span-2"
          >
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Shipping address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="street">Street address</Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="state">State / Region</Label>
                    <Input
                      id="state"
                      value={stateRegion}
                      onChange={(e) => setStateRegion(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="zip">ZIP / Postal code</Label>
                    <Input
                      id="zip"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Payment method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>Choose a payment option</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit / Debit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* In a real app, card / wallet fields go here */}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-crimson hover:bg-crimson/90 px-8"
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? "Placing order..." : "Place order"}
              </Button>
            </div>
          </form>

          {/* Right: Order Summary */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                {cartItem.image && (
                  <div className="w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
                    <img
                      src={cartItem.image}
                      alt={cartItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{cartItem.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {cartItem.quantity}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Price per item: {formatPrice(cartItem.unitPrice)}
                  </p>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatPrice(cartItem.totalPrice)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">$0</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-lg font-bold">
                  {formatPrice(cartItem.totalPrice)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Checkout;


