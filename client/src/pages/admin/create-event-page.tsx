import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { EventForm } from "@/components/ui/event-form";
import { ArrowLeft, Loader2 } from "lucide-react";

interface CreateEventPageProps {
  isEditing?: boolean;
}

export default function CreateEventPage({ isEditing = false }: CreateEventPageProps) {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id || "0");
  
  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: isEditing && !isNaN(eventId),
  });
  
  return (
    <div className="py-8">
      <div className="mb-8">
        <Link href="/admin/events">
          <a className="inline-flex items-center text-sm font-medium text-primary">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Events
          </a>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">
        {isEditing ? "Edit Event" : "Create New Event"}
      </h1>
      
      {isEditing && isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isEditing && (error || !event) ? (
        <div className="text-center py-10">
          <p className="text-destructive mb-4">Failed to load event details.</p>
          <Link href="/admin/events">
            <a className="text-primary hover:underline">Return to events list</a>
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-md p-6">
          <EventForm event={isEditing ? event : undefined} isEditing={isEditing} />
        </div>
      )}
    </div>
  );
}
