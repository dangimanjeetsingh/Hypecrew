import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event, Category } from "@shared/schema";
import { EventCard } from "@/components/ui/event-card";
import { SearchInput } from "@/components/ui/search-input";
import { CategoryFilter } from "@/components/ui/category-filter";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch events with category and search filters
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ["/api/events", selectedCategory, searchQuery],
    queryFn: async () => {
      const url = new URL("/api/events", window.location.origin);
      
      if (selectedCategory !== "All") {
        url.searchParams.append("category", selectedCategory);
      }
      
      if (searchQuery) {
        url.searchParams.append("search", searchQuery);
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      return response.json();
    },
  });
  
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Discover Events</h1>
      
      {/* Search input */}
      <SearchInput onSearch={setSearchQuery} />
      
      {/* Category filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      
      {/* Event grid */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-destructive mb-4">
            Failed to load events. Please try again later.
          </p>
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No events found. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
}
