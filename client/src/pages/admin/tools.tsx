import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock, 
  Calendar, 
  Info, 
  Plus,
  Download,
  ArrowRight,
  Utensils,
  Target,
  RefreshCw,
  Edit,
  MoreHorizontal,
  Eye,
  Copy,
  Trash2,
  Brain
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface CalculationState {
  chargeRate: string;
  hours: string;
  days: string;
  hoursPerDay: string;
  carerWage: string;
  travelCosts: string;
  nationalInsurance: number;
  pension: number;
  holidayPay: number;
  foodAllowance: string;
  // 24/7 Care specific fields
  calcMode: 'hourly' | 'weekly';
  periodDays: string;
  dayChargeRate: string;
  nightChargeRate: string;
  dayWageRate: string;
  nightWageRate: string;
  dayHours: string;
  nightHours: string;
  travelDayPerShift: string;
  travelNightPerShift: string;
  // Short Visits specific fields
  hourlyPay: string;
  careHoursDelivered: string;
  travelTimeMinutes: string;
  minimumWage: number;
}

interface Results {
  totalRevenue: number;
  totalStaffCost: number;
  grossMargin: number;
  marginPercentage: number;
  travelCostTotal: number;
  foodAllowanceTotal: number;
  // Short Visits specific results
  chargeRevenue: number;
  carePayCost: number;
  travelPayCost: number;
  totalPayCost: number;
  shortVisitsMargin: number;
  shortVisitsMarginPercentage: number;
}

interface QuoteDetails {
  customerName: string;
  relatingTo: string;
  careNeeds: string;
  selectedService: string;
}

const questionnaireSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  passingScore: z.string().min(1, 'Passing score is required'),
  timeLimit: z.string().optional(),
  maxAttempts: z.string().optional(),
});

type QuestionnaireFormData = z.infer<typeof questionnaireSchema>;

export default function AdminTools() {
  const [calculation, setCalculation] = useState<CalculationState>({
    chargeRate: '',
    hours: '',
    days: '',
    hoursPerDay: '',
    carerWage: '',
    travelCosts: '',
    nationalInsurance: 15.0,
    pension: 3.0,
    holidayPay: 12.07,
    foodAllowance: '',
    calcMode: 'hourly',
    periodDays: '',
    dayChargeRate: '',
    nightChargeRate: '',
    dayWageRate: '',
    nightWageRate: '',
    dayHours: '',
    nightHours: '',
    travelDayPerShift: '',
    travelNightPerShift: '',
    hourlyPay: '',
    careHoursDelivered: '',
    travelTimeMinutes: '',
    minimumWage: 12.21,
  });

  const [packageType, setPackageType] = useState<'hourly' | 'live-in' | 'care24x7' | 'short-visits'>('hourly');
  const [results, setResults] = useState<Results>({
    totalRevenue: 0,
    totalStaffCost: 0,
    grossMargin: 0,
    marginPercentage: 0,
    travelCostTotal: 0,
    foodAllowanceTotal: 0,
    chargeRevenue: 0,
    carePayCost: 0,
    travelPayCost: 0,
    totalPayCost: 0,
    shortVisitsMargin: 0,
    shortVisitsMarginPercentage: 0,
  });

  const [showQuote, setShowQuote] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails>({
    customerName: '',
    relatingTo: '',
    careNeeds: '',
    selectedService: ''
  });

  const { toast } = useToast();

  const questionnairesQuery = useQuery({
    queryKey: ['/api/knowledge/questionnaires'],
    enabled: false // We don't need questionnaires anymore
  });

  const questionnaireForm = useForm<QuestionnaireFormData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      title: '',
      category: '',
      description: '',
      passingScore: '80',
      timeLimit: '30',
      maxAttempts: '3'
    }
  });

  const createQuestionnaireMutation = useMutation({
    mutationFn: (data: QuestionnaireFormData) => 
      apiRequest('/api/knowledge/questionnaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge/questionnaires'] });
      questionnaireForm.reset();
      setShowQuestionnaireDialog(false);
      toast({ 
        title: "Success", 
        description: "Knowledge questionnaire created successfully" 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create questionnaire",
        variant: "destructive"
      });
    }
  });

  const [showQuestionnaireDialog, setShowQuestionnaireDialog] = useState(false);

  const handleInputChange = (field: keyof CalculationState, value: string | number) => {
    setCalculation(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const calculateResults = () => {
    const chargeRate = parseFloat(calculation.chargeRate) || 0;
    let totalRevenue = 0;
    let totalHours = 0;
    let grossWage = 0;
    let dayWage = 0;
    let nightWage = 0;

    if (packageType === 'hourly') {
      totalHours = parseFloat(calculation.hours) || 0;
      totalRevenue = totalHours * chargeRate;
      grossWage = totalHours * (parseFloat(calculation.carerWage) || 0);
    } else if (packageType === 'live-in') {
      const hoursPerDay = parseFloat(calculation.hoursPerDay) || 0;
      const days = parseFloat(calculation.days) || 0;
      totalHours = hoursPerDay * days;
      totalRevenue = totalHours * chargeRate;
      grossWage = totalHours * (parseFloat(calculation.carerWage) || 0);
    } else if (packageType === 'care24x7') {
      const dayChargeRate = parseFloat(calculation.dayChargeRate) || 0;
      const nightChargeRate = parseFloat(calculation.nightChargeRate) || 0;
      const dayWageRate = parseFloat(calculation.dayWageRate) || 0;
      const nightWageRate = parseFloat(calculation.nightWageRate) || 0;
      const dayHours = parseFloat(calculation.dayHours) || 0;
      const nightHours = parseFloat(calculation.nightHours) || 0;
      
      let totalDayHours = dayHours;
      let totalNightHours = nightHours;
      let dayRevenue = 0;
      let nightRevenue = 0;

      if (calculation.calcMode === 'weekly') {
        const periodDays = parseFloat(calculation.periodDays) || 0;
        totalDayHours = dayHours * periodDays;
        totalNightHours = nightHours * periodDays;
      }

      dayRevenue = totalDayHours * dayChargeRate;
      nightRevenue = totalNightHours * nightChargeRate;
      totalRevenue = dayRevenue + nightRevenue;
      totalHours = totalDayHours + totalNightHours;
      
      dayWage = dayWageRate * totalDayHours;
      nightWage = nightWageRate * totalNightHours;
      grossWage = dayWage + nightWage;
    } else if (packageType === 'short-visits') {
      // Short Visits calculations
      const hourlyPay = parseFloat(calculation.hourlyPay) || 0;
      const careHoursDelivered = parseFloat(calculation.careHoursDelivered) || 0;
      const travelTimeMinutes = parseFloat(calculation.travelTimeMinutes) || 0;
      const minimumWage = calculation.minimumWage;
      
      // Revenue = Care hours delivered × Charge rate
      totalRevenue = careHoursDelivered * chargeRate;
      
      // Care Pay Cost = Care hours delivered × Hourly pay
      const carePayCost = careHoursDelivered * hourlyPay;
      
      // Travel Pay Cost = Travel time in minutes ÷ 60 × minimum wage (£12.21)
      const travelPayCost = (travelTimeMinutes / 60) * minimumWage;
      
      // Total Pay Cost
      const totalPayCost = carePayCost + travelPayCost;
      
      // For Short Visits, we don't apply NI/pension/holiday pay to the grossWage calculation
      // Instead we'll use totalPayCost directly for margin calculation
      grossWage = totalPayCost;
      totalHours = careHoursDelivered;
    }


    // Staff cost calculations
    const nationalInsuranceCost = grossWage * (calculation.nationalInsurance / 100);
    const pensionCost = grossWage * (calculation.pension / 100);
    const holidayPayCost = grossWage * (calculation.holidayPay / 100);
    
    let travelCostTotal = 0;
    let foodAllowanceTotal = 0;

    if (packageType === 'care24x7') {
      const travelDayPerShift = parseFloat(calculation.travelDayPerShift) || 0;
      const travelNightPerShift = parseFloat(calculation.travelNightPerShift) || 0;
      
      if (calculation.calcMode === 'weekly') {
        const periodDays = parseFloat(calculation.periodDays) || 0;
        travelCostTotal = (travelDayPerShift + travelNightPerShift) * periodDays;
        foodAllowanceTotal = parseFloat(calculation.foodAllowance) || 0;
      } else {
        travelCostTotal = travelDayPerShift + travelNightPerShift;
      }
    } else if (packageType === 'short-visits') {
      // For short visits, travel cost is already included in the grossWage calculation
      travelCostTotal = 0;
    } else {
      travelCostTotal = parseFloat(calculation.travelCosts) || 0;
      if (packageType === 'live-in') {
        foodAllowanceTotal = parseFloat(calculation.foodAllowance) || 0;
      }
    }

    let totalStaffCost = 0;
    if (packageType === 'short-visits') {
      // For short visits, the total staff cost is just the grossWage (which includes travel pay)
      totalStaffCost = grossWage;
    } else {
      totalStaffCost = grossWage + nationalInsuranceCost + pensionCost + holidayPayCost + travelCostTotal + foodAllowanceTotal;
    }

    const grossMargin = totalRevenue - totalStaffCost;
    const marginPercentage = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

    // Short Visits specific calculations for display
    let chargeRevenue = 0;
    let carePayCost = 0;
    let travelPayCost = 0;
    let totalPayCost = 0;
    let shortVisitsMargin = 0;
    let shortVisitsMarginPercentage = 0;

    if (packageType === 'short-visits') {
      const hourlyPay = parseFloat(calculation.hourlyPay) || 0;
      const careHoursDelivered = parseFloat(calculation.careHoursDelivered) || 0;
      const travelTimeMinutes = parseFloat(calculation.travelTimeMinutes) || 0;
      
      chargeRevenue = careHoursDelivered * chargeRate;
      carePayCost = careHoursDelivered * hourlyPay;
      travelPayCost = (travelTimeMinutes / 60) * calculation.minimumWage;
      totalPayCost = carePayCost + travelPayCost;
      shortVisitsMargin = chargeRevenue - totalPayCost;
      shortVisitsMarginPercentage = chargeRevenue > 0 ? (shortVisitsMargin / chargeRevenue) * 100 : 0;
    }

    setResults({
      totalRevenue,
      totalStaffCost,
      grossMargin,
      marginPercentage,
      travelCostTotal,
      foodAllowanceTotal,
      chargeRevenue,
      carePayCost,
      travelPayCost,
      totalPayCost,
      shortVisitsMargin,
      shortVisitsMarginPercentage,
    });
  };

  const onQuestionnaireSubmit = (data: QuestionnaireFormData) => {
    createQuestionnaireMutation.mutate(data);
  };

  const downloadQuote = async () => {
    const element = document.getElementById('quote-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.getImageData(0, 0, canvas.width, canvas.height);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`quote-${quoteDetails.customerName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Success",
        description: "Quote downloaded successfully"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Business Tools</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Calculate care package costs and margins with UK employment overheads
          </p>
        </div>
        <Calculator className="h-8 w-8 text-pink-600" />
      </div>
      
      {/* Package Calculator - Direct Access */}

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
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="short-visits" id="short-visits" />
                    <Label htmlFor="short-visits" className="flex items-center gap-2 cursor-pointer">
                      <ArrowRight className="h-4 w-4" />
                      Short Visits
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Standard charge rate for hourly, live-in, and short-visits care */}
              {(packageType !== 'care24x7') && (
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
              ) : packageType === 'short-visits' ? (
                // Short Visits specific inputs
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Short Visits Configuration
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hourly-pay">Hourly Pay (to staff)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="hourly-pay"
                            type="number"
                            step="0.01"
                            placeholder="15.00"
                            className="pl-10"
                            value={calculation.hourlyPay}
                            onChange={(e) => handleInputChange('hourlyPay', e.target.value)}
                            data-testid="input-hourly-pay"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shift-length">Shift Length (Total)</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="shift-length"
                            type="text"
                            className="pl-10 bg-gray-50 dark:bg-gray-800"
                            value={(() => {
                              const careHours = parseFloat(calculation.careHoursDelivered) || 0;
                              const travelMinutes = parseFloat(calculation.travelTimeMinutes) || 0;
                              const travelHours = travelMinutes / 60;
                              const totalHours = careHours + travelHours;
                              return totalHours > 0 ? `${totalHours.toFixed(2)} hours` : 'Auto-calculated';
                            })()}
                            readOnly
                            data-testid="display-shift-length"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Automatically calculated: Care Hours + Travel Time
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="care-hours-delivered">Care Hours Delivered</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="care-hours-delivered"
                            type="number"
                            step="0.5"
                            placeholder="5.0"
                            className="pl-10"
                            value={calculation.careHoursDelivered}
                            onChange={(e) => handleInputChange('careHoursDelivered', e.target.value)}
                            data-testid="input-care-hours-delivered"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="travel-time-minutes">Travel Time (minutes)</Label>
                        <div className="relative">
                          <ArrowRight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="travel-time-minutes"
                            type="number"
                            step="1"
                            placeholder="60"
                            className="pl-10"
                            value={calculation.travelTimeMinutes}
                            onChange={(e) => handleInputChange('travelTimeMinutes', e.target.value)}
                            data-testid="input-travel-time-minutes"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Fixed Minimum Wage Info */}
                    <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                        <Info className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Travel time paid at minimum wage: £{calculation.minimumWage.toFixed(2)} per hour
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Standard carer wage and travel costs (exclude for 24/7 care and short visits) */}
              {packageType !== 'care24x7' && packageType !== 'short-visits' && (
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

              {/* Employment Cost Rates (exclude for short visits) */}
              {packageType !== 'short-visits' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">UK Employment Costs (%)</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="national-insurance">National Insurance (%)</Label>
                    <div className="relative">
                      <Input
                        id="national-insurance"
                        type="number"
                        step="0.1"
                        placeholder="15.0"
                        value={calculation.nationalInsurance}
                        onChange={(e) => handleInputChange('nationalInsurance', parseFloat(e.target.value) || 0)}
                        data-testid="input-national-insurance"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pension">Pension Contribution (%)</Label>
                    <div className="relative">
                      <Input
                        id="pension"
                        type="number"
                        step="0.1"
                        placeholder="3.0"
                        value={calculation.pension}
                        onChange={(e) => handleInputChange('pension', parseFloat(e.target.value) || 0)}
                        data-testid="input-pension"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="holiday-pay">Holiday Pay (%)</Label>
                    <div className="relative">
                      <Input
                        id="holiday-pay"
                        type="number"
                        step="0.01"
                        placeholder="12.07"
                        value={calculation.holidayPay}
                        onChange={(e) => handleInputChange('holidayPay', parseFloat(e.target.value) || 0)}
                        data-testid="input-holiday-pay"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold mb-4">Financial Analysis</h3>
                <Button onClick={calculateResults} className="mb-4" data-testid="button-calculate">
                  Calculate
                </Button>
              </div>

              {packageType === 'short-visits' ? (
                // Short Visits Results Display
                <div className="space-y-4">
                  <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-900 dark:text-green-100">Revenue (Care Hours × Rate)</span>
                          <span className="text-lg font-bold text-green-900 dark:text-green-100" data-testid="result-charge-revenue">
                            {formatCurrency(results.chargeRevenue)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-800 dark:text-green-200">Care Pay Cost</span>
                          <span className="text-sm text-green-800 dark:text-green-200" data-testid="result-care-pay-cost">
                            {formatCurrency(results.carePayCost)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-800 dark:text-green-200">Travel Pay Cost</span>
                          <span className="text-sm text-green-800 dark:text-green-200" data-testid="result-travel-pay-cost">
                            {formatCurrency(results.travelPayCost)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-green-300 dark:border-green-700 pt-2">
                          <span className="text-sm font-medium text-green-900 dark:text-green-100">Total Pay Cost</span>
                          <span className="text-sm font-bold text-green-900 dark:text-green-100" data-testid="result-total-pay-cost">
                            {formatCurrency(results.totalPayCost)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-green-300 dark:border-green-700 pt-2">
                          <span className="font-semibold text-green-900 dark:text-green-100">Gross Margin</span>
                          <span className="text-xl font-bold text-green-900 dark:text-green-100" data-testid="result-short-visits-margin">
                            {formatCurrency(results.shortVisitsMargin)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-green-900 dark:text-green-100">Margin %</span>
                          <span className="text-xl font-bold text-green-900 dark:text-green-100" data-testid="result-short-visits-margin-percentage">
                            {results.shortVisitsMarginPercentage.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                // Standard Results Display (for other package types)
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Total Revenue</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400" data-testid="result-total-revenue">
                            {formatCurrency(results.totalRevenue)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Total Staff Cost</span>
                          <span className="text-lg font-bold text-red-600 dark:text-red-400" data-testid="result-total-staff-cost">
                            {formatCurrency(results.totalStaffCost)}
                          </span>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Gross Margin</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="result-gross-margin">
                              {formatCurrency(results.grossMargin)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-semibold">Margin %</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="result-margin-percentage">
                              {results.marginPercentage.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Quote Generation Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={results.totalRevenue === 0}
                    data-testid="button-generate-quote"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generate Quote
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Generate Customer Quote</DialogTitle>
                    <DialogDescription>
                      Enter customer details to generate a professional quote
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer-name">Customer Name</Label>
                      <Input
                        id="customer-name"
                        placeholder="Enter customer name"
                        value={quoteDetails.customerName}
                        onChange={(e) => setQuoteDetails(prev => ({ ...prev, customerName: e.target.value }))}
                        data-testid="input-customer-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relating-to">Relating To</Label>
                      <Input
                        id="relating-to"
                        placeholder="e.g., John Smith (father)"
                        value={quoteDetails.relatingTo}
                        onChange={(e) => setQuoteDetails(prev => ({ ...prev, relatingTo: e.target.value }))}
                        data-testid="input-relating-to"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="selected-service">Service Type</Label>
                      <Select value={quoteDetails.selectedService} onValueChange={(value) => setQuoteDetails(prev => ({ ...prev, selectedService: value }))}>
                        <SelectTrigger data-testid="select-service-type">
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly-care">Hourly Care</SelectItem>
                          <SelectItem value="live-in-care">Live-In Care</SelectItem>
                          <SelectItem value="24x7-care">24/7 Care</SelectItem>
                          <SelectItem value="short-visits">Short Visits</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="care-needs">Care Requirements</Label>
                      <Textarea
                        id="care-needs"
                        placeholder="Describe the care requirements..."
                        value={quoteDetails.careNeeds}
                        onChange={(e) => setQuoteDetails(prev => ({ ...prev, careNeeds: e.target.value }))}
                        data-testid="textarea-care-needs"
                      />
                    </div>
                    <Button 
                      onClick={() => {
                        calculateResults();
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
      
      {/* Quote Generation Dialog */}
      <Dialog open={showQuote} onOpenChange={setShowQuote}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Care Package Quote</DialogTitle>
            <DialogDescription>
              Professional care package quote for {quoteDetails.customerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6" id="quote-content">
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h1 className="text-2xl font-bold text-pink-600">Smeaton Healthcare</h1>
                <p className="text-gray-600">Professional Care Services</p>
                <p className="text-sm text-gray-500">Devon & Cornwall</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Quote Date: {new Date().toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Valid for 30 days</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Customer Details</h3>
                <div className="text-sm space-y-1">
                  <div><strong>Name:</strong> {quoteDetails.customerName}</div>
                  <div><strong>Relating to:</strong> {quoteDetails.relatingTo}</div>
                  <div><strong>Service:</strong> {quoteDetails.selectedService}</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Care Requirements</h3>
                <p className="text-sm">{quoteDetails.careNeeds}</p>
              </div>
            </div>

            {/* Service Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Service Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div>
                  <strong>Package Type:</strong> {packageType === 'hourly' ? 'Hourly Care' : 
                                                packageType === 'live-in' ? 'Live-In Care' : 
                                                packageType === 'care24x7' ? '24/7 Care' : 'Short Visits'}
                </div>
                {packageType === 'hourly' && (
                  <div>
                    <strong>Hours per Shift:</strong> {calculation.hours || 0}
                  </div>
                )}
                {packageType === 'live-in' && (
                  <>
                    <div>
                      <strong>Hours per Day:</strong> {calculation.hoursPerDay || 0}
                    </div>
                    <div>
                      <strong>Number of Days:</strong> {calculation.days || 0}
                    </div>
                  </>
                )}
                {packageType === 'care24x7' && (
                  <>
                    <div>
                      <strong>Day Hours:</strong> {calculation.dayHours || 0} ({calculation.calcMode === 'weekly' ? 'per day' : 'total'})
                    </div>
                    <div>
                      <strong>Night Hours:</strong> {calculation.nightHours || 0} ({calculation.calcMode === 'weekly' ? 'per night' : 'total'})
                    </div>
                    {calculation.calcMode === 'weekly' && (
                      <div>
                        <strong>Number of Days:</strong> {calculation.periodDays || 0}
                      </div>
                    )}
                  </>
                )}
                {packageType === 'short-visits' && (
                  <>
                    <div>
                      <strong>Care Hours Delivered:</strong> {calculation.careHoursDelivered || 0}
                    </div>
                    <div>
                      <strong>Travel Time:</strong> {calculation.travelTimeMinutes || 0} minutes
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