export default function TeamsPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">F1 Teams</h1>
        <p className="text-muted-foreground mb-8">Shop gear from your favorite F1 teams</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Red Bull Racing', 'Ferrari', 'Mercedes', 'McLaren', 'Aston Martin', 'Alpine'].map((team) => (
            <div key={team} className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
              <div className="aspect-video bg-secondary rounded mb-4"></div>
              <h3 className="font-semibold text-xl">{team}</h3>
              <p className="text-sm text-muted-foreground mt-2">View collection</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
