export default function EventsPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">F1 Events</h1>
        <p className="text-muted-foreground mb-8">Upcoming races and special events</p>
        <div className="space-y-4">
          {[
            { name: 'Monaco Grand Prix', date: 'May 26, 2024', location: 'Monte Carlo' },
            { name: 'British Grand Prix', date: 'July 7, 2024', location: 'Silverstone' },
            { name: 'Italian Grand Prix', date: 'September 1, 2024', location: 'Monza' },
          ].map((event) => (
            <div key={event.name} className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                  <p className="text-muted-foreground">{event.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">{event.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
