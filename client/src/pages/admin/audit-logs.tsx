import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Shield, User, Database, Activity, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { AuditLog } from "@shared/schema";
import { format } from "date-fns";

export default function AuditLogsPage() {
  const [filters, setFilters] = useState({
    userId: "",
    resourceType: "all",
    action: "all",
    startDate: "",
    endDate: "",
  });

  const { data: auditLogs, isLoading, refetch } = useQuery({
    queryKey: ["/api/audit-logs", filters],
    queryFn: async (): Promise<AuditLog[]> => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params.append(key, value);
      });
      
      const response = await fetch(`/api/audit-logs?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch audit logs");
      return response.json();
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      userId: "",
      resourceType: "all",
      action: "all",
      startDate: "",
      endDate: "",
    });
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "view":
      case "view_all_applications":
      case "view_all_contact_submissions":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "create":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "update":
      case "update_application_status":
      case "update_application_notes":
      case "update_contact_submission_status":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "export":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getResourceTypeIcon = (resourceType: string) => {
    switch (resourceType) {
      case "application":
        return <User className="h-4 w-4" />;
      case "contact_submission":
        return <Activity className="h-4 w-4" />;
      case "user":
        return <Shield className="h-4 w-4" />;
      case "audit_log":
        return <Database className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GDPR Audit Logs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track all admin actions involving personal data for compliance purposes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-pink-600" />
          <span className="text-sm text-gray-500">Compliance Dashboard</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Logs
          </CardTitle>
          <CardDescription>
            Filter audit logs by user, resource type, action, or date range
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resource-type">Resource Type</Label>
              <Select value={filters.resourceType} onValueChange={(value) => handleFilterChange("resourceType", value)}>
                <SelectTrigger data-testid="select-resource-type">
                  <SelectValue placeholder="All resource types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All resource types</SelectItem>
                  <SelectItem value="application">Applications</SelectItem>
                  <SelectItem value="contact_submission">Contact Submissions</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="audit_log">Audit Logs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select value={filters.action} onValueChange={(value) => handleFilterChange("action", value)}>
                <SelectTrigger data-testid="select-action">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                data-testid="input-start-date"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => refetch()} 
              size="sm"
              data-testid="button-apply-filters"
            >
              Apply Filters
            </Button>
            <Button 
              onClick={clearFilters} 
              variant="outline" 
              size="sm"
              data-testid="button-clear-filters"
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Audit Log Entries ({auditLogs?.length || 0})</span>
            <Button variant="outline" size="sm" data-testid="button-export-logs">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!auditLogs || auditLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit log entries found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  data-testid={`audit-log-${log.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getResourceTypeIcon(log.resourceType)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getActionBadgeColor(log.action)}>
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                          <span className="text-sm text-gray-500">{log.resourceType}</span>
                          {log.resourceId && (
                            <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              ID: {log.resourceId.slice(0, 8)}...
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {log.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          User ID: {log.userId.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {log.createdAt ? format(new Date(log.createdAt), "MMM dd, yyyy") : "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.createdAt ? format(new Date(log.createdAt), "HH:mm:ss") : "N/A"}
                      </p>
                      {log.ipAddress && (
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          IP: {log.ipAddress}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {log.details && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}