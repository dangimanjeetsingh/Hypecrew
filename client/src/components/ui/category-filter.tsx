import { categories, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: Category;
  setSelectedCategory: (category: Category) => void;
}

export function CategoryFilter({
  selectedCategory,
  setSelectedCategory,
}: CategoryFilterProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-2">
        <Filter className="h-5 w-5 mr-2 text-muted-foreground" />
        <h2 className="text-lg font-medium">Filter by Category</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
