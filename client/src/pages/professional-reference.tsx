import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { insertProfessionalReferenceSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, User, Building2, Mail, Phone, Star, Clock, Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Extended schema for public reference form with additional fields
const professionalReferenceFormSchema = insertProfessionalReferenceSchema.extend({
  // Reference data stored as JSON - define structure here
  relationship: z.string().min(1, "Please specify your relationship to the candidate"),
  workingPeriodStart: z.string().min(1, "Please specify when you started working together"),
  workingPeriodEnd: z.string().optional(),
  currentlyWorking: z.boolean().optional(),
  candidateRole: z.string().min(1, "Please describe the candidate's role and responsibilities"),
  performanceRating: z.enum(["1", "2", "3", "4", "5"], {
    required_error: "Please select a performance rating"
  }),
  strengthsAchievements: z.string().min(1, "Please describe the candidate's key strengths and achievements"),
  areasImprovement: z.string().optional(),
  wouldRehire: z.enum(["yes", "no", "unsure"], {
    required_error: "Please indicate if you would rehire this candidate"
  }),
  additionalComments: z.string().optional(),
  bestContactTimes: z.string().optional(),
  consentGiven: z.boolean().refine((val) => val === true, {
    message: "You must give consent to submit this reference"
  })
});

type ProfessionalReferenceFormData = z.infer<typeof professionalReferenceFormSchema>;

const relationshipOptions = [
  "Direct Manager/Supervisor",
  "Senior Colleague", 
  "Clinical Lead/Matron",
  "HR Manager",
  "Director/Owner",
  "Team Leader",
  "Mentor/Preceptor",
  "Other Professional Contact"
];

const performanceRatingLabels = {
  "1": "Below Expectations",
  "2": "Meets Some Expectations", 
  "3": "Meets Expectations",
  "4": "Exceeds Expectations",
  "5": "Outstanding Performance"
};

export default function ProfessionalReferencePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<ProfessionalReferenceFormData>({
    resolver: zodResolver(professionalReferenceFormSchema),
    defaultValues: {
      candidateName: "",
      candidateEmail: "",
      positionAppliedFor: "",
      referenceProviderName: "",
      referenceProviderTitle: "",
      referenceProviderCompany: "",
      referenceProviderEmail: "",
      referenceProviderPhone: "",
      relationship: "",
      workingPeriodStart: "",
      workingPeriodEnd: "",
      currentlyWorking: false,
      candidateRole: "",
      performanceRating: undefined,
      strengthsAchievements: "",
      areasImprovement: "",
      wouldRehire: undefined,
      additionalComments: "",
      bestContactTimes: "",
      consentGiven: false
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ProfessionalReferenceFormData) => {
      // Prepare the reference data object
      const referenceData = {
        relationship: data.relationship,
        workingPeriodStart: data.workingPeriodStart,
        workingPeriodEnd: data.workingPeriodEnd,
        currentlyWorking: data.currentlyWorking,
        candidateRole: data.candidateRole,
        overallRating: data.performanceRating,
        strengthsAchievements: data.strengthsAchievements,
        areasImprovement: data.areasImprovement,
        wouldRehire: data.wouldRehire,
        additionalComments: data.additionalComments,
        bestContactTimes: data.bestContactTimes,
        performanceContext: `Performance rated ${data.performanceRating}/5 - ${performanceRatingLabels[data.performanceRating as keyof typeof performanceRatingLabels]}`
      };

      const payload = {
        candidateName: data.candidateName,
        candidateEmail: data.candidateEmail,
        positionAppliedFor: data.positionAppliedFor,
        referenceProviderName: data.referenceProviderName,
        referenceProviderTitle: data.referenceProviderTitle,
        referenceProviderCompany: data.referenceProviderCompany,
        referenceProviderEmail: data.referenceProviderEmail,
        referenceProviderPhone: data.referenceProviderPhone,
        referenceData,
        source: "direct_submission"
      };

      return apiRequest('/api/professional-references', 'POST', payload);
    },
    onSuccess: (data: any) => {
      setReferenceId(data?.id || 'N/A');
      setSubmitSuccess(true);
      toast({
        title: "Reference Submitted Successfully",
        description: "Your professional reference has been submitted and a confirmation email has been sent."
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

  const currentlyWorking = form.watch("currentlyWorking");

  const onSubmit = (data: ProfessionalReferenceFormData) => {
    submitMutation.mutate(data);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof ProfessionalReferenceFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = [
        "candidateName", 
        "candidateEmail", 
        "positionAppliedFor"
      ];
    } else if (currentStep === 2) {
      fieldsToValidate = [
        "referenceProviderName",
        "referenceProviderTitle", 
        "referenceProviderCompany",
        "referenceProviderEmail",
        "referenceProviderPhone"
      ];
    } else if (currentStep === 3) {
      fieldsToValidate = [
        "relationship",
        "workingPeriodStart", 
        "candidateRole"
      ];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const getStarRating = (rating: string) => {
    const numRating = parseInt(rating);
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${i <= numRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    
    return <div className="flex items-center space-x-1">{stars}</div>;
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Reference Submitted Successfully!
                </h1>
                <p className="text-lg text-gray-600">
                  Thank you for providing a professional reference
                </p>
              </div>
              
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Reference ID:</strong> {referenceId}<br/>
                  A confirmation email has been sent to your email address with the reference details.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <div className="space-y-2 text-left">
                  <p>• <strong>Review Process:</strong> Our recruitment team will review your reference as part of the candidate's application</p>
                  <p>• <strong>Follow-up Contact:</strong> We may contact you for additional information if needed</p>
                  <p>• <strong>Confidentiality:</strong> Your reference will be treated with strict confidentiality</p>
                  <p>• <strong>Updates:</strong> The reference will be kept on file for the candidate's application</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t text-xs text-gray-500">
                <p>If you have any questions about this reference, please contact our recruitment team:</p>
                <p className="mt-1">
                  <strong>Email:</strong> recruitment@smeatonhealthcare.co.uk | <strong>Phone:</strong> 01752 123456
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="title-professional-reference">
            Professional Reference Form
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Provide a professional reference for a healthcare candidate
          </p>
          
          {/* Progress indicator */}
          <div className="flex justify-center items-center space-x-4 mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            Step {currentStep} of 4: {
              currentStep === 1 ? "Candidate Information" :
              currentStep === 2 ? "Your Information" :
              currentStep === 3 ? "Working Relationship" :
              "Reference Assessment"
            }
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Step 1: Candidate Information */}
            {currentStep === 1 && (
              <Card className="shadow-lg">
                <CardHeader className="bg-blue-600 text-white">
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Candidate Information</span>
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Please provide information about the person you are referencing
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="candidateName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Candidate Full Name *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter the candidate's full name"
                            data-testid="input-candidate-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="candidateEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Candidate Email Address *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="candidate@example.com"
                            data-testid="input-candidate-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="positionAppliedFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position Applied For *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Care Assistant, Registered Nurse, Support Worker"
                            data-testid="input-position-applied"
                          />
                        </FormControl>
                        <FormDescription>
                          What position is this candidate applying for at Smeaton Healthcare?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 2: Reference Provider Information */}
            {currentStep === 2 && (
              <Card className="shadow-lg">
                <CardHeader className="bg-green-600 text-white">
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Your Information</span>
                  </CardTitle>
                  <CardDescription className="text-green-100">
                    Please provide your contact information and professional details
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="referenceProviderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Full Name *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your full name"
                            data-testid="input-provider-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referenceProviderTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Job Title *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Care Manager, HR Director, Clinical Lead"
                            data-testid="input-provider-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referenceProviderCompany"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company/Organization *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your company or organization name"
                            data-testid="input-provider-company"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="referenceProviderEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Email Address *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="your.email@company.com"
                              data-testid="input-provider-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="referenceProviderPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Phone Number *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="01234 567890"
                              data-testid="input-provider-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bestContactTimes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Best Times to Contact You (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Weekdays 9am-5pm, Monday/Wednesday mornings"
                            data-testid="input-contact-times"
                          />
                        </FormControl>
                        <FormDescription>
                          Let us know when you prefer to be contacted for follow-up questions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Working Relationship */}
            {currentStep === 3 && (
              <Card className="shadow-lg">
                <CardHeader className="bg-purple-600 text-white">
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Working Relationship</span>
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Tell us about your professional relationship with the candidate
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Relationship to the Candidate *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-relationship">
                              <SelectValue placeholder="Select your relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {relationshipOptions.map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="workingPeriodStart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Working Together Since *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., January 2020, 01/2020"
                              data-testid="input-working-start"
                            />
                          </FormControl>
                          <FormDescription>
                            When did you start working with this candidate?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!currentlyWorking && (
                      <FormField
                        control={form.control}
                        name="workingPeriodEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Working Together Until</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., December 2023, 12/2023"
                                data-testid="input-working-end"
                              />
                            </FormControl>
                            <FormDescription>
                              When did your working relationship end?
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="currentlyWorking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="mt-1"
                            data-testid="checkbox-currently-working"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>We are currently working together</FormLabel>
                          <FormDescription>
                            Check this if you are still working with the candidate
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="candidateRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Candidate's Role and Responsibilities *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Please describe the candidate's role, key responsibilities, and the nature of their work under your supervision or alongside you..."
                            rows={4}
                            data-testid="textarea-candidate-role"
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed description of what the candidate did in their role
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 4: Reference Assessment */}
            {currentStep === 4 && (
              <Card className="shadow-lg">
                <CardHeader className="bg-indigo-600 text-white">
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span>Professional Assessment</span>
                  </CardTitle>
                  <CardDescription className="text-indigo-100">
                    Please provide your professional assessment of the candidate
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="performanceRating"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Overall Performance Rating *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-2"
                            data-testid="radio-performance-rating"
                          >
                            {Object.entries(performanceRatingLabels).map(([value, label]) => (
                              <div key={value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                                <RadioGroupItem value={value} id={`rating-${value}`} />
                                <label htmlFor={`rating-${value}`} className="flex-1 cursor-pointer">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{label}</span>
                                    {getStarRating(value)}
                                  </div>
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="strengthsAchievements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key Strengths and Notable Achievements *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Please describe the candidate's key strengths, notable achievements, and what made them stand out in their role..."
                            rows={4}
                            data-testid="textarea-strengths"
                          />
                        </FormControl>
                        <FormDescription>
                          Highlight specific examples of excellent performance, skills, or achievements
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="areasImprovement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Areas for Development (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="If applicable, describe any areas where the candidate could improve or develop further..."
                            rows={3}
                            data-testid="textarea-improvements"
                          />
                        </FormControl>
                        <FormDescription>
                          Constructive feedback about potential areas for growth
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wouldRehire"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Would you rehire this candidate? *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-2"
                            data-testid="radio-would-rehire"
                          >
                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                              <RadioGroupItem value="yes" id="rehire-yes" />
                              <label htmlFor="rehire-yes" className="cursor-pointer flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Yes, I would definitely rehire this candidate</span>
                              </label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                              <RadioGroupItem value="no" id="rehire-no" />
                              <label htmlFor="rehire-no" className="cursor-pointer flex items-center space-x-2">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <span>No, I would not rehire this candidate</span>
                              </label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                              <RadioGroupItem value="unsure" id="rehire-unsure" />
                              <label htmlFor="rehire-unsure" className="cursor-pointer flex items-center space-x-2">
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                                <span>Unsure/It would depend on the circumstances</span>
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalComments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Comments (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Any additional comments or context about the candidate that would be helpful for their application..."
                            rows={3}
                            data-testid="textarea-additional-comments"
                          />
                        </FormControl>
                        <FormDescription>
                          Any other relevant information about the candidate
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="consentGiven"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-blue-50">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="mt-1"
                            data-testid="checkbox-consent"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">
                            Consent and Data Protection *
                          </FormLabel>
                          <FormDescription className="text-sm">
                            I consent to Smeaton Healthcare processing this professional reference for recruitment purposes. 
                            I understand that this reference will be treated confidentially and used solely for evaluating 
                            the candidate's application. I confirm that the information provided is accurate to the best 
                            of my knowledge.
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={submitMutation.isPending}
                  data-testid="button-previous"
                >
                  Previous
                </Button>
              )}
              
              <div className="ml-auto">
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    data-testid="button-next"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-submit-reference"
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit Reference"}
                  </Button>
                )}
              </div>
            </div>

          </form>
        </Form>

        {/* Information panel */}
        <Card className="mt-8 bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Protection & Confidentiality</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Your reference will be treated with strict confidentiality and used solely for recruitment purposes. 
                  All data is processed in accordance with GDPR and UK data protection regulations.
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• References are securely stored and access is limited to authorized recruitment staff</p>
                  <p>• We may contact you for follow-up questions during the application process</p>
                  <p>• Reference data is retained in line with our data retention policy</p>
                  <p>• Contact recruitment@smeatonhealthcare.co.uk for any data-related enquiries</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}