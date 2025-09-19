import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

interface JobFiltersProps {
  onFilterChange: (filters: {
    location: string;
    type: string;
    salaryRange: string;
  }) => void;
}

export default function JobFilters({ onFilterChange }: JobFiltersProps) {
  const [location, setLocation] = useState("all");
  const [type, setType] = useState("all");
  const [salaryRange, setSalaryRange] = useState("all");

  useEffect(() => {
    onFilterChange({ location, type, salaryRange });
  }, [location, type, salaryRange, onFilterChange]);

  const clearFilters = () => {
    setLocation("all");
    setType("all");
    setSalaryRange("all");
  };

  return (
    <Card className="shadow-lg mb-8" data-testid="job-filters">
      <CardContent className="p-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger data-testid="filter-location">
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                <SelectItem value="plymouth">Plymouth</SelectItem>
                <SelectItem value="cornwall">Cornwall</SelectItem>
                <SelectItem value="devon">Devon</SelectItem>
                <SelectItem value="sherford">Sherford</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Position Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger data-testid="filter-type">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="care-at-home">Care at Home</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Salary Range</Label>
            <Select value={salaryRange} onValueChange={setSalaryRange}>
              <SelectTrigger data-testid="filter-salary">
                <SelectValue placeholder="All salaries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All salaries</SelectItem>
                <SelectItem value="11-13">£11-£13 per hour</SelectItem>
                <SelectItem value="800-1000">£800-£1000 per week</SelectItem>
                <SelectItem value="25000-30000">£25,000-£30,000 per year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end gap-2">
            <Button 
              onClick={clearFilters} 
              variant="outline" 
              className="flex-1"
              data-testid="button-clear-filters"
            >
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
