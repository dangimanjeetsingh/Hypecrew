import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Event } from "@shared/schema";
import { RegistrationForm } from "@/components/ui/registration-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function RegistrationPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id);
  
  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !isNaN(eventId),
  });
  
  if (isNaN(eventId)) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Event ID</h1>
        <p className="text-muted-foreground mb-6">The event ID provided is not valid.</p>
        <Link href="/">
          <a>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </a>
        </Link>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The event you're trying to register for doesn't exist or has been removed.
        </p>
        <Link href="/">
          <a>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </a>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="py-8">
      <div className="mb-8">
        <Link href={`/events/${event.id}`}>
          <a className="inline-flex items-center text-sm font-medium text-primary">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Event
          </a>
        </Link>
      </div>
      
      <RegistrationForm event={event} />
    </div>
  );
}
