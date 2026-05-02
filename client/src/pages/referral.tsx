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

  const NAVY = "#05163D";
  const BLUE = "#265597";
  const PINK = "#EF2A86";
  const CREAM = "#FDF7F0";
  const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

  return (
    <div data-testid="referral-page">
      {/* HERO */}
      <section style={{ backgroundColor: NAVY }} className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          {[0,1,2,3].map(i => <div key={i} className="absolute rounded-full border border-white" style={{ width:`${200+i*150}px`,height:`${200+i*150}px`,top:"50%",left:"50%",transform:"translate(-50%,-50%)" }} />)}
        </div>
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4 text-white/50">Referrals</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight" data-testid="referral-title">Make a Referral</h1>
          <div className="mb-4" style={{ ...SCRIPT, fontSize: "clamp(2rem, 4vw, 3rem)", color: PINK }}>let's find the right care.</div>
          <p className="text-white/60 text-base max-w-xl leading-relaxed" data-testid="referral-subtitle">
            Help someone access the care and support they need. Complete this form and we'll arrange a free, no-obligation assessment.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: Clock, label: "Quick Response", desc: "We'll contact you within 2 hours" },
              { icon: Heart, label: "No Obligation", desc: "Free assessment with no pressure" },
              { icon: Users, label: "Expert Support", desc: "Qualified care coordinators" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${PINK}30` }}>
                  <Icon size={16} style={{ color: PINK }} />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{label}</div>
                  <div className="text-white/50 text-xs">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
      <Card className="shadow-sm border-2 border-gray-100 rounded-3xl overflow-hidden">
        <CardHeader className="px-8 pt-8 pb-0">
          <CardTitle className="text-2xl font-extrabold tracking-tight" style={{ color: NAVY }}>Referral Details</CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Referrer Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Your Information</h3>
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
      <div className="mt-6 rounded-2xl border-2 border-gray-100 bg-white p-6">
        <h3 className="text-base font-extrabold mb-4 tracking-tight" style={{ color: NAVY }}>Need help with this form?</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm mb-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Phone size={14} style={{ color: PINK }} />
            <span>Call us: 01752 123456</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Mail size={14} style={{ color: PINK }} />
            <span>referrals@smeatonhealthcare.com</span>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Our care coordinators are available Monday to Friday, 8am–6pm to help with referrals and answer questions.
        </p>
      </div>
      </div>
    </div>
  );
}