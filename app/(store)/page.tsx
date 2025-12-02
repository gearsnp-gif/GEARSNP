export default function HomePage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
          GearsNP
        </h1>
        <p className="text-muted-foreground text-lg">
          Premium F1 Merchandise & Team Gear - Store Home
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors">
            <h2 className="text-xl font-semibold mb-2">Latest Products</h2>
            <p className="text-muted-foreground">Discover new arrivals</p>
          </div>
          <div className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors">
            <h2 className="text-xl font-semibold mb-2">F1 Teams</h2>
            <p className="text-muted-foreground">Shop by your favorite team</p>
          </div>
          <div className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors">
            <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>
            <p className="text-muted-foreground">Check race calendars</p>
          </div>
        </div>
      </div>
    </div>
  );
}
