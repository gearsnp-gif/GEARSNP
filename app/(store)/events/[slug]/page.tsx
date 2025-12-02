export default function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{params.slug.replace('-', ' ').toUpperCase()}</h1>
          <div className="flex gap-4 text-muted-foreground">
            <span>📅 Date TBD</span>
            <span>📍 Location TBD</span>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Event Details</h2>
          <p className="text-muted-foreground">
            Experience the thrill of Formula 1 racing. Get exclusive merchandise and event packages.
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Event Merchandise</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 bg-secondary rounded-lg">
                <div className="aspect-video bg-muted rounded mb-3"></div>
                <h3 className="font-semibold">Event Item {i}</h3>
                <p className="text-sm text-muted-foreground">$149.00</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
