import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Phone, Mail, MapPin, Clock, Send, Building2 } from "lucide-react";

const contactFormSchema = z.object({
  type: z.literal("general-contact"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  reason: z.string().min(1, "Reason for contacting is required"),
  message: z.string().min(10, "Please provide more details (minimum 10 characters)"),
});

export default function Contact() {
  const { toast } = useToast();

  const contactForm = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      type: "general-contact",
      name: "",
      email: "",
      phone: "",
      reason: "",
      message: "",
    },
  });

  const submitContactMutation = useMutation({
    mutationFn: async (data: z.infer<typeof contactFormSchema>) => {
      const response = await apiRequest("POST", "/api/contact-submissions", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully",
        description: "We'll get back to you within 2 hours.",
      });
      contactForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof contactFormSchema>) => {
    submitContactMutation.mutate(data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="contact-page">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="contact-title">
          Get In Touch
        </h1>
        <p className="text-xl text-muted-foreground" data-testid="contact-subtitle">
          We're here to help with your care needs or answer any questions
        </p>
      </div>

      
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <Card className="shadow-lg" data-testid="contact-form">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6" data-testid="contact-form-title">
              Send Us a Message
            </h2>
            <Form {...contactForm}>
              <form onSubmit={contactForm.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={contactForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactForm.control}
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
                  control={contactForm.control}
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
                  control={contactForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Contacting *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., Care enquiry, Staff booking, General information"
                          data-testid="input-reason" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Message *</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={6}
                          placeholder="Please provide details about your enquiry, requirements, or any questions you may have..."
                          data-testid="textarea-message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={submitContactMutation.isPending}
                  data-testid="button-submit-contact"
                >
                  <Send className="mr-2 h-5 w-5" />
                  {submitContactMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">Quick Response</h3>
              <p className="text-muted-foreground mb-4">
                We understand that care and support needs can be urgent. Our team monitors enquiries throughout the day 
                and aims to respond to all messages within 2 hours.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-primary font-semibold text-sm">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Urgent? Call us directly for immediate assistance: 0330 165 8880
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Contact Information</h3>
              
              {/* Contact Methods */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="text-center space-y-4">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                    <Phone className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Call Us</h4>
                    <p className="text-muted-foreground text-sm mb-1">Available during business hours</p>
                    <p className="font-medium text-primary">0330 165 8880</p>
                  </div>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="bg-secondary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                    <Mail className="text-secondary h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Email Us</h4>
                    <p className="text-muted-foreground text-sm mb-1">We'll respond within 2 hours</p>
                    <p className="font-medium text-secondary">Hello@smeatonhealthcare.co.uk</p>
                  </div>
                </div>
              </div>

              {/* Branch Locations */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-foreground mb-4 text-center">Our Locations</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Plymouth Branch */}
                  <div className="text-center space-y-2" data-testid="plymouth-branch-compact">
                    <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mx-auto">
                      <Building2 className="text-primary h-5 w-5" />
                    </div>
                    <h5 className="font-semibold text-foreground">Plymouth Branch</h5>
                    <p className="text-primary text-sm font-medium">Head Office</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Second Floor</p>
                      <p>Brunswick House, 1 Brunswick Rd</p>
                      <p>Plymouth PL4 0NP</p>
                    </div>
                  </div>

                  {/* Truro Branch */}
                  <div className="text-center space-y-2" data-testid="truro-branch-compact">
                    <div className="bg-secondary/10 rounded-full w-10 h-10 flex items-center justify-center mx-auto">
                      <Building2 className="text-secondary h-5 w-5" />
                    </div>
                    <h5 className="font-semibold text-foreground">Truro Branch</h5>
                    <p className="text-secondary text-sm font-medium">Regional Office</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Kerns House</p>
                      <p>11 Threemilestone Industrial Estate</p>
                      <p>Threemilestone, Truro TR4 9LE</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}