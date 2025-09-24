import { useState, useEffect } from "react";
import { Calculator, TrendingUp, Clock, Users, DollarSign, Info, ArrowRight, Calendar, Utensils, Download, FileText, Shield, FileCheck, Brain, Plus, Eye, Edit, Trash2, Copy, QrCode, Mail } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import QRCode from "qrcode";
import logoImage from "@/assets/logo.png";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Types for knowledge questionnaires
type KnowledgeQuestionnaire = {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  isActive: boolean;
  timeLimit: number | null;
  passingScore: number;
  instructions: string | null;
  shareableLink: string | null;
  qrCode: string | null;
  emailTemplate: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

type KnowledgeQuestion = {
  id: string;
  questionnaireId: string;
  questionText: string;
  questionType: string;
  options: string[] | null;
  correctAnswer: string | null;
  explanation: string | null;
  points: number;
  sortOrder: number;
  isRequired: boolean;
  createdAt: Date;
};

// Schemas for form validation
const questionnaireSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  timeLimit: z.number().min(1).optional(),
  passingScore: z.number().min(0).max(100).default(70),
  instructions: z.string().optional(),
});

const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  questionType: z.string().min(1, "Question type is required"),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
  points: z.number().min(1).default(1),
  isRequired: z.boolean().default(true),
});

export default function AdminTools() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [packageType, setPackageType] = useState('hourly'); // 'hourly', 'live-in', or 'care24x7'
  const [calculation, setCalculation] = useState({
    chargeRate: '',
    hours: '',
    days: '',
    hoursPerDay: '',
    carerWage: '',
    travelCosts: '',
    foodAllowance: '',
    // 24/7 Care specific fields
    dayChargeRate: '',
    nightChargeRate: '',
    dayWageRate: '',
    nightWageRate: '',
    dayHours: '',
    nightHours: '',
    periodDays: '7',
    calcMode: 'weekly', // 'weekly' or 'hourly'
    travelDayPerShift: '',
    travelNightPerShift: '',
    // UK overhead rates (these can be made configurable later)
    nationalInsurance: 15.0, // Employer NI rate %
    pensionContribution: 3.0, // Minimum auto-enrolment rate %
    holidayPay: 12.07, // Statutory holiday pay %
  });

  const [results, setResults] = useState({
    totalRevenue: 0,
    totalStaffCost: 0,
    grossWage: 0,
    nationalInsuranceCost: 0,
    pensionCost: 0,
    holidayPayCost: 0,
    travelCostTotal: 0,
    foodAllowanceTotal: 0,
    totalCosts: 0,
    shiftMargin: 0,
    hourlyMargin: 0,
    marginPercentage: 0,
    // 24/7 Care specific results
    dayRevenue: 0,
    nightRevenue: 0,
    dayWage: 0,
    nightWage: 0,
    dayMargin: 0,
    nightMargin: 0,
    totalHours: 0,
  });

  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState({
    customerName: '',
    relatingTo: '',
    careNeeds: '',
    selectedService: ''
  });
  const [showQuote, setShowQuote] = useState(false);

  // Knowledge questionnaire state
  const [showQuestionnaireDialog, setShowQuestionnaireDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<KnowledgeQuestionnaire | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<KnowledgeQuestion | null>(null);

  const queryClient = useQueryClient();

  // Questionnaire form
  const questionnaireForm = useForm<z.infer<typeof questionnaireSchema>>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      subcategory: "",
      passingScore: 70,
      instructions: "",
    },
  });

  // Question form
  const questionForm = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: "",
      questionType: "",
      options: [],
      correctAnswer: "",
      explanation: "",
      points: 1,
      isRequired: true,
    },
  });

  // Fetch questionnaires
  const { data: questionnaires = [], isLoading: loadingQuestionnaires } = useQuery<KnowledgeQuestionnaire[]>({
    queryKey: ["/api/knowledge/questionnaires"],
    enabled: activeTab === 'knowledge',
  });

  // Fetch questions for selected questionnaire
  const { data: questions = [] } = useQuery<KnowledgeQuestion[]>({
    queryKey: ["/api/knowledge/questionnaires", selectedQuestionnaire?.id, "questions"],
    enabled: !!selectedQuestionnaire?.id,
  });

  // Create questionnaire mutation
  const createQuestionnaireMutation = useMutation({
    mutationFn: async (data: z.infer<typeof questionnaireSchema>) => {
      const response = await fetch("/api/knowledge/questionnaires", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create questionnaire");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge/questionnaires"] });
      setShowQuestionnaireDialog(false);
      questionnaireForm.reset();
    },
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof questionSchema> & { questionnaireId: string }) => {
      const response = await fetch(`/api/knowledge/questionnaires/${data.questionnaireId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create question");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/knowledge/questionnaires", selectedQuestionnaire?.id, "questions"] 
      });
      setShowQuestionDialog(false);
      questionForm.reset();
      setEditingQuestion(null);
    },
  });

  // Delete questionnaire mutation
  const deleteQuestionnaireMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/knowledge/questionnaires/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete questionnaire");
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge/questionnaires"] });
    },
  });

  // Generate QR code for questionnaire
  const generateQRCode = async (questionnaire: KnowledgeQuestionnaire) => {
    if (!questionnaire.shareableLink) return;
    
    const assessmentUrl = `${window.location.origin}/assessment/${questionnaire.shareableLink}`;
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(assessmentUrl, {
        width: 200,
        margin: 2,
      });
      
      // Create download link
      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = `${questionnaire.title.replace(/\s+/g, '_')}_QR_Code.png`;
      link.click();
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Copy shareable link to clipboard
  const copyShareableLink = async (questionnaire: KnowledgeQuestionnaire) => {
    if (!questionnaire.shareableLink) return;
    
    const assessmentUrl = `${window.location.origin}/assessment/${questionnaire.shareableLink}`;
    try {
      await navigator.clipboard.writeText(assessmentUrl);
      // Could add a toast notification here
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Submit questionnaire form
  const onQuestionnaireSubmit = (data: z.infer<typeof questionnaireSchema>) => {
    createQuestionnaireMutation.mutate(data);
  };

  // Submit question form
  const onQuestionSubmit = (data: z.infer<typeof questionSchema>) => {
    if (!selectedQuestionnaire) return;
    
    createQuestionMutation.mutate({
      ...data,
      questionnaireId: selectedQuestionnaire.id,
    });
  };

  const serviceOptions = [
    'Short Visits',
    'Supported Living', 
    '24/7 Care',
    'Enabling',
    'Respite Care',
    'Live-In Care',
    'Condition-Led Care'
  ];

  const calculatePackage = () => {
    const chargeRate = parseFloat(calculation.chargeRate) || 0;
    const hours = parseFloat(calculation.hours) || 0;
    const days = parseFloat(calculation.days) || 0;
    const hoursPerDay = parseFloat(calculation.hoursPerDay) || 0;
    const carerWage = parseFloat(calculation.carerWage) || 0;
    const travelCosts = parseFloat(calculation.travelCosts) || 0;
    const foodAllowance = parseFloat(calculation.foodAllowance) || 0;

    // 24/7 Care specific values
    const dayChargeRate = parseFloat(calculation.dayChargeRate) || 0;
    const nightChargeRate = parseFloat(calculation.nightChargeRate) || 0;
    const dayWageRate = parseFloat(calculation.dayWageRate) || 0;
    const nightWageRate = parseFloat(calculation.nightWageRate) || 0;
    const dayHours = parseFloat(calculation.dayHours) || 0;
    const nightHours = parseFloat(calculation.nightHours) || 0;
    const periodDays = parseFloat(calculation.periodDays) || 7;
    const travelDayPerShift = parseFloat(calculation.travelDayPerShift) || 0;
    const travelNightPerShift = parseFloat(calculation.travelNightPerShift) || 0;

    let totalRevenue = 0;
    let grossWage = 0;
    let totalHours = 0;
    let dayRevenue = 0;
    let nightRevenue = 0;
    let dayWage = 0;
    let nightWage = 0;

    if (packageType === 'hourly') {
      // Hourly package calculations
      totalRevenue = chargeRate * hours;
      grossWage = carerWage * hours;
      totalHours = hours;
    } else if (packageType === 'live-in') {
      // Live-in care package calculations: hourly rate × hours per day × number of days
      totalHours = hoursPerDay * days;
      totalRevenue = chargeRate * totalHours;
      grossWage = carerWage * totalHours;
    } else if (packageType === 'care24x7') {
      // 24/7 Care calculations
      const totalDayHours = calculation.calcMode === 'weekly' ? dayHours * periodDays : dayHours;
      const totalNightHours = calculation.calcMode === 'weekly' ? nightHours * periodDays : nightHours;
      totalHours = totalDayHours + totalNightHours;
      
      dayRevenue = dayChargeRate * totalDayHours;
      nightRevenue = nightChargeRate * totalNightHours;
      totalRevenue = dayRevenue + nightRevenue;
      
      dayWage = dayWageRate * totalDayHours;
      nightWage = nightWageRate * totalNightHours;
      grossWage = dayWage + nightWage;
    }


    // Staff cost calculations
    const nationalInsuranceCost = grossWage * (calculation.nationalInsurance / 100);
    const pensionCost = grossWage * (calculation.pensionContribution / 100);
    const holidayPayCost = grossWage * (calculation.holidayPay / 100);
    
    const totalStaffCost = grossWage + nationalInsuranceCost + pensionCost + holidayPayCost;
    
    // Travel costs and food allowance handling for different package types
    let totalOtherCosts = 0;
    if (packageType === 'hourly') {
      // Hourly care: travel costs per shift, no food allowance
      totalOtherCosts = travelCosts;
    } else if (packageType === 'live-in') {
      // Live-in care: travel costs and food allowance applied once for the entire period
      totalOtherCosts = travelCosts + foodAllowance;
    } else if (packageType === 'care24x7') {
      // 24/7 Care: travel costs per day for day and night shifts
      const travelMultiplier = calculation.calcMode === 'weekly' ? periodDays : 1;
      const travelTotal = (travelDayPerShift + travelNightPerShift) * travelMultiplier;
      const foodTotal = calculation.calcMode === 'weekly' ? foodAllowance : 0;
      totalOtherCosts = travelTotal + foodTotal;
    }
    
    const totalCosts = totalStaffCost + totalOtherCosts;
    const shiftMargin = totalRevenue - totalCosts;
    const hourlyMargin = totalHours > 0 ? shiftMargin / totalHours : 0;
    const marginPercentage = totalRevenue > 0 ? (shiftMargin / totalRevenue) * 100 : 0;

    // Calculate day/night margin breakdown for 24/7 care
    let dayMargin = 0;
    let nightMargin = 0;
    if (packageType === 'care24x7' && totalHours > 0) {
      const totalDayHours = calculation.calcMode === 'weekly' ? dayHours * periodDays : dayHours;
      const totalNightHours = calculation.calcMode === 'weekly' ? nightHours * periodDays : nightHours;
      
      // Apportion overhead and other costs by hours
      const overheadAndOtherCosts = nationalInsuranceCost + pensionCost + holidayPayCost + totalOtherCosts;
      const dayCostShare = totalDayHours > 0 ? (totalDayHours / totalHours) * overheadAndOtherCosts : 0;
      const nightCostShare = totalNightHours > 0 ? (totalNightHours / totalHours) * overheadAndOtherCosts : 0;
      
      dayMargin = dayRevenue - (dayWage + dayCostShare);
      nightMargin = nightRevenue - (nightWage + nightCostShare);
    }

    setResults({
      totalRevenue,
      totalStaffCost,
      grossWage,
      nationalInsuranceCost,
      pensionCost,
      holidayPayCost,
      travelCostTotal: packageType === 'care24x7' ? 
        ((travelDayPerShift + travelNightPerShift) * (calculation.calcMode === 'weekly' ? periodDays : 1)) : 
        travelCosts,
      foodAllowanceTotal: packageType === 'care24x7' && calculation.calcMode === 'weekly' ? 
        foodAllowance : (packageType === 'live-in' ? foodAllowance : 0),
      totalCosts,
      shiftMargin,
      hourlyMargin,
      marginPercentage,
      // 24/7 Care specific results
      dayRevenue,
      nightRevenue,
      dayWage,
      nightWage,
      dayMargin,
      nightMargin,
      totalHours,
    });
  };

  useEffect(() => {
    calculatePackage();
  }, [calculation, packageType]);

  const handleInputChange = (field: string, value: string) => {
    setCalculation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatPercentage = (percent: number) => {
    return `${percent.toFixed(1)}%`;
  };

  // PDF Download Function
  const downloadQuote = async () => {
    const element = document.getElementById('quote-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const filename = `Smeaton_Healthcare_Quote_${quoteDetails.customerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Could add a toast notification here for better UX
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tools & Compliance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Business tools, calculators, and compliance management for healthcare staffing
          </p>
        </div>
        <Calculator className="h-8 w-8 text-pink-600" />
      </div>
      
      {/* Tool Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Package Calculator
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Staff Knowledge Questionnaires
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">

      {/* Package Calculator */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Care Package Calculator
          </CardTitle>
          <CardDescription>
            Calculate care package costs including staff wages, UK employment overheads, and profit margins
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Package Details</h3>
              
              {/* Package Type Selector */}
              <div className="space-y-3">
                <Label>Package Type</Label>
                <RadioGroup 
                  value={packageType} 
                  onValueChange={setPackageType}
                  className="flex space-x-6"
                  data-testid="radio-package-type"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hourly" id="hourly" />
                    <Label htmlFor="hourly" className="flex items-center gap-2 cursor-pointer">
                      <Clock className="h-4 w-4" />
                      Hourly Care
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="live-in" id="live-in" />
                    <Label htmlFor="live-in" className="flex items-center gap-2 cursor-pointer">
                      <Calendar className="h-4 w-4" />
                      Live In Care
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="care24x7" id="care24x7" />
                    <Label htmlFor="care24x7" className="flex items-center gap-2 cursor-pointer">
                      <Users className="h-4 w-4" />
                      24/7 Care
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Standard charge rate for hourly and live-in care only */}
              {packageType !== 'care24x7' && (
                <div className="space-y-2">
                  <Label htmlFor="charge-rate">
                    Charge Rate (per hour)
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="charge-rate"
                      type="number"
                      step="0.01"
                      placeholder="25.00"
                      className="pl-10"
                      value={calculation.chargeRate}
                      onChange={(e) => handleInputChange('chargeRate', e.target.value)}
                      data-testid="input-charge-rate"
                    />
                  </div>
                </div>
              )}

              {packageType === 'hourly' ? (
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours per Shift</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="hours"
                      type="number"
                      step="0.5"
                      placeholder="8.0"
                      className="pl-10"
                      value={calculation.hours}
                      onChange={(e) => handleInputChange('hours', e.target.value)}
                      data-testid="input-hours"
                    />
                  </div>
                </div>
              ) : packageType === 'live-in' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hours-per-day">Hours of Care (per day)</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="hours-per-day"
                        type="number"
                        step="0.5"
                        placeholder="12.0"
                        className="pl-10"
                        value={calculation.hoursPerDay}
                        onChange={(e) => handleInputChange('hoursPerDay', e.target.value)}
                        data-testid="input-hours-per-day"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="days">Number of Days</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="days"
                        type="number"
                        step="1"
                        placeholder="7"
                        className="pl-10"
                        value={calculation.days}
                        onChange={(e) => handleInputChange('days', e.target.value)}
                        data-testid="input-days"
                      />
                    </div>
                  </div>
                </div>
              ) : packageType === 'care24x7' ? (
                // 24/7 Care specific inputs
                <div className="space-y-4">
                  {/* Calculation Mode Toggle */}
                  <div className="space-y-2">
                    <Label>Calculation Mode</Label>
                    <RadioGroup 
                      value={calculation.calcMode} 
                      onValueChange={(value) => handleInputChange('calcMode', value)}
                      className="flex gap-6"
                      data-testid="radio-calc-mode"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hourly" id="calc-hourly" />
                        <Label htmlFor="calc-hourly">Hourly</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="calc-weekly" />
                        <Label htmlFor="calc-weekly">Weekly</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Period Days (only for weekly) */}
                  {calculation.calcMode === 'weekly' && (
                    <div className="space-y-2">
                      <Label htmlFor="period-days">Number of Days</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="period-days"
                          type="number"
                          step="1"
                          placeholder="7"
                          className="pl-10"
                          value={calculation.periodDays}
                          onChange={(e) => handleInputChange('periodDays', e.target.value)}
                          data-testid="input-period-days"
                        />
                      </div>
                    </div>
                  )}

                  {/* Day Rates Section */}
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Day Shift Rates
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="day-charge-rate">Day Charge Rate (per hour)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="day-charge-rate"
                            type="number"
                            step="0.01"
                            placeholder="25.00"
                            className="pl-10"
                            value={calculation.dayChargeRate}
                            onChange={(e) => handleInputChange('dayChargeRate', e.target.value)}
                            data-testid="input-day-charge-rate"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="day-wage-rate">Day Carer Wage (per hour)</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="day-wage-rate"
                            type="number"
                            step="0.01"
                            placeholder="15.00"
                            className="pl-10"
                            value={calculation.dayWageRate}
                            onChange={(e) => handleInputChange('dayWageRate', e.target.value)}
                            data-testid="input-day-wage-rate"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="day-hours">Day Hours ({calculation.calcMode === 'weekly' ? 'per day' : 'total'})</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="day-hours"
                            type="number"
                            step="0.5"
                            placeholder="12.0"
                            className="pl-10"
                            value={calculation.dayHours}
                            onChange={(e) => handleInputChange('dayHours', e.target.value)}
                            data-testid="input-day-hours"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="travel-day">Day Travel Cost ({calculation.calcMode === 'weekly' ? 'per day' : 'total'})</Label>
                        <div className="relative">
                          <ArrowRight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="travel-day"
                            type="number"
                            step="0.01"
                            placeholder="10.00"
                            className="pl-10"
                            value={calculation.travelDayPerShift}
                            onChange={(e) => handleInputChange('travelDayPerShift', e.target.value)}
                            data-testid="input-travel-day"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Night Rates Section */}
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Night Shift Rates
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="night-charge-rate">Night Charge Rate (per hour)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="night-charge-rate"
                            type="number"
                            step="0.01"
                            placeholder="30.00"
                            className="pl-10"
                            value={calculation.nightChargeRate}
                            onChange={(e) => handleInputChange('nightChargeRate', e.target.value)}
                            data-testid="input-night-charge-rate"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="night-wage-rate">Night Carer Wage (per hour)</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="night-wage-rate"
                            type="number"
                            step="0.01"
                            placeholder="18.00"
                            className="pl-10"
                            value={calculation.nightWageRate}
                            onChange={(e) => handleInputChange('nightWageRate', e.target.value)}
                            data-testid="input-night-wage-rate"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="night-hours">Night Hours ({calculation.calcMode === 'weekly' ? 'per night' : 'total'})</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="night-hours"
                            type="number"
                            step="0.5"
                            placeholder="12.0"
                            className="pl-10"
                            value={calculation.nightHours}
                            onChange={(e) => handleInputChange('nightHours', e.target.value)}
                            data-testid="input-night-hours"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="travel-night">Night Travel Cost ({calculation.calcMode === 'weekly' ? 'per night' : 'total'})</Label>
                        <div className="relative">
                          <ArrowRight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="travel-night"
                            type="number"
                            step="0.01"
                            placeholder="10.00"
                            className="pl-10"
                            value={calculation.travelNightPerShift}
                            onChange={(e) => handleInputChange('travelNightPerShift', e.target.value)}
                            data-testid="input-travel-night"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Food Allowance (only for weekly) */}
                  {calculation.calcMode === 'weekly' && (
                    <div className="space-y-2">
                      <Label htmlFor="food-allowance-24x7">Food Allowance (weekly)</Label>
                      <div className="relative">
                        <Utensils className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="food-allowance-24x7"
                          type="number"
                          step="0.01"
                          placeholder="50.00"
                          className="pl-10"
                          value={calculation.foodAllowance}
                          onChange={(e) => handleInputChange('foodAllowance', e.target.value)}
                          data-testid="input-food-allowance-24x7"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Standard carer wage and travel costs (exclude for 24/7 care) */}
              {packageType !== 'care24x7' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="carer-wage">Carer Wage (per hour)</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="carer-wage"
                        type="number"
                        step="0.01"
                        placeholder="12.50"
                        className="pl-10"
                        value={calculation.carerWage}
                        onChange={(e) => handleInputChange('carerWage', e.target.value)}
                        data-testid="input-carer-wage"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="travel-costs">
                      Travel Costs {packageType === 'live-in' ? '(one-time for period)' : '(per shift)'}
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="travel-costs"
                        type="number"
                        step="0.01"
                        placeholder="5.00"
                        className="pl-10"
                        value={calculation.travelCosts}
                        onChange={(e) => handleInputChange('travelCosts', e.target.value)}
                        data-testid="input-travel-costs"
                      />
                    </div>
                  </div>
                </>
              )}

              {packageType === 'live-in' && (
                <div className="space-y-2">
                  <Label htmlFor="food-allowance">Food Allowance (total for period)</Label>
                  <div className="relative">
                    <Utensils className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="food-allowance"
                      type="number"
                      step="0.01"
                      placeholder="50.00"
                      className="pl-10"
                      value={calculation.foodAllowance}
                      onChange={(e) => handleInputChange('foodAllowance', e.target.value)}
                      data-testid="input-food-allowance"
                    />
                  </div>
                </div>
              )}

              {/* UK Overhead Rates */}
              <div className="pt-4">
                <h4 className="text-md font-semibold mb-3">UK Employment Overheads</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span>National Insurance:</span>
                    <Badge variant="secondary">{formatPercentage(calculation.nationalInsurance)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Pension:</span>
                    <Badge variant="secondary">{formatPercentage(calculation.pensionContribution)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Holiday Pay:</span>
                    <Badge variant="secondary">{formatPercentage(calculation.holidayPay)}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Calculation Results</h3>
              
              {/* Revenue */}
              <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Revenue</span>
                    <span className="text-xl font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(results.totalRevenue)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Staff Costs Breakdown */}
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Staff Costs Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Gross Wage:</span>
                      <span className="font-medium">{formatCurrency(results.grossWage)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>National Insurance:</span>
                      <span className="font-medium">{formatCurrency(results.nationalInsuranceCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pension:</span>
                      <span className="font-medium">{formatCurrency(results.pensionCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Holiday Pay:</span>
                      <span className="font-medium">{formatCurrency(results.holidayPayCost)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Staff Cost:</span>
                      <span>{formatCurrency(results.totalStaffCost)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Other Costs */}
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Travel Costs</span>
                    <span className="font-bold">{formatCurrency(results.travelCostTotal)}</span>
                  </div>
                  {packageType === 'live-in' && results.foodAllowanceTotal > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Food Allowance</span>
                        <span className="font-bold">{formatCurrency(results.foodAllowanceTotal)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Total Costs */}
              <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Costs</span>
                    <span className="text-xl font-bold text-red-700 dark:text-red-300">
                      {formatCurrency(results.totalCosts)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Margins */}
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardContent className="pt-4 space-y-3">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">Profit Margins</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>{packageType === 'hourly' ? 'Shift Margin:' : 'Period Margin:'}</span>
                      <span className={`text-xl font-bold ${results.shiftMargin >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>
                        {formatCurrency(results.shiftMargin)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{packageType === 'hourly' ? 'Hourly' : 'Daily'} Margin:</span>
                      <span className={`font-bold ${results.hourlyMargin >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>
                        {formatCurrency(results.hourlyMargin)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Margin %:</span>
                      <span className={`font-bold ${results.marginPercentage >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>
                        {formatPercentage(results.marginPercentage)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Quote Button */}
              <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full mb-2"
                    data-testid="button-generate-quote"
                    disabled={results.totalRevenue === 0}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Quote
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Customer Details</DialogTitle>
                    <DialogDescription>
                      Enter customer information for the quote
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer-name">Customer Name</Label>
                      <Input
                        id="customer-name"
                        placeholder="John Smith"
                        value={quoteDetails.customerName}
                        onChange={(e) => setQuoteDetails(prev => ({ ...prev, customerName: e.target.value }))}
                        data-testid="input-customer-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relating-to">Relating To</Label>
                      <Input
                        id="relating-to"
                        placeholder="Mary Smith (Mother)"
                        value={quoteDetails.relatingTo}
                        onChange={(e) => setQuoteDetails(prev => ({ ...prev, relatingTo: e.target.value }))}
                        data-testid="input-relating-to"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service-type">Service Type</Label>
                      <Select 
                        value={quoteDetails.selectedService} 
                        onValueChange={(value) => setQuoteDetails(prev => ({ ...prev, selectedService: value }))}
                      >
                        <SelectTrigger data-testid="select-service-type">
                          <SelectValue placeholder="Select a service..." />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceOptions.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="care-needs">Care Needs Discussed</Label>
                      <Textarea
                        id="care-needs"
                        placeholder="Brief description of care needs discussed with the client..."
                        value={quoteDetails.careNeeds}
                        onChange={(e) => setQuoteDetails(prev => ({ ...prev, careNeeds: e.target.value }))}
                        rows={3}
                        data-testid="textarea-care-needs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowQuoteModal(false)}
                      data-testid="button-cancel-quote"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        setShowQuoteModal(false);
                        setShowQuote(true);
                      }}
                      disabled={!quoteDetails.customerName || !quoteDetails.selectedService}
                      data-testid="button-create-quote"
                    >
                      Create Quote
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Clear Results Button */}
              <Button 
                onClick={() => {
                  setCalculation(prev => ({
                    ...prev,
                    chargeRate: '',
                    hours: '',
                    days: '',
                    hoursPerDay: '',
                    carerWage: '',
                    travelCosts: '',
                    foodAllowance: ''
                  }));
                  setQuoteDetails({
                    customerName: '',
                    relatingTo: '',
                    careNeeds: '',
                    selectedService: ''
                  });
                  setPackageType('hourly');
                }}
                variant="outline"
                className="w-full"
                data-testid="button-clear-calculator"
              >
                Clear Calculator
              </Button>
            </div>
          </div>

          {/* Information Panel */}
          <Card className="mt-6 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-semibold">UK Employment Cost Information:</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>National Insurance: Employer contribution rate (15.0% current rate)</li>
                    <li>Pension: Minimum auto-enrolment employer contribution (3%)</li>
                    <li>Holiday Pay: Statutory holiday entitlement calculation (12.07%)</li>
                  </ul>
                  <p className="mt-2 text-xs opacity-80">
                    These rates are indicative and may vary based on specific employment arrangements and current legislation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="knowledge">
          <div className="space-y-6">
            {/* Knowledge Questionnaires Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Knowledge Questionnaires</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Create and manage knowledge assessments for staff training and compliance
                </p>
              </div>
              <Dialog open={showQuestionnaireDialog} onOpenChange={setShowQuestionnaireDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2" data-testid="button-create-questionnaire">
                    <Plus className="h-4 w-4" />
                    Create Questionnaire
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Knowledge Questionnaire</DialogTitle>
                    <DialogDescription>
                      Create a new knowledge assessment for staff training and compliance
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...questionnaireForm}>
                    <form onSubmit={questionnaireForm.handleSubmit(onQuestionnaireSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={questionnaireForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Safeguarding Essentials" {...field} data-testid="input-questionnaire-title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={questionnaireForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-category">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="mandatory_core">Mandatory Core</SelectItem>
                                  <SelectItem value="care_specific">Care Specific</SelectItem>
                                  <SelectItem value="professional_standards">Professional Standards</SelectItem>
                                  <SelectItem value="specialized">Specialized</SelectItem>
                                  <SelectItem value="scenario_testing">Scenario Testing</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={questionnaireForm.control}
                        name="subcategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subcategory</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., safeguarding, mental_capacity, health_safety" {...field} data-testid="input-subcategory" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={questionnaireForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe what this assessment covers..."
                                {...field} 
                                data-testid="textarea-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={questionnaireForm.control}
                          name="passingScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Passing Score (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  max="100" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  data-testid="input-passing-score"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={questionnaireForm.control}
                          name="timeLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time Limit (minutes)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1"
                                  placeholder="Optional"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  data-testid="input-time-limit"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={questionnaireForm.control}
                        name="instructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Special instructions for completing this assessment..."
                                {...field} 
                                data-testid="textarea-instructions"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowQuestionnaireDialog(false)}
                          data-testid="button-cancel-questionnaire"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createQuestionnaireMutation.isPending}
                          data-testid="button-save-questionnaire"
                        >
                          {createQuestionnaireMutation.isPending ? "Creating..." : "Create Questionnaire"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Questionnaires List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Knowledge Questionnaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingQuestionnaires ? (
                  <div className="text-center py-8">Loading questionnaires...</div>
                ) : questionnaires.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No questionnaires created yet</p>
                    <p className="text-sm text-gray-400 mt-2">Create your first knowledge assessment to get started</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Questions</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questionnaires.map((questionnaire: KnowledgeQuestionnaire) => (
                        <TableRow key={questionnaire.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{questionnaire.title}</div>
                              <div className="text-sm text-gray-500">{questionnaire.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {questionnaire.category.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="link"
                              className="p-0 h-auto"
                              onClick={() => setSelectedQuestionnaire(questionnaire)}
                              data-testid={`button-view-questions-${questionnaire.id}`}
                            >
                              View Questions
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Badge variant={questionnaire.isActive ? "default" : "secondary"}>
                              {questionnaire.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyShareableLink(questionnaire)}
                                data-testid={`button-copy-link-${questionnaire.id}`}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => generateQRCode(questionnaire)}
                                data-testid={`button-qr-code-${questionnaire.id}`}
                              >
                                <QrCode className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    data-testid={`button-delete-${questionnaire.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Questionnaire</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{questionnaire.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteQuestionnaireMutation.mutate(questionnaire.id)}
                                      data-testid="button-confirm-delete"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Questions Management Dialog */}
            {selectedQuestionnaire && (
              <Dialog open={!!selectedQuestionnaire} onOpenChange={() => setSelectedQuestionnaire(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {selectedQuestionnaire.title} - Questions
                    </DialogTitle>
                    <DialogDescription>
                      Manage questions for this knowledge assessment
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        {questions.length} question(s) in this assessment
                      </p>
                      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm" data-testid="button-add-question">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Add Question</DialogTitle>
                            <DialogDescription>
                              Add a new question to the assessment
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...questionForm}>
                            <form onSubmit={questionForm.handleSubmit(onQuestionSubmit)} className="space-y-4">
                              <FormField
                                control={questionForm.control}
                                name="questionText"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Question Text</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Enter your question here..."
                                        {...field} 
                                        data-testid="textarea-question-text"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={questionForm.control}
                                  name="questionType"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Question Type</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger data-testid="select-question-type">
                                            <SelectValue placeholder="Select type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                          <SelectItem value="true_false">True/False</SelectItem>
                                          <SelectItem value="short_answer">Short Answer</SelectItem>
                                          <SelectItem value="scenario_based">Scenario Based</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={questionForm.control}
                                  name="points"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Points</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="number" 
                                          min="1"
                                          {...field}
                                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                                          data-testid="input-points"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <FormField
                                control={questionForm.control}
                                name="correctAnswer"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Correct Answer</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Enter the correct answer..."
                                        {...field} 
                                        data-testid="input-correct-answer"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={questionForm.control}
                                name="explanation"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Explanation (Optional)</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Explain why this is the correct answer..."
                                        {...field} 
                                        data-testid="textarea-explanation"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setShowQuestionDialog(false);
                                    questionForm.reset();
                                  }}
                                  data-testid="button-cancel-question"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  type="submit" 
                                  disabled={createQuestionMutation.isPending}
                                  data-testid="button-save-question"
                                >
                                  {createQuestionMutation.isPending ? "Adding..." : "Add Question"}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {questions.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No questions added yet</p>
                        <p className="text-sm text-gray-400 mt-2">Add your first question to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {questions.map((question: KnowledgeQuestion, index: number) => (
                          <Card key={question.id} className="border-l-4 border-l-blue-500">
                            <CardContent className="pt-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline">{question.questionType.replace('_', ' ')}</Badge>
                                    <Badge variant="secondary">{question.points} point(s)</Badge>
                                  </div>
                                  <p className="font-medium mb-2">Q{index + 1}: {question.questionText}</p>
                                  {question.correctAnswer && (
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                      <strong>Answer:</strong> {question.correctAnswer}
                                    </p>
                                  )}
                                  {question.explanation && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      <strong>Explanation:</strong> {question.explanation}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quote Preview Modal */}
      <Dialog open={showQuote} onOpenChange={setShowQuote}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Preview</DialogTitle>
            <DialogDescription>
              Review and download the customer quote
            </DialogDescription>
          </DialogHeader>
          
          <div id="quote-content" className="bg-white p-8 text-black">
            {/* Company Logo and Header */}
            <div className="text-center mb-8">
              <img 
                src={logoImage} 
                alt="Smeaton Healthcare" 
                style={{ height: '120px', width: 'auto', margin: '0 auto', marginBottom: '16px' }}
              />
              <div className="text-sm text-gray-600 mb-4">Professional Healthcare Staffing Solutions</div>
              <div className="text-sm text-gray-600">
                Email: hello@smeatonhealthcare.co.uk | Phone: 0330 165 8880
              </div>
            </div>

            {/* Quote Details */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Care Package Quote</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <strong>Customer:</strong> {quoteDetails.customerName}
                </div>
                <div>
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </div>
                {quoteDetails.relatingTo && (
                  <div className="col-span-2">
                    <strong>Relating To:</strong> {quoteDetails.relatingTo}
                  </div>
                )}
                {quoteDetails.selectedService && (
                  <div className="col-span-2">
                    <strong>Service Type:</strong> {quoteDetails.selectedService}
                  </div>
                )}
              </div>
            </div>

            {/* Care Needs Discussed */}
            {quoteDetails.careNeeds && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Care Needs Discussed</h3>
                <div className="bg-gray-50 p-4 rounded border text-sm">
                  {quoteDetails.careNeeds}
                </div>
              </div>
            )}

            {/* Package Type and Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">
                {packageType === 'hourly' ? 'Hourly Care Package' : 'Live-In Care Package'}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Charge Rate:</strong> {formatCurrency(parseFloat(calculation.chargeRate) || 0)}/hour
                </div>
                {packageType === 'hourly' ? (
                  <div>
                    <strong>Total Hours:</strong> {calculation.hours}
                  </div>
                ) : (
                  <>
                    <div>
                      <strong>Hours per Day:</strong> {calculation.hoursPerDay}
                    </div>
                    <div>
                      <strong>Number of Days:</strong> {calculation.days}
                    </div>
                    <div>
                      <strong>Total Hours:</strong> {(parseFloat(calculation.hoursPerDay) || 0) * (parseFloat(calculation.days) || 0)}
                    </div>
                  </>
                )}
                <div>
                  <strong>Travel Costs:</strong> {formatCurrency(parseFloat(calculation.travelCosts) || 0)}
                  {packageType === 'live-in' ? ' (one-time)' : ' (per shift)'}
                </div>
                {packageType === 'live-in' && calculation.foodAllowance && (
                  <div>
                    <strong>Food Allowance:</strong> {formatCurrency(parseFloat(calculation.foodAllowance) || 0)}
                  </div>
                )}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Cost Breakdown</h3>
              <div className="border border-gray-300 rounded">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="p-3 font-medium">Care Services</td>
                      <td className="p-3 text-right">{formatCurrency(results.totalRevenue - results.travelCostTotal - results.foodAllowanceTotal)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-3 font-medium">Travel Costs</td>
                      <td className="p-3 text-right">{formatCurrency(results.travelCostTotal)}</td>
                    </tr>
                    {packageType === 'live-in' && results.foodAllowanceTotal > 0 && (
                      <tr className="border-b border-gray-200">
                        <td className="p-3 font-medium">Food Allowance</td>
                        <td className="p-3 text-right">{formatCurrency(results.foodAllowanceTotal)}</td>
                      </tr>
                    )}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="p-3">Total Cost</td>
                      <td className="p-3 text-right text-lg">{formatCurrency(results.totalRevenue)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="text-xs text-gray-600 mt-8">
              <p className="mb-2">
                <strong>Terms & Conditions:</strong>
              </p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>This quote is valid for 30 days from the date of issue</li>
                <li>All services are subject to care assessment and agreement of care plan</li>
                <li>Prices may vary based on specific requirements and availability</li>
                <li>Payment terms: Net 30 days from invoice date</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowQuote(false)}
              data-testid="button-close-quote"
            >
              Close
            </Button>
            <Button
              onClick={downloadQuote}
              data-testid="button-download-quote"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}