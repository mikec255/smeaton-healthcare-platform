import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Users, Clock, MapPin, Phone, Mail } from "lucide-react";

const referralFormSchema = z.object({
  // Person making the referral
  referrerName: z.string().min(1, "Your name is required"),
  referrerEmail: z.string().email("Valid email is required"),
  referrerPhone: z.string().min(1, "Phone number is required"),
  relationship: z.string().min(1, "Please specify your relationship"),
  
  // Person needing care
  clientName: z.string().min(1, "Client name is required"),
  clientAge: z.string().min(1, "Age is required"),
  clientAddress: z.string().min(1, "Address is required"),
  clientPhone: z.string().optional(),
  
  // Care requirements
  serviceType: z.string().min(1, "Please select a service type"),
  urgency: z.string().min(1, "Please select urgency level"),
  startDate: z.string().optional(),
  currentSupport: z.string().optional(),
  medicalConditions: z.string().optional(),
  mobilityRequirements: z.string().optional(),
  communicationNeeds: z.string().optional(),
  behavioralSupport: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type ReferralFormData = z.infer<typeof referralFormSchema>;

export default function Referral() {
  const { toast } = useToast();

  const form = useForm<ReferralFormData>({
    resolver: zodResolver(referralFormSchema),
    defaultValues: {
      referrerName: "",
      referrerEmail: "",
      referrerPhone: "",
      relationship: "",
      clientName: "",
      clientAge: "",
      clientAddress: "",
      clientPhone: "",
      serviceType: "",
      urgency: "",
      startDate: "",
      currentSupport: "",
      medicalConditions: "",
      mobilityRequirements: "",
      communicationNeeds: "",
      behavioralSupport: "",
      additionalInfo: "",
    },
  });

  const submitReferralMutation = useMutation({
    mutationFn: async (data: ReferralFormData) => {
      const response = await apiRequest("POST", "/api/contact-submissions", {
        type: "referral",
        ...data,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Referral submitted successfully",
        description: "Thank you for your referral. We'll contact you within 2 hours to discuss the next steps.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: "Please try again or contact us directly on 01752 123456.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReferralFormData) => {
    console.log('Form submission triggered with data:', data);
    submitReferralMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="referral-page">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="referral-title">
          Make a Referral
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="referral-subtitle">
          Referrals can be made by individuals, family members, or professionals. Complete this form and we'll arrange a free, no-obligation assessment.
        </p>
      </div>

      {/* Key Information Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center">
          <CardContent className="p-6">
            <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Quick Response</h3>
            <p className="text-sm text-muted-foreground">We'll contact you within 2 hours</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <Heart className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Obligation</h3>
            <p className="text-sm text-muted-foreground">Free assessment with no pressure</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <Users className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Expert Support</h3>
            <p className="text-sm text-muted-foreground">Qualified care coordinators</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Form */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Referral Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Referrer Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Referrer's Information</h3>
                <p className="text-sm text-red-600">Leave blank if you are making a self referral</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="referrerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} data-testid="referrer-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="referrerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email address" {...field} data-testid="referrer-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="referrerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} data-testid="referrer-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Relationship to Client *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="relationship-select">
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="family-member">Family Member</SelectItem>
                            <SelectItem value="friend">Friend</SelectItem>
                            <SelectItem value="social-worker">Social Worker</SelectItem>
                            <SelectItem value="healthcare-professional">Healthcare Professional</SelectItem>
                            <SelectItem value="care-manager">Care Manager</SelectItem>
                            <SelectItem value="self-referral">Self Referral</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Client Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Person Needing Care</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} data-testid="client-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientAge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter age" {...field} data-testid="client-age" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientAddress"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter full address including postcode" 
                            {...field} 
                            data-testid="client-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (if available)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} data-testid="client-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Care Requirements */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Care Requirements</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type of Care Needed *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="service-type-select">
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="short-visits">Short Visits</SelectItem>
                            <SelectItem value="supported-living">Supported Living</SelectItem>
                            <SelectItem value="24-7-care">24/7 Care</SelectItem>
                            <SelectItem value="enablements">Enablements</SelectItem>
                            <SelectItem value="respite-care">Respite Care</SelectItem>
                            <SelectItem value="not-sure">Not Sure - Need Assessment</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgency Level *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="urgency-select">
                              <SelectValue placeholder="Select urgency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate (within 24 hours)</SelectItem>
                            <SelectItem value="urgent">Urgent (within 1 week)</SelectItem>
                            <SelectItem value="standard">Standard (within 2-4 weeks)</SelectItem>
                            <SelectItem value="planning">Planning for future</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="start-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currentSupport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Support in Place</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe any current care arrangements, family support, or other services..."
                            {...field}
                            data-testid="current-support"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicalConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Conditions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please list any relevant medical conditions or diagnoses..."
                            {...field}
                            data-testid="medical-conditions"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mobilityRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobility Support Needed</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Walking aids, wheelchair access, transfers..."
                              {...field}
                              data-testid="mobility-requirements"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="communicationNeeds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Communication Support</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Language needs, hearing/sight support..."
                              {...field}
                              data-testid="communication-needs"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="behavioralSupport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Behavioral Support Needs</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any behavioral challenges or specific support approaches needed..."
                            {...field}
                            data-testid="behavioral-support"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Information</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any other information that would help us understand the care needs..."
                            {...field}
                            data-testid="additional-info"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={submitReferralMutation.isPending}
                data-testid="submit-referral-button"
                onClick={() => {
                  console.log('Submit button clicked');
                  console.log('Form errors:', form.formState.errors);
                  console.log('Form is valid:', form.formState.isValid);
                }}
              >
                {submitReferralMutation.isPending ? "Submitting..." : "Submit Referral"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Need Help with This Form?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>Call us: 0330 165 8880</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>Email: hello@smeatonhealthcare.co.uk</span>
            </div>
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            Our team is available between 8am and 4pm, however for urgent care please call the same number to reach our out of hours team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}