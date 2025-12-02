export default function TeamDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{params.slug.replace('-', ' ').toUpperCase()}</h1>
          <p className="text-muted-foreground">Official team merchandise and gear</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="p-4 bg-card rounded-lg border border-border">
              <div className="aspect-square bg-secondary rounded mb-4"></div>
              <h3 className="font-semibold">Team Item {i}</h3>
              <p className="text-sm text-muted-foreground">$99.00</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
