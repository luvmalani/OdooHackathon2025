import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import { SearchFilters as SearchFiltersType } from "@/types";

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onSearch: () => void;
}

export function SearchFilters({ filters, onFiltersChange, onSearch }: SearchFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFilterChange = (key: keyof SearchFiltersType, value: string) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
    
    // Update active filters for display
    const updatedActiveFilters = [...activeFilters];
    if (value && value !== "All Skills" && value !== "All Locations") {
      if (!updatedActiveFilters.includes(value)) {
        updatedActiveFilters.push(value);
      }
    }
    setActiveFilters(updatedActiveFilters);
  };

  const removeFilter = (filterValue: string) => {
    const updatedActiveFilters = activeFilters.filter(f => f !== filterValue);
    setActiveFilters(updatedActiveFilters);
    
    // Reset the corresponding filter
    if (filterValue === filters.skillCategory) {
      onFiltersChange({ ...filters, skillCategory: "All Skills" });
    } else if (filterValue === filters.location) {
      onFiltersChange({ ...filters, location: "All Locations" });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Discover Talented People</h1>
      
      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by skills, location, or name..."
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>

          {/* Skill Category Filter */}
          <div className="relative">
            <Select
              value={filters.skillCategory}
              onValueChange={(value) => handleFilterChange('skillCategory', value)}
            >
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder="All Skills" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Skills">All Skills</SelectItem>
                <SelectItem value="Programming">Programming</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Languages">Languages</SelectItem>
                <SelectItem value="Music">Music</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="relative">
            <Select
              value={filters.location}
              onValueChange={(value) => handleFilterChange('location', value)}
            >
              <SelectTrigger className="min-w-[150px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Locations">All Locations</SelectItem>
                <SelectItem value="New York">New York</SelectItem>
                <SelectItem value="San Francisco">San Francisco</SelectItem>
                <SelectItem value="London">London</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filter Tags */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {activeFilters.map((filter) => (
              <Badge
                key={filter}
                variant="secondary"
                className="bg-primary text-white"
              >
                {filter}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-auto p-0 text-primary-100 hover:text-white"
                  onClick={() => removeFilter(filter)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
