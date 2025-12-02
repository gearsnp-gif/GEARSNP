export default function CheckoutPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Full Name" className="w-full px-4 py-2 bg-secondary rounded border border-border" />
                <input type="email" placeholder="Email" className="w-full px-4 py-2 bg-secondary rounded border border-border" />
                <input type="text" placeholder="Address" className="w-full px-4 py-2 bg-secondary rounded border border-border" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="City" className="px-4 py-2 bg-secondary rounded border border-border" />
                  <input type="text" placeholder="Postal Code" className="px-4 py-2 bg-secondary rounded border border-border" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="bg-card rounded-lg border border-border p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>$0.00</span>
                  </div>
                </div>
              </div>
              <button className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
