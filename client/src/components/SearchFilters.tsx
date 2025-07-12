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
                <SelectItem value="Mumbai, Maharashtra">Mumbai, Maharashtra</SelectItem>
                <SelectItem value="Delhi, Delhi">Delhi, Delhi</SelectItem>
                <SelectItem value="Bangalore, Karnataka">Bangalore, Karnataka</SelectItem>
                <SelectItem value="Hyderabad, Telangana">Hyderabad, Telangana</SelectItem>
                <SelectItem value="Chennai, Tamil Nadu">Chennai, Tamil Nadu</SelectItem>
                <SelectItem value="Kolkata, West Bengal">Kolkata, West Bengal</SelectItem>
                <SelectItem value="Pune, Maharashtra">Pune, Maharashtra</SelectItem>
                <SelectItem value="Ahmedabad, Gujarat">Ahmedabad, Gujarat</SelectItem>
                <SelectItem value="Jaipur, Rajasthan">Jaipur, Rajasthan</SelectItem>
                <SelectItem value="Surat, Gujarat">Surat, Gujarat</SelectItem>
                <SelectItem value="Lucknow, Uttar Pradesh">Lucknow, Uttar Pradesh</SelectItem>
                <SelectItem value="Kanpur, Uttar Pradesh">Kanpur, Uttar Pradesh</SelectItem>
                <SelectItem value="Nagpur, Maharashtra">Nagpur, Maharashtra</SelectItem>
                <SelectItem value="Indore, Madhya Pradesh">Indore, Madhya Pradesh</SelectItem>
                <SelectItem value="Bhopal, Madhya Pradesh">Bhopal, Madhya Pradesh</SelectItem>
                <SelectItem value="Patna, Bihar">Patna, Bihar</SelectItem>
                <SelectItem value="Vadodara, Gujarat">Vadodara, Gujarat</SelectItem>
                <SelectItem value="Ludhiana, Punjab">Ludhiana, Punjab</SelectItem>
                <SelectItem value="Agra, Uttar Pradesh">Agra, Uttar Pradesh</SelectItem>
                <SelectItem value="Nashik, Maharashtra">Nashik, Maharashtra</SelectItem>
                <SelectItem value="Faridabad, Haryana">Faridabad, Haryana</SelectItem>
                <SelectItem value="Meerut, Uttar Pradesh">Meerut, Uttar Pradesh</SelectItem>
                <SelectItem value="Rajkot, Gujarat">Rajkot, Gujarat</SelectItem>
                <SelectItem value="Varanasi, Uttar Pradesh">Varanasi, Uttar Pradesh</SelectItem>
                <SelectItem value="Aurangabad, Maharashtra">Aurangabad, Maharashtra</SelectItem>
                <SelectItem value="Dhanbad, Jharkhand">Dhanbad, Jharkhand</SelectItem>
                <SelectItem value="Amritsar, Punjab">Amritsar, Punjab</SelectItem>
                <SelectItem value="Navi Mumbai, Maharashtra">Navi Mumbai, Maharashtra</SelectItem>
                <SelectItem value="Allahabad, Uttar Pradesh">Allahabad, Uttar Pradesh</SelectItem>
                <SelectItem value="Ranchi, Jharkhand">Ranchi, Jharkhand</SelectItem>
                <SelectItem value="Howrah, West Bengal">Howrah, West Bengal</SelectItem>
                <SelectItem value="Coimbatore, Tamil Nadu">Coimbatore, Tamil Nadu</SelectItem>
                <SelectItem value="Jabalpur, Madhya Pradesh">Jabalpur, Madhya Pradesh</SelectItem>
                <SelectItem value="Gwalior, Madhya Pradesh">Gwalior, Madhya Pradesh</SelectItem>
                <SelectItem value="Vijayawada, Andhra Pradesh">Vijayawada, Andhra Pradesh</SelectItem>
                <SelectItem value="Jodhpur, Rajasthan">Jodhpur, Rajasthan</SelectItem>
                <SelectItem value="Madurai, Tamil Nadu">Madurai, Tamil Nadu</SelectItem>
                <SelectItem value="Raipur, Chhattisgarh">Raipur, Chhattisgarh</SelectItem>
                <SelectItem value="Kota, Rajasthan">Kota, Rajasthan</SelectItem>
                <SelectItem value="Guwahati, Assam">Guwahati, Assam</SelectItem>
                <SelectItem value="Chandigarh, Chandigarh">Chandigarh, Chandigarh</SelectItem>
                <SelectItem value="Gurgaon, Haryana">Gurgaon, Haryana</SelectItem>
                <SelectItem value="Noida, Uttar Pradesh">Noida, Uttar Pradesh</SelectItem>
                <SelectItem value="Kochi, Kerala">Kochi, Kerala</SelectItem>
                <SelectItem value="Thiruvananthapuram, Kerala">Thiruvananthapuram, Kerala</SelectItem>
                <SelectItem value="Dehradun, Uttarakhand">Dehradun, Uttarakhand</SelectItem>
                <SelectItem value="Bhubaneswar, Odisha">Bhubaneswar, Odisha</SelectItem>
                <SelectItem value="Mysore, Karnataka">Mysore, Karnataka</SelectItem>
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
