export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-secondary rounded-lg"></div>
          <div>
            <h1 className="text-3xl font-bold mb-4">Product: {params.slug}</h1>
            <p className="text-2xl font-semibold text-primary mb-4">$99.00</p>
            <p className="text-muted-foreground mb-6">
              Premium F1 merchandise with official team branding and high-quality materials.
            </p>
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
