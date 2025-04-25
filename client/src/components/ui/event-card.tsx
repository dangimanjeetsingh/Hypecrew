import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Event } from "@shared/schema";
import { Clock, MapPin } from "lucide-react";
import { formatEventDate, getCategoryColor, truncateText } from "@/lib/utils";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const {
    id,
    title,
    description,
    venue,
    date,
    imageUrl,
    category,
  } = event;

  return (
    <Link href={`/events/${id}`}>
      <a className="block">
        <Card className="event-card overflow-hidden h-full hover:shadow-lg cursor-pointer transition-all duration-200">
          <div className="h-48 overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-4">
            <div className={`text-xs font-medium text-white inline-block px-2 py-1 rounded-full mb-2 ${getCategoryColor(category)}`}>
              {category}
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatEventDate(date)}</span>
            </div>
            <div className="mt-1 flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{venue}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {truncateText(description, 100)}
            </p>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
