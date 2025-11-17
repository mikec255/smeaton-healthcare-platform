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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Shield, 
  Heart,
  FileText,
  CheckCircle,
  GraduationCap,
  CreditCard,
  Users,
  Calendar,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Employment history schema
const employmentHistorySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  jobTitle: z.string().min(2, "Job title is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  currentlyEmployed: z.boolean().default(false),
  reasonForLeaving: z.string().optional(),
  managerName: z.string().optional(),
  managerPhone: z.string().optional(),
  managerEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
});

// Education record schema
const educationSchema = z.object({
  qualificationType: z.string().min(1, "Qualification type is required"),
  qualificationName: z.string().min(2, "Qualification name is required"),
  institution: z.string().optional(),
  yearObtained: z.string().optional(),
});

// Reference schema
const referenceSchema = z.object({
  referenceType: z.enum(["Professional", "Character"]),
  fullName: z.string().min(2, "Full name is required"),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  relationship: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  applicantJobTitle: z.string().optional(),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
});

// Complete form validation schema
const applicationFormSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(10, "Please enter your full address"),
  postcode: z.string().min(5, "Please enter a valid postcode"),
  nationalInsuranceNumber: z.string().optional(),
  gender: z.string().min(1, "Please select your gender"),
  maritalStatus: z.string().optional(),
  ethnicOrigin: z.string().optional(),
  nationality: z.string().min(1, "Nationality is required"),
  
  // Next of Kin
  nextOfKinName: z.string().min(2, "Next of kin name is required"),
  nextOfKinPhone: z.string().min(10, "Next of kin phone is required"),
  nextOfKinAddress: z.string().min(10, "Next of kin address is required"),
  
  // Payroll/Bank Details
  payrollType: z.enum(["PAYE", "Self-employed"]),
  bankName: z.string().min(2, "Bank name is required"),
  accountType: z.string().min(1, "Account type is required"),
  accountName: z.string().min(2, "Account name is required"),
  accountNumber: z.string().min(8, "Please enter a valid account number"),
  sortCode: z.string().min(6, "Please enter a valid sort code"),
  
  // Worker Profile
  workerTypes: z.array(z.string()).min(1, "Please select at least one worker type"),
  travelMethod: z.string().min(1, "Please select your travel method"),
  travelDistance: z.string().min(1, "Please select travel distance"),
  leadSkills: z.array(z.string()).min(1, "Please select at least one skill area"),
  shiftPreferences: z.string().min(1, "Please select shift preference"),
  availableDays: z.array(z.string()).min(1, "Please select at least one available day"),
  
  // Employment History
  employmentHistory: z.array(employmentHistorySchema).min(1, "Please add at least one employment record"),
  
  // Education
  education: z.array(educationSchema).min(1, "Please add at least one education record"),
  
  // Health & Compliance
  medicalConditions: z.array(z.string()),
  medicationAffectsDriving: z.boolean(),
  medicalAffectsNightWork: z.boolean(),
  hasCriminalConvictions: z.boolean(),
  convictionDetails: z.string().optional(),
  dbsConsent: z.boolean().refine((val) => val === true, {
    message: "You must consent to DBS check to proceed",
  }),
  workingTimeDirectiveOptOut: z.boolean(),
  
  // Data Protection
  dataProtectionConsent: z.boolean().refine((val) => val === true, {
    message: "You must consent to data protection to submit your application",
  }),
  dataTypesConsented: z.array(z.string()).min(1, "Please select at least one data type"),
  dataHoldingConsent: z.boolean().refine((val) => val === true, {
    message: "You must consent to data holding to submit your application",
  }),
  
  // References
  references: z.array(referenceSchema).min(2, "Please add at least 2 references").max(3, "Maximum 3 references allowed"),
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

const STEPS = [
  { id: 1, title: "Personal Information", icon: User },
  { id: 2, title: "Next of Kin", icon: Users },
  { id: 3, title: "Payroll & Bank", icon: CreditCard },
  { id: 4, title: "Worker Profile", icon: Briefcase },
  { id: 5, title: "Employment History", icon: Calendar },
  { id: 6, title: "Education", icon: GraduationCap },
  { id: 7, title: "Health & Compliance", icon: Heart },
  { id: 8, title: "Data Protection", icon: Shield },
  { id: 9, title: "References", icon: FileText },
];

export default function RecruitmentApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      email: "",
      phone: "",
      address: "",
      postcode: "",
      nationalInsuranceNumber: "",
      gender: "",
      maritalStatus: "",
      ethnicOrigin: "",
      nationality: "",
      nextOfKinName: "",
      nextOfKinPhone: "",
      nextOfKinAddress: "",
      payrollType: "PAYE",
      bankName: "",
      accountType: "",
      accountName: "",
      accountNumber: "",
      sortCode: "",
      workerTypes: [],
      travelMethod: "",
      travelDistance: "",
      leadSkills: [],
      shiftPreferences: "",
      availableDays: [],
      employmentHistory: [
        {
          companyName: "",
          jobTitle: "",
          startDate: "",
          endDate: "",
          currentlyEmployed: false,
          reasonForLeaving: "",
          managerName: "",
          managerPhone: "",
          managerEmail: "",
        }
      ],
      education: [
        {
          qualificationType: "",
          qualificationName: "",
          institution: "",
          yearObtained: "",
        }
      ],
      medicalConditions: [],
      medicationAffectsDriving: false,
      medicalAffectsNightWork: false,
      hasCriminalConvictions: false,
      convictionDetails: "",
      dbsConsent: false,
      workingTimeDirectiveOptOut: false,
      dataProtectionConsent: false,
      dataTypesConsented: [],
      dataHoldingConsent: false,
      references: [
        {
          referenceType: "Professional",
          fullName: "",
          company: "",
          jobTitle: "",
          relationship: "",
          startDate: "",
          endDate: "",
          applicantJobTitle: "",
          email: "",
          phone: "",
        },
        {
          referenceType: "Professional",
          fullName: "",
          company: "",
          jobTitle: "",
          relationship: "",
          startDate: "",
          endDate: "",
          applicantJobTitle: "",
          email: "",
          phone: "",
        }
      ],
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      return apiRequest('POST', '/api/recruitment-applications', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        applicationData: data
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      window.scrollTo(0, 0);
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
  });

  const onSubmit = async (data: ApplicationFormData) => {
    submitMutation.mutate(data);
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate as any);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      window.scrollTo(0, 0);
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before continuing.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const getFieldsForStep = (step: number): (keyof ApplicationFormData)[] => {
    switch (step) {
      case 1: return ["firstName", "lastName", "dateOfBirth", "email", "phone", "address", "postcode", "gender", "nationality"];
      case 2: return ["nextOfKinName", "nextOfKinPhone", "nextOfKinAddress"];
      case 3: return ["payrollType", "bankName", "accountType", "accountName", "accountNumber", "sortCode"];
      case 4: return ["workerTypes", "travelMethod", "travelDistance", "leadSkills", "shiftPreferences", "availableDays"];
      case 5: return ["employmentHistory"];
      case 6: return ["education"];
      case 7: return ["medicalConditions", "dbsConsent"];
      case 8: return ["dataProtectionConsent", "dataTypesConsented", "dataHoldingConsent"];
      case 9: return ["references"];
      default: return [];
    }
  };

  const watchCriminalConvictions = form.watch("hasCriminalConvictions");

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
                Thank you for your interest in joining Smeaton Healthcare. We've received your comprehensive application 
                and our recruitment team will review it within 5-7 business days.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2 text-left">
                  <li>• Application review by our recruitment team</li>
                  <li>• Initial contact within 5-7 business days if suitable</li>
                  <li>• Interview process for qualified candidates</li>
                  <li>• Reference checks and DBS verification</li>
                  <li>• Final offer and onboarding</li>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Recruitment Application
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Complete all sections to submit your application
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round((currentStep / STEPS.length) * 100)}% Complete
            </span>
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isCompleted
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                  data-testid={`step-button-${step.id}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Please provide your personal details
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
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-dob" />
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
                  <FormField
                    control={form.control}
                    name="postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postcode *</FormLabel>
                        <FormControl>
                          <Input placeholder="PL1 5AB" {...field} data-testid="input-postcode" />
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
                              placeholder="Please enter your full address" 
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
                  <FormField
                    control={form.control}
                    name="nationalInsuranceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>National Insurance Number</FormLabel>
                        <FormControl>
                          <Input placeholder="TK874296A" {...field} data-testid="input-ni-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-gender">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-marital-status">
                              <SelectValue placeholder="Select marital status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married or living with partner">Married or living with partner</SelectItem>
                            <SelectItem value="Divorced">Divorced</SelectItem>
                            <SelectItem value="Widowed">Widowed</SelectItem>
                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ethnicOrigin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ethnic Origin</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., British, African, Asian" {...field} data-testid="input-ethnic-origin" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality *</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., British, Nigerian" {...field} data-testid="input-nationality" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 2: Next of Kin */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Next of Kin
                  </CardTitle>
                  <CardDescription>
                    Emergency contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="nextOfKinName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Next of kin full name" {...field} data-testid="input-kin-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nextOfKinPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="07123 456789" {...field} data-testid="input-kin-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nextOfKinAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Next of kin full address" 
                            rows={3} 
                            {...field} 
                            data-testid="textarea-kin-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payroll & Bank Details */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payroll & Bank Details
                  </CardTitle>
                  <CardDescription>
                    Information for payment processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="payrollType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payroll Type *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="PAYE" id="paye" data-testid="radio-paye" />
                              <label htmlFor="paye" className="cursor-pointer">PAYE</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Self-employed" id="self-employed" data-testid="radio-self-employed" />
                              <label htmlFor="self-employed" className="cursor-pointer">Self-employed</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., Lloyds Bank" {...field} data-testid="input-bank-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-account-type">
                                <SelectValue placeholder="Select account type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Personal Account">Personal Account</SelectItem>
                              <SelectItem value="Business Account">Business Account</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name as it appears on your account" {...field} data-testid="input-account-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="12345678" maxLength={8} {...field} data-testid="input-account-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sortCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sort Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="12-34-56" {...field} data-testid="input-sort-code" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Worker Profile */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Worker Profile
                  </CardTitle>
                  <CardDescription>
                    Tell us about your skills and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="workerTypes"
                    render={() => (
                      <FormItem>
                        <FormLabel>What type of worker describes you best? *</FormLabel>
                        <div className="grid grid-cols-2 gap-3">
                          {["Carer", "Support Worker", "Nurse", "Healthcare Assistant", "Senior Carer"].map((type) => (
                            <FormField
                              key={type}
                              control={form.control}
                              name="workerTypes"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(type)}
                                      onCheckedChange={(checked) => {
                                        const updated = checked
                                          ? [...(field.value || []), type]
                                          : (field.value || []).filter((value) => value !== type);
                                        field.onChange(updated);
                                      }}
                                      data-testid={`checkbox-worker-${type.toLowerCase().replace(/\s+/g, '-')}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="!mt-0 font-normal cursor-pointer">{type}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="travelMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How do you usually travel to work? *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-travel-method">
                                <SelectValue placeholder="Select travel method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Car">Car</SelectItem>
                              <SelectItem value="Bus">Bus</SelectItem>
                              <SelectItem value="Train">Train</SelectItem>
                              <SelectItem value="Walk">Walk</SelectItem>
                              <SelectItem value="Cycle">Cycle</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="travelDistance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How far are you willing to travel? *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-travel-distance">
                                <SelectValue placeholder="Select distance" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0-3 miles">0-3 miles</SelectItem>
                              <SelectItem value="3-7 miles">3-7 miles</SelectItem>
                              <SelectItem value="7-10 miles">7-10 miles</SelectItem>
                              <SelectItem value="10-15 miles">10-15 miles</SelectItem>
                              <SelectItem value="15+ miles">15+ miles</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="leadSkills"
                    render={() => (
                      <FormItem>
                        <FormLabel>What would you consider as your lead skills? *</FormLabel>
                        <div className="grid grid-cols-2 gap-3">
                          {["Elderly", "Dementia", "Learning Disabilities", "Autism", "Physical Disabilities", "Mental Health"].map((skill) => (
                            <FormField
                              key={skill}
                              control={form.control}
                              name="leadSkills"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(skill)}
                                      onCheckedChange={(checked) => {
                                        const updated = checked
                                          ? [...(field.value || []), skill]
                                          : (field.value || []).filter((value) => value !== skill);
                                        field.onChange(updated);
                                      }}
                                      data-testid={`checkbox-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="!mt-0 font-normal cursor-pointer">{skill}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shiftPreferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What type of shifts do you prefer? *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-shift-preferences">
                              <SelectValue placeholder="Select shift preference" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Any">Any</SelectItem>
                            <SelectItem value="Days only">Days only</SelectItem>
                            <SelectItem value="Nights only">Nights only</SelectItem>
                            <SelectItem value="Weekends only">Weekends only</SelectItem>
                            <SelectItem value="Weekdays only">Weekdays only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="availableDays"
                    render={() => (
                      <FormItem>
                        <FormLabel>What days of the week are you available to work? *</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                            <FormField
                              key={day}
                              control={form.control}
                              name="availableDays"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(day)}
                                      onCheckedChange={(checked) => {
                                        const updated = checked
                                          ? [...(field.value || []), day]
                                          : (field.value || []).filter((value) => value !== day);
                                        field.onChange(updated);
                                      }}
                                      data-testid={`checkbox-day-${day.toLowerCase()}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="!mt-0 font-normal cursor-pointer">{day}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 5: Employment History */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Employment History
                  </CardTitle>
                  <CardDescription>
                    Add your previous employment details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {form.watch("employmentHistory").map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Employment {index + 1}</h4>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const current = form.getValues("employmentHistory");
                              form.setValue("employmentHistory", current.filter((_, i) => i !== index));
                            }}
                            data-testid={`button-remove-employment-${index}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`employmentHistory.${index}.companyName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Company name" {...field} data-testid={`input-employment-company-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`employmentHistory.${index}.jobTitle`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Title *</FormLabel>
                              <FormControl>
                                <Input placeholder="Job title" {...field} data-testid={`input-employment-title-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`employmentHistory.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} data-testid={`input-employment-start-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`employmentHistory.${index}.endDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field} 
                                  disabled={form.watch(`employmentHistory.${index}.currentlyEmployed`)}
                                  data-testid={`input-employment-end-${index}`} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name={`employmentHistory.${index}.currentlyEmployed`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid={`checkbox-currently-employed-${index}`}
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Currently employed here</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`employmentHistory.${index}.reasonForLeaving`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reason for Leaving</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Reason for leaving" {...field} data-testid={`textarea-employment-reason-${index}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name={`employmentHistory.${index}.managerName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Manager Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Manager name" {...field} data-testid={`input-employment-manager-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`employmentHistory.${index}.managerPhone`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Manager Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Phone number" {...field} data-testid={`input-employment-manager-phone-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`employmentHistory.${index}.managerEmail`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Manager Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="email@example.com" {...field} data-testid={`input-employment-manager-email-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const current = form.getValues("employmentHistory");
                      form.setValue("employmentHistory", [
                        ...current,
                        {
                          companyName: "",
                          jobTitle: "",
                          startDate: "",
                          endDate: "",
                          currentlyEmployed: false,
                          reasonForLeaving: "",
                          managerName: "",
                          managerPhone: "",
                          managerEmail: "",
                        }
                      ]);
                    }}
                    className="w-full"
                    data-testid="button-add-employment"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Employment Record
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Education */}
            {currentStep === 6 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education & Qualifications
                  </CardTitle>
                  <CardDescription>
                    Add your educational qualifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {form.watch("education").map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Qualification {index + 1}</h4>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const current = form.getValues("education");
                              form.setValue("education", current.filter((_, i) => i !== index));
                            }}
                            data-testid={`button-remove-education-${index}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`education.${index}.qualificationType`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Qualification Type *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid={`select-education-type-${index}`}>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="GCSE">GCSE</SelectItem>
                                  <SelectItem value="A-Level">A-Level</SelectItem>
                                  <SelectItem value="NVQ Level 2">NVQ Level 2</SelectItem>
                                  <SelectItem value="NVQ Level 3">NVQ Level 3</SelectItem>
                                  <SelectItem value="Diploma">Diploma</SelectItem>
                                  <SelectItem value="Degree">Degree</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`education.${index}.qualificationName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Qualification Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g., Health and Social Care" {...field} data-testid={`input-education-name-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`education.${index}.institution`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Institution</FormLabel>
                              <FormControl>
                                <Input placeholder="School/College/University" {...field} data-testid={`input-education-institution-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`education.${index}.yearObtained`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year Obtained</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g., 2020" {...field} data-testid={`input-education-year-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const current = form.getValues("education");
                      form.setValue("education", [
                        ...current,
                        {
                          qualificationType: "",
                          qualificationName: "",
                          institution: "",
                          yearObtained: "",
                        }
                      ]);
                    }}
                    className="w-full"
                    data-testid="button-add-education"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Qualification
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 7: Health & Compliance */}
            {currentStep === 7 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Health & Compliance
                  </CardTitle>
                  <CardDescription>
                    Health information and compliance declarations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="medicalConditions"
                    render={() => (
                      <FormItem>
                        <FormLabel>Do you have any of the following medical conditions?</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            "None of the above",
                            "Diabetes",
                            "Epilepsy",
                            "Heart condition",
                            "Asthma",
                            "Back problems",
                            "Other"
                          ].map((condition) => (
                            <FormField
                              key={condition}
                              control={form.control}
                              name="medicalConditions"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(condition)}
                                      onCheckedChange={(checked) => {
                                        let updated;
                                        if (condition === "None of the above") {
                                          updated = checked ? ["None of the above"] : [];
                                        } else {
                                          const filtered = (field.value || []).filter(v => v !== "None of the above");
                                          updated = checked
                                            ? [...filtered, condition]
                                            : filtered.filter((value) => value !== condition);
                                        }
                                        field.onChange(updated);
                                      }}
                                      data-testid={`checkbox-condition-${condition.toLowerCase().replace(/\s+/g, '-')}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="!mt-0 font-normal cursor-pointer">{condition}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="medicationAffectsDriving"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Are you taking any medication that may affect your ability to drive?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "true")}
                            value={field.value ? "true" : "false"}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="med-driving-yes" data-testid="radio-med-driving-yes" />
                              <label htmlFor="med-driving-yes" className="cursor-pointer">Yes</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="med-driving-no" data-testid="radio-med-driving-no" />
                              <label htmlFor="med-driving-no" className="cursor-pointer">No</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="medicalAffectsNightWork"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Do you have any medical issues that would affect your ability to work at night?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "true")}
                            value={field.value ? "true" : "false"}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="med-night-yes" data-testid="radio-med-night-yes" />
                              <label htmlFor="med-night-yes" className="cursor-pointer">Yes</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="med-night-no" data-testid="radio-med-night-no" />
                              <label htmlFor="med-night-no" className="cursor-pointer">No</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hasCriminalConvictions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Do you have any unspent criminal convictions?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "true")}
                            value={field.value ? "true" : "false"}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="convictions-yes" data-testid="radio-convictions-yes" />
                              <label htmlFor="convictions-yes" className="cursor-pointer">Yes</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="convictions-no" data-testid="radio-convictions-no" />
                              <label htmlFor="convictions-no" className="cursor-pointer">No</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {watchCriminalConvictions && (
                    <FormField
                      control={form.control}
                      name="convictionDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please provide details</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please provide details about your criminal convictions" 
                              rows={3} 
                              {...field} 
                              data-testid="textarea-conviction-details"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="dbsConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-dbs-consent"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-semibold">
                            DBS Check Consent *
                          </FormLabel>
                          <FormDescription>
                            I consent to undertake an Enhanced DBS check before commencing work
                          </FormDescription>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="workingTimeDirectiveOptOut"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-working-time-opt-out"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-semibold">
                            Working Time Directive Opt-Out
                          </FormLabel>
                          <FormDescription>
                            I want to opt out and work more than 48 hours per week
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 8: Data Protection */}
            {currentStep === 8 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Data Protection & Consent
                  </CardTitle>
                  <CardDescription>
                    Please review and accept our data protection policy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      We collect and process your personal data in accordance with GDPR regulations. 
                      Your data will be used solely for recruitment purposes and will be securely stored.
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="dataProtectionConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-data-protection"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-semibold">
                            Data Protection Consent *
                          </FormLabel>
                          <FormDescription>
                            I agree to the above statement regarding data protection and consent to my data being processed
                          </FormDescription>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dataTypesConsented"
                    render={() => (
                      <FormItem>
                        <FormLabel>Personal data you consent to us holding and sharing *</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            "Name",
                            "Date of Birth",
                            "Phone Number",
                            "Email Address",
                            "Postal Address",
                            "CV",
                            "Experience, Training & Qualifications",
                            "National Insurance Number",
                            "Right to Work Documents",
                            "Criminal Conviction(s)"
                          ].map((dataType) => (
                            <FormField
                              key={dataType}
                              control={form.control}
                              name="dataTypesConsented"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(dataType)}
                                      onCheckedChange={(checked) => {
                                        const updated = checked
                                          ? [...(field.value || []), dataType]
                                          : (field.value || []).filter((value) => value !== dataType);
                                        field.onChange(updated);
                                      }}
                                      data-testid={`checkbox-data-${dataType.toLowerCase().replace(/[,\s()]+/g, '-')}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="!mt-0 font-normal cursor-pointer">{dataType}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dataHoldingConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-data-holding"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-semibold">
                            Data Holding Consent *
                          </FormLabel>
                          <FormDescription>
                            I consent to the above information being held and shared for the purposes of providing or finding me work
                          </FormDescription>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 9: References */}
            {currentStep === 9 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    References
                  </CardTitle>
                  <CardDescription>
                    Please provide 2-3 professional or character references
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {form.watch("references").map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Reference {index + 1}</h4>
                        {index > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const current = form.getValues("references");
                              form.setValue("references", current.filter((_, i) => i !== index));
                            }}
                            data-testid={`button-remove-reference-${index}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                      <FormField
                        control={form.control}
                        name={`references.${index}.referenceType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reference Type *</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Professional" id={`ref-prof-${index}`} data-testid={`radio-reference-professional-${index}`} />
                                  <label htmlFor={`ref-prof-${index}`} className="cursor-pointer">Professional Reference</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Character" id={`ref-char-${index}`} data-testid={`radio-reference-character-${index}`} />
                                  <label htmlFor={`ref-char-${index}`} className="cursor-pointer">Character Reference</label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`references.${index}.fullName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Reference full name" {...field} data-testid={`input-reference-name-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`references.${index}.jobTitle`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Their Job Title</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g., Manager" {...field} data-testid={`input-reference-job-title-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`references.${index}.company`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input placeholder="Company name" {...field} data-testid={`input-reference-company-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`references.${index}.relationship`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Relationship (for character references)</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g., Friend, Mentor" {...field} data-testid={`input-reference-relationship-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`references.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} data-testid={`input-reference-start-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`references.${index}.endDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} data-testid={`input-reference-end-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`references.${index}.applicantJobTitle`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Job Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Your job title at this company" {...field} data-testid={`input-reference-applicant-title-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`references.${index}.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="email@example.com" {...field} data-testid={`input-reference-email-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`references.${index}.phone`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input placeholder="07123 456789" {...field} data-testid={`input-reference-phone-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  {form.watch("references").length < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const current = form.getValues("references");
                        form.setValue("references", [
                          ...current,
                          {
                            referenceType: "Professional",
                            fullName: "",
                            company: "",
                            jobTitle: "",
                            relationship: "",
                            startDate: "",
                            endDate: "",
                            applicantJobTitle: "",
                            email: "",
                            phone: "",
                          }
                        ]);
                      }}
                      className="w-full"
                      data-testid="button-add-reference"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Reference
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  data-testid="button-previous"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto"
                  data-testid="button-next"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="ml-auto"
                  data-testid="button-submit"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
