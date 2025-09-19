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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { NotebookPen, Upload } from "lucide-react";
import { type Job } from "@shared/schema";
import type { UploadResult } from "@uppy/core";

const applicationSchema = z.object({
  jobId: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Location/Postcode is required"),
  cvPath: z.string().optional(),
  experience: z.string().optional(),
  availability: z.object({
    startDate: z.string().optional(),
    preferredHours: z.string().optional(),
  }).optional(),
  additionalInfo: z.string().optional(),
});

interface JobApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

export default function JobApplicationModal({ job, isOpen, onClose }: JobApplicationModalProps) {
  const [cvUploaded, setCvUploaded] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      jobId: job.id,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      cvPath: "",
      experience: "",
      availability: {
        startDate: "",
        preferredHours: "Full-time",
      },
      additionalInfo: "",
    },
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof applicationSchema>) => {
      const response = await apiRequest("POST", "/api/applications", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted successfully!",
        description: "We'll be in touch within 24 hours.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Application failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest("POST", "/api/objects/upload");
      const data = await response.json();
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not prepare file upload.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful[0]) {
      const uploadedFile = result.successful[0];
      const uploadURL = uploadedFile.uploadURL;
      
      try {
        const response = await apiRequest("PUT", "/api/cv-uploads", { cvURL: uploadURL });
        const data = await response.json();
        
        form.setValue("cvPath", data.objectPath);
        setCvUploaded(true);
        toast({
          title: "CV uploaded successfully",
          description: "Your CV has been attached to the application.",
        });
      } catch (error) {
        toast({
          title: "Upload processing failed",
          description: "Please try uploading your CV again.",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = (data: z.infer<typeof applicationSchema>) => {
    if (!privacyConsent) {
      toast({
        title: "Privacy consent required",
        description: "Please agree to the privacy policy to submit your application.",
        variant: "destructive",
      });
      return;
    }
    
    submitApplicationMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="job-application-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" data-testid="application-modal-title">
            Apply for {job.title}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} data-testid="input-email" />
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
                    <Input type="tel" {...field} data-testid="input-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location/Postcode *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Plymouth, PL1 2AB" data-testid="input-location" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload CV/Resume *
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center" data-testid="cv-upload-area">
                {!cvUploaded ? (
                  <>
                    <Upload className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
                    <p className="text-muted-foreground mb-4">Drop your CV here or click to browse</p>
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={10485760}
                      onGetUploadParameters={handleGetUploadParameters}
                      onComplete={handleUploadComplete}
                      buttonClassName="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Choose File
                    </ObjectUploader>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-6 w-6 text-accent" />
                    </div>
                    <p className="text-foreground font-medium mb-2">CV uploaded successfully!</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCvUploaded(false);
                        form.setValue("cvPath", "");
                      }}
                      data-testid="button-change-cv"
                    >
                      Change file
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relevant Experience</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={4}
                      placeholder="Tell us about your relevant experience in healthcare or care work..."
                      data-testid="textarea-experience"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Availability</label>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="availability.startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availability.preferredHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Preferred Hours</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-preferred-hours">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Flexible">Flexible</SelectItem>
                          <SelectItem value="Weekends only">Weekends only</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={3}
                      placeholder="Is there anything else you'd like us to know?"
                      data-testid="textarea-additional-info"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="privacy-consent" 
                checked={privacyConsent}
                onCheckedChange={(checked) => setPrivacyConsent(checked === true)}
                data-testid="checkbox-privacy-consent"
              />
              <label htmlFor="privacy-consent" className="text-sm text-muted-foreground leading-relaxed">
                I agree to the processing of my personal data in accordance with the 
                <a href="#" className="text-primary hover:underline ml-1">Privacy Policy</a> 
                {" "}and consent to being contacted about this application.
              </label>
            </div>
            
            <div className="flex gap-4 pt-4 border-t border-border">
              <Button 
                type="submit" 
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={submitApplicationMutation.isPending}
                data-testid="button-submit-application"
              >
                <NotebookPen className="mr-2 h-5 w-5" />
                {submitApplicationMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel-application"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
