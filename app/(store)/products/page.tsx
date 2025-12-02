export default function ProductsPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">All Products</h1>
        <p className="text-muted-foreground">Browse our complete collection of F1 gear</p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-card rounded-lg border border-border">
              <div className="aspect-square bg-secondary rounded mb-4"></div>
              <h3 className="font-semibold">Product {i}</h3>
              <p className="text-sm text-muted-foreground">$99.00</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
