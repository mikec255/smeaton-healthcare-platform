import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Trash2, Edit, Plus, TrendingUp, DollarSign, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { FinanceReport } from "@shared/schema";

const formSchema = z.object({
  reportMonth: z.string().min(1, "Month is required"),
  trainingELearning: z.coerce.number().min(0).default(0),
  trainingPractical: z.coerce.number().min(0).default(0),
  shadowShifts: z.coerce.number().min(0).default(0),
  hoursDays: z.coerce.number().min(0).default(0),
  nightsWakings: z.coerce.number().min(0).default(0),
  nightsSleeping: z.coerce.number().min(0).default(0),
  drivesCarers: z.coerce.number().min(0).default(0),
  millageCarers: z.coerce.number().min(0).default(0),
  expensesCarers: z.coerce.number().min(0).default(0),
  officeOvertime: z.coerce.number().min(0).default(0),
  officeExpense: z.coerce.number().min(0).default(0),
  officeTravel: z.coerce.number().min(0).default(0),
  officeOncall: z.coerce.number().min(0).default(0),
  drivers: z.coerce.number().min(0).default(0),
  holiday: z.coerce.number().min(0).default(0),
  costToEmployer: z.coerce.number().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function FinanceReportsPage() {
  const { toast } = useToast();
  const [editingReport, setEditingReport] = useState<FinanceReport | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  const { data: reports = [], isLoading } = useQuery<FinanceReport[]>({
    queryKey: ["/api/finance-reports"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportMonth: format(new Date(), "yyyy-MM"),
      trainingELearning: 0,
      trainingPractical: 0,
      shadowShifts: 0,
      hoursDays: 0,
      nightsWakings: 0,
      nightsSleeping: 0,
      drivesCarers: 0,
      millageCarers: 0,
      expensesCarers: 0,
      officeOvertime: 0,
      officeExpense: 0,
      officeTravel: 0,
      officeOncall: 0,
      drivers: 0,
      holiday: 0,
      costToEmployer: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return await apiRequest("POST", "/api/finance-reports", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance-reports"] });
      toast({ title: "Success", description: "Finance report created successfully" });
      form.reset();
      setEditingReport(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create report",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: FormValues }) => {
      return await apiRequest("PATCH", `/api/finance-reports/${id}`, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance-reports"] });
      toast({ title: "Success", description: "Finance report updated successfully" });
      form.reset();
      setEditingReport(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update report",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/finance-reports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance-reports"] });
      toast({ title: "Success", description: "Finance report deleted successfully" });
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete report",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    if (editingReport) {
      updateMutation.mutate({ id: editingReport.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (report: FinanceReport) => {
    setEditingReport(report);
    form.reset({
      reportMonth: report.reportMonth,
      trainingELearning: report.trainingELearning || 0,
      trainingPractical: report.trainingPractical || 0,
      shadowShifts: report.shadowShifts || 0,
      hoursDays: report.hoursDays || 0,
      nightsWakings: report.nightsWakings || 0,
      nightsSleeping: report.nightsSleeping || 0,
      drivesCarers: report.drivesCarers || 0,
      millageCarers: report.millageCarers || 0,
      expensesCarers: report.expensesCarers || 0,
      officeOvertime: report.officeOvertime || 0,
      officeExpense: report.officeExpense || 0,
      officeTravel: report.officeTravel || 0,
      officeOncall: report.officeOncall || 0,
      drivers: report.drivers || 0,
      holiday: report.holiday || 0,
      costToEmployer: report.costToEmployer || 0,
    });
  };

  const handleDelete = (id: string) => {
    setReportToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingReport(null);
    form.reset();
  };

  // Prepare chart data
  const chartData = reports
    .map(report => ({
      month: format(new Date(report.reportMonth + "T00:00:00"), "MMM yyyy"),
      carers: (report.trainingELearning || 0) + (report.trainingPractical || 0) + (report.shadowShifts || 0) + 
              (report.hoursDays || 0) + (report.nightsWakings || 0) + (report.nightsSleeping || 0) + 
              (report.drivesCarers || 0) + (report.millageCarers || 0) + (report.expensesCarers || 0),
      office: (report.officeOvertime || 0) + (report.officeExpense || 0) + (report.officeTravel || 0) + (report.officeOncall || 0),
      drivers: report.drivers || 0,
      overall: (report.holiday || 0) + (report.costToEmployer || 0),
      total: ((report.trainingELearning || 0) + (report.trainingPractical || 0) + (report.shadowShifts || 0) + 
             (report.hoursDays || 0) + (report.nightsWakings || 0) + (report.nightsSleeping || 0) + 
             (report.drivesCarers || 0) + (report.millageCarers || 0) + (report.expensesCarers || 0) +
             (report.officeOvertime || 0) + (report.officeExpense || 0) + (report.officeTravel || 0) + (report.officeOncall || 0) +
             (report.drivers || 0) + (report.holiday || 0) + (report.costToEmployer || 0))
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  const sortedReports = [...reports].sort((a, b) => 
    new Date(b.reportMonth).getTime() - new Date(a.reportMonth).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Finance Reports</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Track and analyze monthly financial data across departments
          </p>
        </div>
      </div>

      <Tabs defaultValue="form" className="space-y-4">
        <TabsList data-testid="tabs-finance-reports">
          <TabsTrigger value="form" data-testid="tab-form">
            <Plus className="h-4 w-4 mr-2" />
            {editingReport ? "Edit Report" : "New Report"}
          </TabsTrigger>
          <TabsTrigger value="charts" data-testid="tab-charts">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">
            <Calendar className="h-4 w-4 mr-2" />
            Previous Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-form-title">
                {editingReport ? "Edit Finance Report" : "Create New Finance Report"}
              </CardTitle>
              <CardDescription>
                Enter financial data for a specific month. All fields are optional and default to 0.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="reportMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Month</FormLabel>
                        <FormControl>
                          <Input type="month" {...field} data-testid="input-report-month" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Carers Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Carers Section
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="trainingELearning"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Training E-Learning</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-training-elearning" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="trainingPractical"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Training Practical</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-training-practical" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shadowShifts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shadow Shifts</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-shadow-shifts" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hoursDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hours (Days)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-hours-days" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nightsWakings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nights (Wakings)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-nights-wakings" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nightsSleeping"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nights (Sleeping)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-nights-sleeping" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="drivesCarers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Drives</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-drives-carers" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="millageCarers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mileage</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-millage-carers" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="expensesCarers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expenses</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-expenses-carers" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Office Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Office Section
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="officeOvertime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Overtime</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-office-overtime" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="officeExpense"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expense</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-office-expense" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="officeTravel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Travel</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-office-travel" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="officeOncall"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Oncall</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-office-oncall" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Drivers Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Drivers Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="drivers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Drivers Costs</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-drivers" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Overall Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Overall Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="holiday"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Holiday</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-holiday" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="costToEmployer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost to Employer</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} data-testid="input-cost-to-employer" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-submit-report"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingReport
                        ? "Update Report"
                        : "Create Report"}
                    </Button>
                    {editingReport && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        data-testid="button-cancel-edit"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Department Costs Trend</CardTitle>
                <CardDescription>Monthly cost breakdown by department</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="carers" stroke="#8884d8" name="Carers" />
                      <Line type="monotone" dataKey="office" stroke="#82ca9d" name="Office" />
                      <Line type="monotone" dataKey="drivers" stroke="#ffc658" name="Drivers" />
                      <Line type="monotone" dataKey="overall" stroke="#ff7c7c" name="Overall" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data available for charts</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Monthly Costs</CardTitle>
                <CardDescription>Total expenses over time</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" fill="#8884d8" name="Total Cost" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data available for charts</p>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Department Comparison</CardTitle>
                <CardDescription>Compare costs across departments month by month</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="carers" fill="#8884d8" name="Carers" />
                      <Bar dataKey="office" fill="#82ca9d" name="Office" />
                      <Bar dataKey="drivers" fill="#ffc658" name="Drivers" />
                      <Bar dataKey="overall" fill="#ff7c7c" name="Overall" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data available for charts</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Previous Reports</CardTitle>
              <CardDescription>View, edit, or delete existing finance reports</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : sortedReports.length === 0 ? (
                <p className="text-center text-muted-foreground py-8" data-testid="text-no-reports">
                  No finance reports found. Create your first report to get started.
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Carers Total</TableHead>
                        <TableHead className="text-right">Office Total</TableHead>
                        <TableHead className="text-right">Drivers</TableHead>
                        <TableHead className="text-right">Overall</TableHead>
                        <TableHead className="text-right">Grand Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedReports.map((report) => {
                        const carersTotal = (report.trainingELearning || 0) + (report.trainingPractical || 0) + 
                          (report.shadowShifts || 0) + (report.hoursDays || 0) + (report.nightsWakings || 0) + 
                          (report.nightsSleeping || 0) + (report.drivesCarers || 0) + (report.millageCarers || 0) + 
                          (report.expensesCarers || 0);
                        const officeTotal = (report.officeOvertime || 0) + (report.officeExpense || 0) + 
                          (report.officeTravel || 0) + (report.officeOncall || 0);
                        const overallTotal = (report.holiday || 0) + (report.costToEmployer || 0);
                        const grandTotal = carersTotal + officeTotal + (report.drivers || 0) + overallTotal;

                        return (
                          <TableRow key={report.id} data-testid={`row-report-${report.id}`}>
                            <TableCell className="font-medium" data-testid={`text-month-${report.id}`}>
                              {format(new Date(report.reportMonth + "T00:00:00"), "MMMM yyyy")}
                            </TableCell>
                            <TableCell className="text-right">£{carersTotal.toFixed(2)}</TableCell>
                            <TableCell className="text-right">£{officeTotal.toFixed(2)}</TableCell>
                            <TableCell className="text-right">£{(report.drivers || 0).toFixed(2)}</TableCell>
                            <TableCell className="text-right">£{overallTotal.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-semibold">£{grandTotal.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(report)}
                                  data-testid={`button-edit-${report.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(report.id)}
                                  data-testid={`button-delete-${report.id}`}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the finance report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => reportToDelete && deleteMutation.mutate(reportToDelete)}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
