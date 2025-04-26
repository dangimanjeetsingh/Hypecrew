import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Event, categories, insertEventSchema } from "@shared/schema";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Create a schema for the form
const formSchema = insertEventSchema.extend({
  // Convert string inputs to Date objects
  date: z.coerce.date(),
  endDate: z.coerce.date().optional(),
}).superRefine((data, ctx) => {
  if (data.endDate && data.date > data.endDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date must be after start date",
      path: ["endDate"],
    });
  }
});

interface EventFormProps {
  event?: Event;
  isEditing?: boolean;
}

export function EventForm({ event, isEditing = false }: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Initialize the form with event data if editing
  const defaultValues = event
    ? {
        ...event,
        date: new Date(event.date),
        endDate: event.endDate ? new Date(event.endDate) : undefined,
      }
    : {
        title: "",
        description: "",
        venue: "",
        date: new Date(),
        endDate: undefined,
        imageUrl: "",
        category: "Technical",
        featured: false,
        organizer: "",
      };
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // If we have a date object, ensure it's properly serialized
      const formattedValues = {
        ...values,
        date: values.date instanceof Date ? values.date.toISOString() : values.date,
        endDate: values.endDate instanceof Date ? values.endDate.toISOString() : values.endDate,
      };
      
      // Check if we need to send the uploaded file
      if (values.imageFile && values.imageFile instanceof File) {
        // If image was uploaded directly, we already set the dataURL in the imageUrl field
        // Just let the backend know it's a base64 encoded image
        if (values.imageUrl.startsWith('data:')) {
          console.log("Using uploaded image data URL");
        } else {
          console.log("Using image URL");
        }
      } 
      
      if (isEditing && event) {
        // Update existing event
        await apiRequest("PATCH", `/api/events/${event.id}`, formattedValues);
        toast({
          title: "Event updated",
          description: "The event has been updated successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/events"] });
        queryClient.invalidateQueries({ queryKey: [`/api/events/${event.id}`] });
      } else {
        // Create new event
        await apiRequest("POST", "/api/events", formattedValues);
        toast({
          title: "Event created",
          description: "The event has been created successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      }
      
      // Navigate back to admin events page
      navigate("/admin/manage-events");
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: isEditing ? "Failed to update event" : "Failed to create event",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter event title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your event" 
                  className="min-h-32" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="imageFile"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Upload Event Image</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onChange(file);
                        
                        // Create a temporary URL for preview
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          if (e.target?.result) {
                            // Set the image URL to the data URL for preview
                            form.setValue('imageUrl', e.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    {...fieldProps}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload an image for your event (JPG, PNG, GIF)
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="Enter image URL" {...field} />
                </FormControl>
                <p className="text-sm text-muted-foreground mt-1">
                  Alternatively, enter a URL for your event image. Try using Unsplash for free high-quality images.
                </p>
                {field.value && (
                  <div className="mt-2 rounded-md overflow-hidden w-full max-w-xs">
                    <img 
                      src={field.value} 
                      alt="Image preview" 
                      className="w-full h-auto object-cover"
                      onError={() => {
                        // Clear invalid image URLs
                        if (!field.value.startsWith('data:')) {
                          field.onChange('');
                        }
                      }}
                    />
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date & Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP HH:mm")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          const newDate = new Date(field.value);
                          newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                          field.onChange(newDate);
                        }
                      }}
                      initialFocus
                    />
                    <div className="p-3 border-t border-border">
                      <Input
                        type="time"
                        value={format(field.value || new Date(), "HH:mm")}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":").map(Number);
                          const newDate = new Date(field.value || new Date());
                          newDate.setHours(hours, minutes);
                          field.onChange(newDate);
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date & Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP HH:mm")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          const newDate = new Date(field.value || new Date());
                          newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                          field.onChange(newDate);
                        }
                      }}
                      initialFocus
                    />
                    <div className="p-3 border-t border-border">
                      <Input
                        type="time"
                        value={field.value ? format(field.value, "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":").map(Number);
                          const newDate = new Date(field.value || new Date());
                          newDate.setHours(hours, minutes);
                          field.onChange(newDate);
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="venue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Venue</FormLabel>
              <FormControl>
                <Input placeholder="Enter venue name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="organizer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organizer</FormLabel>
              <FormControl>
                <Input placeholder="Enter organizer name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.filter(c => c !== "All").map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Feature this event</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Featured events will be displayed prominently on the homepage
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end pt-5">
          <Button
            type="button"
            variant="outline"
            className="mr-3"
            onClick={() => navigate("/admin/manage-events")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Event" : "Create Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
