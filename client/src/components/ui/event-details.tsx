import { Event } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Check
} from "lucide-react";
import { 
  formatEventDate, 
  formatEventTime, 
  getCategoryColor 
} from "@/lib/utils";

interface EventDetailsProps {
  event: Event;
}

export function EventDetails({ event }: EventDetailsProps) {
  const {
    id,
    title,
    description,
    venue,
    date,
    endDate,
    imageUrl,
    category,
    organizer,
  } = event;

  // Split description into paragraphs
  const descriptionParagraphs = description.split('\n\n');
  
  return (
    <div className="py-8">
      <div className="mb-8">
        <Link href="/">
          <a className="inline-flex items-center text-sm font-medium text-primary">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Events
          </a>
        </Link>
      </div>
      
      <div className="bg-card rounded-lg overflow-hidden shadow-lg">
        {/* Event image banner */}
        <div className="h-64 sm:h-80 overflow-hidden">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
        
        {/* Event content */}
        <div className="p-6">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <div className={`text-sm font-medium text-white inline-block px-3 py-1 rounded-full mb-2 ${getCategoryColor(category)}`}>
                {category}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
            </div>
            <Link href={`/events/${id}/register`}>
              <a>
                <Button>Register Now</Button>
              </a>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="prose max-w-none dark:prose-invert">
                <h2 className="text-xl font-semibold mb-2">About this event</h2>
                {descriptionParagraphs.map((paragraph, index) => (
                  <p key={index} className="text-card-foreground/80">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Event Details</h3>
                <div className="space-y-3">
                  <div className="flex">
                    <Calendar className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">Date & Time</div>
                      <div className="text-sm text-muted-foreground">{formatEventDate(date)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatEventTime(date)} - {endDate && formatEventTime(endDate)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <MapPin className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">Location</div>
                      <div className="text-sm text-muted-foreground">{venue}</div>
                      <div className="text-sm text-muted-foreground">Chandigarh University</div>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <User className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">Organizer</div>
                      <div className="text-sm text-muted-foreground">{organizer}</div>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <Check className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">Status</div>
                      <div className="text-sm text-green-600 font-medium">Registration Open</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Share section */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Share Event</h3>
                <div className="flex space-x-4">
                  <button className="text-blue-600 hover:text-blue-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"></path>
                    </svg>
                  </button>
                  <button className="text-blue-400 hover:text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"></path>
                    </svg>
                  </button>
                  <button className="text-pink-600 hover:text-pink-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
