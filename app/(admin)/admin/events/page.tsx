import { supabaseServer } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddEventDialog } from "@/components/admin/events/AddEventDialog";
import { EditEventDialog } from "@/components/admin/events/EditEventDialog";
import { DeleteEventButton } from "@/components/admin/events/DeleteEventButton";
import { Calendar } from "lucide-react";
import Image from "next/image";

export default async function EventsPage() {
  const supabase = await supabaseServer();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Events</h1>
          <p className="text-muted-foreground">Manage F1 events and race calendar</p>
        </div>
        <AddEventDialog />
      </div>

      {!events || events.length === 0 ? (
        <Card>
          <CardContent className="text-center text-muted-foreground py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No events yet. Add your first event to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex gap-4">
                  {event.banner_image_url && (
                    <Image
                      src={event.banner_image_url}
                      alt={event.title}
                      width={120}
                      height={80}
                      className="rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription className="mt-1">
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatEventDate(event.event_date)} • {event.location}
                          </span>
                        </CardDescription>
                        {event.description && (
                          <p className="text-sm mt-2 text-muted-foreground">{event.description}</p>
                        )}
                      </div>
                      <Badge variant={event.is_active ? "default" : "secondary"} className="ml-2">
                        {event.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <EditEventDialog event={event} />
                  <DeleteEventButton eventId={event.id} eventTitle={event.title} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
