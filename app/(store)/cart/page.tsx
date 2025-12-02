export default function CartPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Subtotal</p>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50" disabled>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
