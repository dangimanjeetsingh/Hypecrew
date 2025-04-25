import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { CalendarView } from "@/components/ui/calendar-view";
import { Loader2 } from "lucide-react";

export default function CalendarPage() {
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !events) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Failed to Load Events</h1>
        <p className="text-muted-foreground">
          Could not load events for the calendar. Please try again later.
        </p>
      </div>
    );
  }
  
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Events Calendar</h1>
      <CalendarView events={events} />
    </div>
  );
}
