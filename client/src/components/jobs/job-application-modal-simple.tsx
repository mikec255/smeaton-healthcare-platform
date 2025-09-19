import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, User, Briefcase, Calendar, Car, Clock, Shield, FileCheck } from "lucide-react";
import { type Job } from "@shared/schema";

const simpleApplicationSchema = z.object({
  jobId: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
  
  // Where did you hear about us
  referralSource: z.string().optional(),
  
  // Current employment
  currentlyWorking: z.boolean().optional(),
  currentEmployer: z.string().optional(),
  employmentDuration: z.string().optional(),
  noticePeriod: z.string().optional(),
  
  // Care experience
  experience: z.string().optional(),
  
  // Holiday information
  hasPreBookedHoliday: z.boolean().optional(),
  holidayDates: z.string().optional(),
  
  // Transport
  canDrive: z.boolean().optional(),
  
  // Shift preferences as array of strings
  shiftPreferences: z.array(z.string()).optional(),
  preferredHours: z.string().optional(),
  
  // Certifications
  hasDBS: z.boolean().optional(),
  hasMHCertificate: z.boolean().optional(),
  
  // Privacy consent
  privacyConsent: z.boolean().refine(val => val === true, "You must agree to the privacy policy"),
  
  // Additional info
  additionalInfo: z.string().optional(),
});

interface SimpleJobApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

export default function SimpleJobApplicationModal({ job, isOpen, onClose }: SimpleJobApplicationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof simpleApplicationSchema>>({
    resolver: zodResolver(simpleApplicationSchema),
    defaultValues: {
      jobId: job.id,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      referralSource: "",
      currentlyWorking: undefined,
      currentEmployer: "",
      employmentDuration: "",
      noticePeriod: "",
      experience: "",
      hasPreBookedHoliday: undefined,
      holidayDates: "",
      canDrive: undefined,
      shiftPreferences: [],
      preferredHours: "",
      hasDBS: undefined,
      hasMHCertificate: undefined,
      privacyConsent: false,
      additionalInfo: "",
    },
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof simpleApplicationSchema>) => {
      const response = await apiRequest("POST", "/api/applications", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted successfully!",
        description: "We'll be in touch within 24 hours.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      console.error("Application submission error:", error);
      toast({
        title: "Application failed",
        description: "Please try again or contact us directly at hello@smeatonhealthcare.co.uk.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof simpleApplicationSchema>) => {
    submitApplicationMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="job-application-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2" data-testid="application-modal-title">
            <Mail className="h-6 w-6" />
            Apply for {job.title}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-first-name" />
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
                        <Input {...field} data-testid="input-last-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Plymouth, PL1 2AB" data-testid="input-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telephone No. *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-phone" />
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
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Referral Source */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="referralSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Where did you hear about us?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-referral-source">
                          <SelectValue placeholder="Select how you heard about us" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="social-media">Social Media</SelectItem>
                        <SelectItem value="job-board">Job Board</SelectItem>
                        <SelectItem value="referral">Referral from friend/family</SelectItem>
                        <SelectItem value="recruitment-agency">Recruitment Agency</SelectItem>
                        <SelectItem value="advertisement">Advertisement</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Current Employment */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Current Employment</h3>
              </div>

              <FormField
                control={form.control}
                name="currentlyWorking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Are you currently working?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === 'true')}
                        value={field.value === undefined ? '' : field.value.toString()}
                        className="flex gap-6"
                        data-testid="radio-currently-working"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="working-yes" />
                          <label htmlFor="working-yes">Yes</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="working-no" />
                          <label htmlFor="working-no">No</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('currentlyWorking') === true && (
                <>
                  <FormField
                    control={form.control}
                    name="currentEmployer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Where do you work?</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-current-employer" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employmentDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How long have you worked there for?</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 2 years, 6 months" data-testid="input-employment-duration" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="noticePeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What is your Notice Period?</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 1 week, 1 month" data-testid="input-notice-period" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            {/* Care Experience */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Please state your Care Experience below:</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe your experience in care work, healthcare, or related fields..."
                        data-testid="textarea-experience"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Holiday Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Holiday Information</h3>
              </div>

              <FormField
                control={form.control}
                name="hasPreBookedHoliday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Do you have any pre-booked Holiday?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === 'true')}
                        value={field.value === undefined ? '' : field.value.toString()}
                        className="flex gap-6"
                        data-testid="radio-pre-booked-holiday"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="holiday-yes" />
                          <label htmlFor="holiday-yes">Yes</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="holiday-no" />
                          <label htmlFor="holiday-no">No</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('hasPreBookedHoliday') === true && (
                <FormField
                  control={form.control}
                  name="holidayDates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>When is this?</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Please specify the dates" data-testid="input-holiday-dates" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Transport */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Transport</h3>
              </div>

              <FormField
                control={form.control}
                name="canDrive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Do you drive?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === 'true')}
                        value={field.value === undefined ? '' : field.value.toString()}
                        className="flex gap-6"
                        data-testid="radio-can-drive"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="drive-yes" />
                          <label htmlFor="drive-yes">Yes</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="drive-no" />
                          <label htmlFor="drive-no">No</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Shift Preferences */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Shift Preferences</h3>
              </div>

              <FormField
                control={form.control}
                name="shiftPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What are your shift preferences? (Select all that apply)</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-3" data-testid="checkboxes-shift-preferences">
                        {['Early', 'Late', 'Long Days', 'Nights'].map((shift) => (
                          <div key={shift} className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value?.includes(shift) || false}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current, shift]);
                                } else {
                                  field.onChange(current.filter(s => s !== shift));
                                }
                              }}
                            />
                            <label className="text-sm">{shift}</label>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How many hours are you wanting to work?</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 20 hours per week, Full-time" data-testid="input-preferred-hours" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Certifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Certifications</h3>
              </div>

              <FormField
                control={form.control}
                name="hasDBS"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Do you have a DBS on Update Service?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === 'true')}
                        value={field.value === undefined ? '' : field.value.toString()}
                        className="flex gap-6"
                        data-testid="radio-has-dbs"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="dbs-yes" />
                          <label htmlFor="dbs-yes">Yes</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="dbs-no" />
                          <label htmlFor="dbs-no">No</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasMHCertificate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Do you have a valid M&H Certificate?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === 'true')}
                        value={field.value === undefined ? '' : field.value.toString()}
                        className="flex gap-6"
                        data-testid="radio-has-mh-certificate"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="mh-yes" />
                          <label htmlFor="mh-yes">Yes</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="mh-no" />
                          <label htmlFor="mh-no">No</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Anything else you'd like us to know?"
                        data-testid="textarea-additional-info"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Privacy Consent */}
            <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Privacy Notice</h3>
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                By submitting this form, you agree that Smeaton Healthcare may collect and process the personal information you provide for the purpose of considering your application and assessing your suitability for employment. Your information will be used only for recruitment purposes and will not be shared outside Smeaton Healthcare unless required by law. We will store your information securely and retain it only for as long as necessary in line with our recruitment and data protection policies. You have the right to request access to, correction of, or deletion of your personal data at any time by contacting us on 0330 165 8880.
              </p>
              
              <FormField
                control={form.control}
                name="privacyConsent"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-privacy-consent"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          I confirm that I have read and understood this Privacy Notice and consent to Smeaton Healthcare processing my information for recruitment purposes. *
                        </FormLabel>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="sm:w-auto w-full"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitApplicationMutation.isPending}
                className="sm:w-auto w-full"
                data-testid="button-submit-application"
              >
                {submitApplicationMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}