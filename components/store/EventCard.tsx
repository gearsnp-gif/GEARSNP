import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    slug: string;
    location: string;
    event_date: string;
    banner_image_url: string | null;
    is_active: boolean;
  };
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.event_date);
  const now = new Date();
  const isUpcoming = eventDate > now;
  const isPast = eventDate < now;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <Link href={`/events/${event.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {event.banner_image_url ? (
            <Image
              src={event.banner_image_url}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Calendar className="h-16 w-16" />
            </div>
          )}
          <Badge
            className={`absolute top-3 right-3 ${
              isUpcoming
                ? "bg-[#e10600]"
                : isPast
                ? "bg-gray-500"
                : "bg-green-500"
            }`}
          >
            {isUpcoming ? "Upcoming" : isPast ? "Past" : "Live"}
          </Badge>
        </div>
        <CardHeader>
          <CardTitle className="group-hover:text-[#e10600] transition-colors">
            {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(eventDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
