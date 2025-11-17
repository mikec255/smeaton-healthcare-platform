import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Clock, 
  Shield, 
  Heart,
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Form validation schema
const applicationFormSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(10, "Please enter your full address"),
  
  // Position & Experience
  position: z.string().min(1, "Please select a position you're interested in"),
  experience: z.string().min(10, "Please describe your healthcare experience"),
  availability: z.string().min(5, "Please describe your availability"),
  
  // Legal Requirements
  rightToWork: z.boolean().refine((val) => val === true, {
    message: "You must have the right to work in the UK",
  }),
  transportReliable: z.boolean(),
  
  // Background Checks
  criminalConvictions: z.boolean(),
  criminalDetails: z.string().optional(),
  healthConditions: z.boolean(),
  healthDetails: z.string().optional(),
  
  // Emergency Contact
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
  emergencyContactRelationship: z.string().min(1, "Please specify relationship"),
  
  // Motivation & Additional Information
  motivationStatement: z.string().min(50, "Please provide at least 50 characters explaining why you want to work in healthcare"),
  additionalInfo: z.string().optional(),
  
  // Privacy & Consent
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: "You must consent to data processing to submit your application",
  }),
}).superRefine((data, ctx) => {
  // Conditional validation: require details when checkboxes are true
  if (data.criminalConvictions && (!data.criminalDetails || data.criminalDetails.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please provide details about your criminal convictions",
      path: ["criminalDetails"],
    });
  }
  
  if (data.healthConditions && (!data.healthDetails || data.healthDetails.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please provide details about your health conditions",
      path: ["healthDetails"],
    });
  }
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

export default function RecruitmentApplicationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      position: "",
      experience: "",
      availability: "",
      rightToWork: false,
      transportReliable: false,
      criminalConvictions: false,
      criminalDetails: "",
      healthConditions: false,
      healthDetails: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      motivationStatement: "",
      additionalInfo: "",
      privacyConsent: false,
    },
  });

  // Watch criminal convictions and health conditions for conditional fields
  const watchCriminalConvictions = form.watch("criminalConvictions");
  const watchHealthConditions = form.watch("healthConditions");

  const submitMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      const { privacyConsent, ...applicationData } = data;
      
      return apiRequest('POST', '/api/recruitment-applications', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        applicationData: applicationData
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Application Submitted Successfully",
        description: "We've received your application and will be in touch soon.",
      });
    },
    onError: (error: any) => {
      console.error("Application submission error:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    submitMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardContent className="p-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6" data-testid="success-icon">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4" data-testid="success-title">
                Application Submitted Successfully!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Thank you for your interest in joining Smeaton Healthcare. We've received your application 
                and our recruitment team will review it within 5-7 business days.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2 text-left">
                  <li>• Application review by our recruitment team</li>
                  <li>• Initial contact within 5-7 business days if suitable</li>
                  <li>• Interview process for qualified candidates</li>
                  <li>• Reference checks and final offer</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You should receive a confirmation email shortly. If you have any questions, 
                please contact us at{" "}
                <a href="mailto:recruitment@smeatonhealthcare.co.uk" className="text-blue-600 hover:underline">
                  recruitment@smeatonhealthcare.co.uk
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Join Our Healthcare Team
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Apply to work with Smeaton Healthcare and make a difference in people's lives. 
            Complete the form below to submit your full application.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Please provide your basic contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} data-testid="input-first-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your last name" {...field} data-testid="input-last-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="07123 456789" {...field} data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please enter your full address including postcode" 
                            rows={3} 
                            {...field} 
                            data-testid="textarea-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Position & Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Position & Experience
                </CardTitle>
                <CardDescription>
                  Tell us about the role you're interested in and your background
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position of Interest *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-position">
                            <SelectValue placeholder="Select the position you're interested in" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="home-care-assistant">Home Care Assistant</SelectItem>
                          <SelectItem value="live-in-carer">Live-in Carer</SelectItem>
                          <SelectItem value="support-worker">Support Worker</SelectItem>
                          <SelectItem value="registered-nurse">Registered Nurse</SelectItem>
                          <SelectItem value="senior-carer">Senior Carer</SelectItem>
                          <SelectItem value="team-leader">Team Leader</SelectItem>
                          <SelectItem value="other">Other (please specify in additional info)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Healthcare Experience *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please describe your relevant healthcare experience, including previous roles, training, and qualifications..."
                          rows={4} 
                          {...field} 
                          data-testid="textarea-experience"
                        />
                      </FormControl>
                      <FormDescription>
                        Include any certifications, previous healthcare roles, or relevant training
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your availability, including preferred working hours, days, and any restrictions..."
                          rows={3} 
                          {...field} 
                          data-testid="textarea-availability"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Legal Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Legal Requirements
                </CardTitle>
                <CardDescription>
                  Confirm your eligibility to work in healthcare
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="rightToWork"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-right-to-work"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Right to Work in the UK *
                        </FormLabel>
                        <FormDescription>
                          I confirm that I have the legal right to work in the United Kingdom
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="transportReliable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-transport"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Reliable Transport
                        </FormLabel>
                        <FormDescription>
                          I have access to reliable transportation for work-related travel
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Background Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Background Information
                </CardTitle>
                <CardDescription>
                  Please provide honest information - this helps us ensure proper support and compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="criminalConvictions"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-criminal-convictions"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Criminal Convictions
                          </FormLabel>
                          <FormDescription>
                            I have unspent criminal convictions that I need to declare
                          </FormDescription>
                          <FormMessage />
                        </div>
                      </div>
                      {watchCriminalConvictions && (
                        <FormField
                          control={form.control}
                          name="criminalDetails"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Please provide details</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Please provide details of any unspent criminal convictions..."
                                  rows={3} 
                                  {...field} 
                                  data-testid="textarea-criminal-details"
                                />
                              </FormControl>
                              <FormDescription>
                                Having convictions doesn't automatically exclude you from employment
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="healthConditions"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-health-conditions"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Health Conditions
                          </FormLabel>
                          <FormDescription>
                            I have health conditions that may require workplace adjustments
                          </FormDescription>
                          <FormMessage />
                        </div>
                      </div>
                      {watchHealthConditions && (
                        <FormField
                          control={form.control}
                          name="healthDetails"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Please provide details</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Please describe any health conditions that may require workplace adjustments..."
                                  rows={3} 
                                  {...field} 
                                  data-testid="textarea-health-details"
                                />
                              </FormControl>
                              <FormDescription>
                                This helps us provide appropriate support and make reasonable adjustments
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Emergency Contact
                </CardTitle>
                <CardDescription>
                  Provide details of someone we can contact in case of emergency
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} data-testid="input-emergency-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} data-testid="input-emergency-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="emergencyContactRelationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-emergency-relationship">
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="spouse">Spouse/Partner</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="child">Adult Child</SelectItem>
                            <SelectItem value="friend">Friend</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Motivation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Your Motivation
                </CardTitle>
                <CardDescription>
                  Help us understand why you want to work in healthcare
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="motivationStatement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why do you want to work in healthcare? *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share your passion for healthcare and what motivates you to work in this field..."
                          rows={5} 
                          {...field} 
                          data-testid="textarea-motivation"
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 50 characters - tell us about your passion for caring for others
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Information (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional information you'd like to share about yourself or your application..."
                          rows={3} 
                          {...field} 
                          data-testid="textarea-additional-info"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Privacy Consent */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Privacy & Consent
                </CardTitle>
                <CardDescription>
                  Please confirm your consent to data processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="privacyConsent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-privacy-consent"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Privacy Consent *
                        </FormLabel>
                        <FormDescription className="leading-relaxed">
                          I consent to Smeaton Healthcare processing my personal data for recruitment purposes. 
                          This includes storing my application details, contacting me regarding opportunities, 
                          and conducting background checks if I progress to interview stage. 
                          I understand I can withdraw this consent at any time by contacting{" "}
                          <a href="mailto:recruitment@smeatonhealthcare.co.uk" className="text-blue-600 hover:underline">
                            recruitment@smeatonhealthcare.co.uk
                          </a>
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center pb-8">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || submitMutation.isPending}
                className="min-w-48"
                data-testid="button-submit-application"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}