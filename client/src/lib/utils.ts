import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEventDate(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatEventTime(date: string | Date): string {
  return format(new Date(date), "h:mm a");
}

export function formatEventDateTime(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case "Technical":
      return "bg-blue-500";
    case "Sports":
      return "bg-green-500";
    case "Cultural":
      return "bg-pink-500";
    case "Academic":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
