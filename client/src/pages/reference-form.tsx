import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ReferenceFormData {
  id: string;
  employeeName: string;
  employeeJobTitle: string | null;
  status: string;
  employmentStartDate: string | null;
  employmentEndDate: string | null;
  jobTitle: string | null;
  reasonForLeaving: string | null;
  wouldReemploy: boolean | null;
  performanceRating: string | null;
  additionalComments: string | null;
}

export default function ReferenceFormPage() {
  const [, params] = useRoute("/reference-form/:token");
  const token = params?.token;
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    employmentStartDate: "",
    employmentEndDate: "",
    jobTitle: "",
    reasonForLeaving: "",
    wouldReemploy: "",
    performanceRating: "",
    additionalComments: "",
  });

  const { data: referenceData, isLoading, error } = useQuery<ReferenceFormData>({
    queryKey: ['/api/reference-form', token],
    queryFn: async () => {
      const response = await fetch(`/api/reference-form/${token}`);
      if (!response.ok) {
        throw new Error('Reference form not found');
      }
      return response.json();
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (referenceData) {
      setFormData({
        employmentStartDate: referenceData.employmentStartDate || "",
        employmentEndDate: referenceData.employmentEndDate || "",
        jobTitle: referenceData.jobTitle || "",
        reasonForLeaving: referenceData.reasonForLeaving || "",
        wouldReemploy: referenceData.wouldReemploy === true ? "yes" : referenceData.wouldReemploy === false ? "no" : "",
        performanceRating: referenceData.performanceRating || "",
        additionalComments: referenceData.additionalComments || "",
      });
    }
  }, [referenceData]);

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', `/api/reference-form/${token}`, {
        ...data,
        wouldReemploy: data.wouldReemploy === "yes" ? true : data.wouldReemploy === "no" ? false : undefined,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Reference Submitted",
        description: "Thank you for providing this reference."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error?.message || "Failed to submit reference. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employmentStartDate || !formData.employmentEndDate) {
      toast({
        title: "Required Fields",
        description: "Please provide employment start and end dates.",
        variant: "destructive"
      });
      return;
    }
    
    submitMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading reference form...</p>
        </div>
      </div>
    );
  }

  if (error || !referenceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Form Not Found</AlertTitle>
              <AlertDescription>
                This reference form link is invalid or has expired. Please contact Smeaton Healthcare if you believe this is an error.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (referenceData.status === "received" || submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Thank You!</h2>
              <p className="text-gray-600">
                {submitted 
                  ? "Your reference has been submitted successfully. Thank you for taking the time to provide this information."
                  : "This reference has already been submitted. Thank you for your time."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Building2 className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Professional Reference Request</h1>
          <p className="text-gray-600 mt-2">Smeaton Healthcare</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reference for {referenceData.employeeName}</CardTitle>
            <CardDescription>
              {referenceData.employeeJobTitle 
                ? `Position applied for: ${referenceData.employeeJobTitle}`
                : "Please complete this form to provide a professional reference."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Alert>
                <AlertDescription>
                  The information you provide will be treated confidentially and used only for employment verification purposes.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employmentStartDate">Employment Start Date *</Label>
                  <Input
                    id="employmentStartDate"
                    type="date"
                    value={formData.employmentStartDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, employmentStartDate: e.target.value }))}
                    required
                    data-testid="input-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentEndDate">Employment End Date *</Label>
                  <Input
                    id="employmentEndDate"
                    type="date"
                    value={formData.employmentEndDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, employmentEndDate: e.target.value }))}
                    required
                    data-testid="input-end-date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title Held</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="Enter the job title held during employment"
                  data-testid="input-job-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reasonForLeaving">Reason for Leaving</Label>
                <Textarea
                  id="reasonForLeaving"
                  value={formData.reasonForLeaving}
                  onChange={(e) => setFormData(prev => ({ ...prev, reasonForLeaving: e.target.value }))}
                  placeholder="Please describe the reason for leaving"
                  rows={3}
                  data-testid="textarea-reason"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Would you re-employ this person?</Label>
                <RadioGroup
                  value={formData.wouldReemploy}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, wouldReemploy: value }))}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="reemploy-yes" data-testid="radio-reemploy-yes" />
                    <Label htmlFor="reemploy-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="reemploy-no" data-testid="radio-reemploy-no" />
                    <Label htmlFor="reemploy-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="performanceRating">Overall Performance Rating</Label>
                <Select
                  value={formData.performanceRating}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, performanceRating: value }))}
                >
                  <SelectTrigger data-testid="select-rating">
                    <SelectValue placeholder="Select a rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="satisfactory">Satisfactory</SelectItem>
                    <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
                    <SelectItem value="unsatisfactory">Unsatisfactory</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalComments">Additional Comments</Label>
                <Textarea
                  id="additionalComments"
                  value={formData.additionalComments}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalComments: e.target.value }))}
                  placeholder="Any additional information you would like to provide about this candidate"
                  rows={4}
                  data-testid="textarea-comments"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitMutation.isPending}
                  data-testid="button-submit"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Reference"
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500">
                By submitting this form, you confirm that the information provided is accurate and truthful.
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          If you have any questions, please contact Smeaton Healthcare.
        </p>
      </div>
    </div>
  );
}
