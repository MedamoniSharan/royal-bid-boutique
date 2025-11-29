import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as
    | {
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
    | undefined;

  const cartItem = state?.cartItem;

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
              <h1 className="text-xl font-semibold">Your Cart</h1>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {!cartItem ? (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Your cart is empty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Looks like you haven&apos;t added anything to your cart yet. Choose a
                  product and click <span className="font-semibold">Buy Now</span> to see
                  it here.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                  </Button>
                  <Button
                    className="bg-crimson hover:bg-crimson/90"
                    onClick={() => navigate("/")}
                  >
                    Continue Browsing
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-border/60">
                <CardHeader>
                  <CardTitle>Items in your cart</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {cartItem.image && (
                      <div className="w-28 h-28 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img
                          src={cartItem.image}
                          alt={cartItem.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="font-semibold text-lg">{cartItem.title}</h2>
                          {cartItem.auctionType && (
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              {cartItem.auctionType === "auction"
                                ? "Auction Buy Now"
                                : cartItem.auctionType === "retail"
                                ? "Retail"
                                : cartItem.auctionType === "anti-pieces"
                                ? "Anti Pieces"
                                : cartItem.auctionType}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Quantity: <span className="font-medium">{cartItem.quantity}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Price per item:{" "}
                        <span className="font-medium">
                          ${cartItem.unitPrice.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle>Order summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      ${cartItem.totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated shipping</span>
                    <span className="font-medium">$0</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="text-lg font-bold">
                      ${cartItem.totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    className="w-full bg-crimson hover:bg-crimson/90"
                    onClick={() =>
                      navigate("/checkout", {
                        state: { cartItem },
                      })
                    }
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Cart;


