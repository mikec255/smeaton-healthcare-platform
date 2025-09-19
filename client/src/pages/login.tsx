import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, LogIn, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loginUserSchema } from "@shared/schema";
import { z } from "zod";

type LoginFormData = z.infer<typeof loginUserSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return await response.json();
    },
    onSuccess: async (data) => {
      toast({
        title: "Login successful", 
        description: `Welcome back, ${data.user.username}!`,
      });
      
      // Store token in localStorage for Replit compatibility
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      
      // Test authentication and redirect
      setTimeout(async () => {
        try {
          const headers: Record<string, string> = { credentials: "include" };
          if (data.token) {
            headers.Authorization = `Bearer ${data.token}`;
          }
          
          const response = await fetch("/api/auth/me", { 
            credentials: "include",
            headers: data.token ? { Authorization: `Bearer ${data.token}` } : {}
          });
          
          if (response.ok) {
            queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
            setLocation("/admin");
          } else {
            // Fallback redirect
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
              setLocation("/admin");
            }, 500);
          }
        } catch (error) {
          // Fallback redirect
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
            setLocation("/admin");
          }, 500);
        }
      }, 200);
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      setLoginError(error.message || "Login failed. Please try again.");
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setLoginError(null);
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-[#EF2587] rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Login
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sign in to access the Smeaton Healthcare admin panel
          </p>
        </div>

        {/* Login Form */}
        <Card className="border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {loginError && (
                  <Alert variant="destructive">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          {...field}
                          data-testid="input-email"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                          data-testid="input-password"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 bg-[#EF2587] hover:bg-[#d91a73] text-white font-medium"
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-gray-600 dark:text-gray-300 hover:text-[#EF2587]"
              data-testid="link-home"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Support Info */}
        <div className="text-center space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <p>Having trouble accessing your account?</p>
          <p>Contact your manager for support</p>
        </div>
      </div>
    </div>
  );
}