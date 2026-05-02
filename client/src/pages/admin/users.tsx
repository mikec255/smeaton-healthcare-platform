import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, UserX, UserCheck, ArrowLeft, Shield, User as UserIcon } from "lucide-react";
import { type User, type InsertUser, insertUserSchema } from "@shared/schema";
import { z } from "zod";

const createUserSchema = insertUserSchema.omit({ password: true, passwordToken: true, tokenExpiresAt: true }).extend({
  permissions: z.object({
    overview: z.boolean().optional(),
    recruitment: z.boolean().optional(),
    customerRelations: z.boolean().optional(),
    feedback: z.boolean().optional(),
    tools: z.boolean().optional(),
    resources: z.boolean().optional(),
    system: z.boolean().optional(),
  }).optional(),
});

const editUserSchema = z.object({
  username: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "superadmin"]),
  permissions: z.object({
    overview: z.boolean().optional(),
    recruitment: z.boolean().optional(),
    customerRelations: z.boolean().optional(),
    feedback: z.boolean().optional(),
    tools: z.boolean().optional(),
    resources: z.boolean().optional(),
    system: z.boolean().optional(),
  }).optional(),
  isActive: z.boolean(),
});

type CreateUserForm = z.infer<typeof createUserSchema>;
type EditUserForm = z.infer<typeof editUserSchema>;

export default function UsersAdmin() {
  const [, setLocation] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deactivateUserId, setDeactivateUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication and superadmin access
  const { data: authUser, isLoading: authLoading, error: authError } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && (!authUser || authError)) {
      setLocation("/login");
    }
  }, [authUser, authLoading, authError, setLocation]);

  // Redirect to admin if not superadmin
  useEffect(() => {
    if (authUser?.user && authUser.user.role !== "superadmin") {
      setLocation("/admin");
    }
  }, [authUser, setLocation]);

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!authUser?.user && authUser.user.role === "superadmin",
  });

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      role: "admin",
      permissions: {
        overview: true,
        recruitment: true,
        customerRelations: true,
        feedback: true,
        tools: false,
        resources: false,
        system: false,
      },
      isActive: true,
    },
  });

  const editForm = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: "",
      role: "admin",
      permissions: {
        overview: true,
        recruitment: true,
        customerRelations: true,
        feedback: true,
        tools: false,
        resources: false,
        system: false,
      },
      isActive: true,
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: Omit<CreateUserForm, "confirmPassword">) => {
      return await apiRequest("POST", "/api/users", data);
    },
    onSuccess: () => {
      toast({
        title: "User created successfully",
        description: "The new admin user has been added.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setShowCreateModal(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create user",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertUser> }) => {
      return await apiRequest("PUT", `/api/users/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "User updated successfully",
        description: "The user has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditingUser(null);
      setShowEditModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update user",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "User deleted successfully",
        description: "The user has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setDeactivateUserId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete user",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateUserForm) => {
    createUserMutation.mutate(data);
  };

  const onEditSubmit = (data: EditUserForm) => {
    if (!editingUser) return;
    updateUserMutation.mutate({
      id: editingUser.id,
      data: data,
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    editForm.reset({
      username: user.username,
      role: user.role as "admin" | "superadmin",
      permissions: user.permissions || {
        overview: true,
        recruitment: true,
        customerRelations: true,
        feedback: true,
        tools: false,
        resources: false,
        system: false,
      },
      isActive: user.isActive ?? true,
    });
    setShowEditModal(true);
  };

  const handleToggleUserStatus = (user: User) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { isActive: !user.isActive },
    });
  };

  // Show loading while checking authentication
  if (authLoading || !authUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-12 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6" data-testid="users-admin-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create and manage admin users with role-based access control
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-pink-600" />
            <span className="text-sm text-gray-500">User Management</span>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            data-testid="button-create-user"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          {user.role === "superadmin" ? (
                            <Shield className="h-4 w-4 text-primary" />
                          ) : (
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium" data-testid={`user-email-${user.id}`}>
                            {user.username}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.role === "superadmin" ? "destructive" : "secondary"}
                        data-testid={`user-role-${user.id}`}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.isActive ? "default" : "outline"}
                        data-testid={`user-status-${user.id}`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`user-created-${user.id}`}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          disabled={updateUserMutation.isPending}
                          data-testid={`button-edit-${user.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.id !== authUser.user.id && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleUserStatus(user)}
                              disabled={updateUserMutation.isPending}
                              data-testid={`button-toggle-${user.id}`}
                            >
                              {user.isActive ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeactivateUserId(user.id)}
                              disabled={deleteUserMutation.isPending}
                              data-testid={`button-delete-${user.id}`}
                              className="text-destructive hover:text-destructive"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                        {user.id === authUser.user.id && (
                          <Badge variant="outline">Current User</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Admin User</DialogTitle>
            <DialogDescription>
              Create a new admin user. They will receive an email with a secure link to create their own password.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@smeatonhealthcare.co.uk"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Auto-set permissions based on role
                        if (value === "superadmin") {
                          form.setValue("permissions", {
                            overview: true,
                            recruitment: true,
                            customerRelations: true,
                            feedback: true,
                            tools: true,
                            resources: true,
                            system: true,
                          });
                        }
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-role">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="superadmin">Superadmin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Permissions Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Admin Section Access</Label>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="permissions.overview"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={form.watch("role") === "superadmin"}
                            data-testid="checkbox-overview"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Overview</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permissions.recruitment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={form.watch("role") === "superadmin"}
                            data-testid="checkbox-recruitment"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Recruitment</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permissions.customerRelations"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={form.watch("role") === "superadmin"}
                            data-testid="checkbox-customer-relations"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Customer Relations</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permissions.feedback"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={form.watch("role") === "superadmin"}
                            data-testid="checkbox-feedback"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Feedback</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permissions.tools"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={form.watch("role") === "superadmin"}
                            data-testid="checkbox-tools"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Tools & Compliance</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permissions.resources"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={form.watch("role") === "superadmin"}
                            data-testid="checkbox-resources"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Resources</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permissions.system"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={true}
                            data-testid="checkbox-system"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">System (Superadmin Only)</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Superadmin users automatically have access to all sections
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  data-testid="button-create"
                >
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@smeatonhealthcare.co.uk"
                        data-testid="edit-input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Auto-set permissions based on role
                        if (value === "superadmin") {
                          editForm.setValue("permissions", {
                            overview: true,
                            recruitment: true,
                            customerRelations: true,
                            feedback: true,
                            tools: true,
                            resources: true,
                            system: true,
                          });
                        }
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="edit-select-role">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="superadmin">Superadmin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Permissions Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Admin Section Access</Label>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={editForm.control}
                    name="permissions.overview"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={editForm.watch("role") === "superadmin"}
                            data-testid="edit-checkbox-overview"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Overview</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="permissions.recruitment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={editForm.watch("role") === "superadmin"}
                            data-testid="edit-checkbox-recruitment"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Recruitment</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="permissions.customerRelations"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={editForm.watch("role") === "superadmin"}
                            data-testid="edit-checkbox-customer-relations"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Customer Relations</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="permissions.feedback"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={editForm.watch("role") === "superadmin"}
                            data-testid="edit-checkbox-feedback"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Feedback</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="permissions.tools"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={editForm.watch("role") === "superadmin"}
                            data-testid="edit-checkbox-tools"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Tools & Compliance</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="permissions.resources"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={editForm.watch("role") === "superadmin"}
                            data-testid="edit-checkbox-resources"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Resources</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="permissions.system"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={true}
                            data-testid="edit-checkbox-system"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">System (Superadmin Only)</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Superadmin users automatically have access to all sections
                </p>
              </div>

              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value ? "true" : "false"}>
                      <FormControl>
                        <SelectTrigger data-testid="edit-select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  data-testid="button-edit-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                  data-testid="button-edit-save"
                >
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deactivateUserId} onOpenChange={() => setDeactivateUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deactivateUserId && deleteUserMutation.mutate(deactivateUserId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}