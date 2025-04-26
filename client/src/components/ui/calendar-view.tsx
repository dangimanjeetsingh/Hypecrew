import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Event } from "@shared/schema";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatEventDate, formatEventTime } from "@/lib/utils";
import { CalendarIcon, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

interface CalendarViewProps {
  events: Event[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });
  }, [currentMonth]);
  
  // Get events for the selected date
  const eventsOnSelectedDate = useMemo(() => {
    return events.filter(event => 
      isSameDay(new Date(event.date), selectedDate)
    );
  }, [events, selectedDate]);
  
  // Get a map of dates with events
  const datesWithEvents = useMemo(() => {
    const map = new Map<number, number>();
    events.forEach(event => {
      const date = new Date(event.date).getDate();
      const count = map.get(date) || 0;
      map.set(date, count + 1);
    });
    return map;
  }, [events]);
  
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={goToPreviousMonth} 
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={goToNextMonth} 
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Previous month days */}
              {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, index) => (
                <div key={`prev-${index}`} className="text-sm text-muted-foreground/50 py-2">
                  {/* Calculate the date from previous month */}
                  {new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    -startOfMonth(currentMonth).getDay() + index + 1
                  ).getDate()}
                </div>
              ))}
              
              {/* Current month days */}
              {daysInMonth.map((day) => {
                const dayOfMonth = day.getDate();
                const hasEvents = datesWithEvents.has(dayOfMonth);
                const isSelected = isSameDay(day, selectedDate);
                
                return (
                  <div key={day.toString()} className="relative">
                    <button
                      className={cn(
                        "text-sm w-8 h-8 mx-auto flex items-center justify-center rounded-full",
                        isSelected && "bg-primary text-primary-foreground font-semibold",
                        !isSelected && hasEvents && "font-medium",
                        !isSelected && !hasEvents && "text-foreground hover:bg-muted"
                      )}
                      onClick={() => setSelectedDate(day)}
                    >
                      {dayOfMonth}
                    </button>
                    {hasEvents && !isSelected && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                    )}
                  </div>
                );
              })}
              
              {/* Next month days */}
              {Array.from({ 
                length: 42 - (daysInMonth.length + startOfMonth(currentMonth).getDay()) 
              }).map((_, index) => (
                <div key={`next-${index}`} className="text-sm text-muted-foreground/50 py-2">
                  {/* Calculate the date from next month */}
                  {index + 1}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-3">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              Events on {format(selectedDate, "MMMM d, yyyy")}
            </h2>
            
            <div className="space-y-4">
              {eventsOnSelectedDate.length > 0 ? (
                eventsOnSelectedDate.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="border-l-4 border-primary pl-4 bg-muted/50 p-4 rounded-r-lg hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatEventTime(event.date)} - {event.endDate && formatEventTime(event.endDate)}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No events on this day</h3>
                  <p className="text-muted-foreground mt-1">
                    Select another date or browse all events
                  </p>
                  <Link href="/">
                    <Button variant="outline" className="mt-4">
                      Browse All Events
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
