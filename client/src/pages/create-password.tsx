import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, CheckCircle, XCircle } from 'lucide-react';

const CreatePasswordPage = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const [token, setToken] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userInfo, setUserInfo] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Extract token from URL
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const tokenParam = urlParams.get('token');
    
    if (!tokenParam) {
      setError('No password creation token found in URL');
      setLoading(false);
      return;
    }
    
    setToken(tokenParam);
    
    // Validate token and get user info
    const validateToken = async () => {
      try {
        console.log('Validating token:', tokenParam);
        const response = await fetch(`/api/auth/password-creation-info/${tokenParam}`);
        const data = await response.json();
        console.log('Token validation response:', response.status, data);
        
        if (!response.ok) {
          throw new Error(data.message || 'Invalid or expired token');
        }
        
        setUserInfo(data);
      } catch (err) {
        console.error('Token validation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to validate token');
      } finally {
        setLoading(false);
      }
    };
    
    validateToken();
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both password fields match",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/auth/create-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create password');
      }
      
      setCompleted(true);
      toast({
        title: "Password created successfully!",
        description: "You can now log in with your new password",
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/admin');
      }, 3000);
      
    } catch (err) {
      toast({
        title: "Error creating password",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Invalid Link</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button 
              onClick={() => navigate('/admin')}
              variant="outline"
              data-testid="button-back-to-login"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600">Password Created!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your password has been created successfully. You'll be redirected to the login page in a few seconds.
            </p>
            <Button 
              onClick={() => navigate('/admin')}
              data-testid="button-go-to-login"
            >
              Go to Login Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Create Your Password</CardTitle>
          {userInfo && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome <strong>{userInfo.username}</strong> ({userInfo.role})
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                required
                minLength={8}
                data-testid="input-password"
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters long
              </p>
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                minLength={8}
                data-testid="input-confirm-password"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitting || !password || !confirmPassword}
              data-testid="button-create-password"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Password...
                </>
              ) : (
                'Create Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePasswordPage;