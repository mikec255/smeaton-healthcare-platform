import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calculator, 
  TrendingUp, 
  PoundSterling, 
  Users, 
  Clock, 
  Calendar, 
  Info, 
  Download,
  ArrowRight,
  Utensils
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useLocation } from 'wouter';
import { PageHeader } from '@/components/layout/page-header';
import { generateBreadcrumbs } from '@/config/admin-nav';

// Fixed employment rates - NOT editable
const EMPLOYMENT_RATES = {
  nationalInsurance: 15.0,
  pension: 3.0,
  holidayPay: 12.07
};

interface HourlyCalculation {
  chargeRate: string;
  hours: string;
  carerWage: string;
  travelCosts: string;
}

interface LiveInCalculation {
  chargeRate: string;
  hoursPerDay: string;
  days: string;
  carerWage: string;
  travelCosts: string;
  foodAllowance: string;
}

interface Care24x7Calculation {
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
  foodAllowance: string;
}

interface ShortVisitsCalculation {
  chargeRate: string;
  hourlyPay: string;
  careHoursDelivered: string;
  travelTimeMinutes: string;
  minimumWage: number;
}

interface DetailedResults {
  totalRevenue: number;
  grossWage: number;
  nationalInsuranceCost: number;
  pensionCost: number;
  holidayPayCost: number;
  travelCostTotal: number;
  foodAllowanceTotal: number;
  totalStaffCost: number;
  grossMargin: number;
  marginPercentage: number;
}

interface ShortVisitsResults {
  chargeRevenue: number;
  carePayCost: number;
  travelPayCost: number;
  grossWage: number;
  nationalInsuranceCost: number;
  pensionCost: number;
  holidayPayCost: number;
  totalPayCost: number;
  margin: number;
  marginPercentage: number;
}

interface QuoteDetails {
  customerName: string;
  relatingTo: string;
  careNeeds: string;
  selectedService: string;
}

export default function AdminTools() {
  const [location] = useLocation();
  const breadcrumbs = generateBreadcrumbs(location);
  const [hourlyCalc, setHourlyCalc] = useState<HourlyCalculation>({
    chargeRate: '',
    hours: '',
    carerWage: '',
    travelCosts: ''
  });

  const [liveInCalc, setLiveInCalc] = useState<LiveInCalculation>({
    chargeRate: '',
    hoursPerDay: '',
    days: '',
    carerWage: '',
    travelCosts: '',
    foodAllowance: ''
  });

  const [care24x7Calc, setCare24x7Calc] = useState<Care24x7Calculation>({
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
    foodAllowance: ''
  });

  const [shortVisitsCalc, setShortVisitsCalc] = useState<ShortVisitsCalculation>({
    chargeRate: '',
    hourlyPay: '',
    careHoursDelivered: '',
    travelTimeMinutes: '',
    minimumWage: 12.21
  });

  const [hourlyResults, setHourlyResults] = useState<DetailedResults>({
    totalRevenue: 0,
    grossWage: 0,
    nationalInsuranceCost: 0,
    pensionCost: 0,
    holidayPayCost: 0,
    travelCostTotal: 0,
    foodAllowanceTotal: 0,
    totalStaffCost: 0,
    grossMargin: 0,
    marginPercentage: 0
  });

  const [liveInResults, setLiveInResults] = useState<DetailedResults>({
    totalRevenue: 0,
    grossWage: 0,
    nationalInsuranceCost: 0,
    pensionCost: 0,
    holidayPayCost: 0,
    travelCostTotal: 0,
    foodAllowanceTotal: 0,
    totalStaffCost: 0,
    grossMargin: 0,
    marginPercentage: 0
  });

  const [care24x7Results, setCare24x7Results] = useState<DetailedResults>({
    totalRevenue: 0,
    grossWage: 0,
    nationalInsuranceCost: 0,
    pensionCost: 0,
    holidayPayCost: 0,
    travelCostTotal: 0,
    foodAllowanceTotal: 0,
    totalStaffCost: 0,
    grossMargin: 0,
    marginPercentage: 0
  });

  const [shortVisitsResults, setShortVisitsResults] = useState<ShortVisitsResults>({
    chargeRevenue: 0,
    carePayCost: 0,
    travelPayCost: 0,
    grossWage: 0,
    nationalInsuranceCost: 0,
    pensionCost: 0,
    holidayPayCost: 0,
    totalPayCost: 0,
    margin: 0,
    marginPercentage: 0
  });

  const [showQuote, setShowQuote] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails>({
    customerName: '',
    relatingTo: '',
    careNeeds: '',
    selectedService: ''
  });
  const [activeCalculator, setActiveCalculator] = useState('hourly');

  const { toast } = useToast();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  // Auto-calculate on input changes
  useEffect(() => {
    calculateHourly();
  }, [hourlyCalc.chargeRate, hourlyCalc.hours, hourlyCalc.carerWage, hourlyCalc.travelCosts]);

  useEffect(() => {
    calculateLiveIn();
  }, [liveInCalc.chargeRate, liveInCalc.hoursPerDay, liveInCalc.days, liveInCalc.carerWage, liveInCalc.travelCosts, liveInCalc.foodAllowance]);

  useEffect(() => {
    calculateCare24x7();
  }, [care24x7Calc.calcMode, care24x7Calc.periodDays, care24x7Calc.dayChargeRate, care24x7Calc.nightChargeRate, care24x7Calc.dayWageRate, care24x7Calc.nightWageRate, care24x7Calc.dayHours, care24x7Calc.nightHours, care24x7Calc.travelDayPerShift, care24x7Calc.travelNightPerShift, care24x7Calc.foodAllowance]);

  useEffect(() => {
    calculateShortVisits();
  }, [shortVisitsCalc.chargeRate, shortVisitsCalc.hourlyPay, shortVisitsCalc.careHoursDelivered, shortVisitsCalc.travelTimeMinutes, shortVisitsCalc.minimumWage]);

  const calculateHourly = () => {
    const chargeRate = parseFloat(hourlyCalc.chargeRate) || 0;
    const hours = parseFloat(hourlyCalc.hours) || 0;
    const carerWage = parseFloat(hourlyCalc.carerWage) || 0;
    const travelCosts = parseFloat(hourlyCalc.travelCosts) || 0;

    const totalRevenue = hours * chargeRate;
    const grossWage = hours * carerWage;
    const nationalInsuranceCost = grossWage * (EMPLOYMENT_RATES.nationalInsurance / 100);
    const pensionCost = grossWage * (EMPLOYMENT_RATES.pension / 100);
    const holidayPayCost = grossWage * (EMPLOYMENT_RATES.holidayPay / 100);
    const totalStaffCost = grossWage + nationalInsuranceCost + pensionCost + holidayPayCost + travelCosts;
    const grossMargin = totalRevenue - totalStaffCost;
    const marginPercentage = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

    setHourlyResults({
      totalRevenue,
      grossWage,
      nationalInsuranceCost,
      pensionCost,
      holidayPayCost,
      travelCostTotal: travelCosts,
      foodAllowanceTotal: 0,
      totalStaffCost,
      grossMargin,
      marginPercentage
    });
  };

  const calculateLiveIn = () => {
    const chargeRate = parseFloat(liveInCalc.chargeRate) || 0;
    const hoursPerDay = parseFloat(liveInCalc.hoursPerDay) || 0;
    const days = parseFloat(liveInCalc.days) || 0;
    const carerWage = parseFloat(liveInCalc.carerWage) || 0;
    const travelCosts = parseFloat(liveInCalc.travelCosts) || 0;
    const foodAllowance = parseFloat(liveInCalc.foodAllowance) || 0;

    const totalHours = hoursPerDay * days;
    const totalRevenue = totalHours * chargeRate;
    const grossWage = totalHours * carerWage;
    const nationalInsuranceCost = grossWage * (EMPLOYMENT_RATES.nationalInsurance / 100);
    const pensionCost = grossWage * (EMPLOYMENT_RATES.pension / 100);
    const holidayPayCost = grossWage * (EMPLOYMENT_RATES.holidayPay / 100);
    const totalStaffCost = grossWage + nationalInsuranceCost + pensionCost + holidayPayCost + travelCosts + foodAllowance;
    const grossMargin = totalRevenue - totalStaffCost;
    const marginPercentage = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

    setLiveInResults({
      totalRevenue,
      grossWage,
      nationalInsuranceCost,
      pensionCost,
      holidayPayCost,
      travelCostTotal: travelCosts,
      foodAllowanceTotal: foodAllowance,
      totalStaffCost,
      grossMargin,
      marginPercentage
    });
  };

  const calculateCare24x7 = () => {
    const dayChargeRate = parseFloat(care24x7Calc.dayChargeRate) || 0;
    const nightChargeRate = parseFloat(care24x7Calc.nightChargeRate) || 0;
    const dayWageRate = parseFloat(care24x7Calc.dayWageRate) || 0;
    const nightWageRate = parseFloat(care24x7Calc.nightWageRate) || 0;
    const dayHours = parseFloat(care24x7Calc.dayHours) || 0;
    const nightHours = parseFloat(care24x7Calc.nightHours) || 0;
    const travelDayPerShift = parseFloat(care24x7Calc.travelDayPerShift) || 0;
    const travelNightPerShift = parseFloat(care24x7Calc.travelNightPerShift) || 0;
    const foodAllowance = parseFloat(care24x7Calc.foodAllowance) || 0;

    let totalDayHours = dayHours;
    let totalNightHours = nightHours;
    let totalTravelCosts = travelDayPerShift + travelNightPerShift;
    let totalFoodAllowance = 0;

    if (care24x7Calc.calcMode === 'weekly') {
      const periodDays = parseFloat(care24x7Calc.periodDays) || 0;
      totalDayHours = dayHours * periodDays;
      totalNightHours = nightHours * periodDays;
      totalTravelCosts = (travelDayPerShift + travelNightPerShift) * periodDays;
      totalFoodAllowance = foodAllowance;
    }

    const dayRevenue = totalDayHours * dayChargeRate;
    const nightRevenue = totalNightHours * nightChargeRate;
    const totalRevenue = dayRevenue + nightRevenue;

    const dayWage = dayWageRate * totalDayHours;
    const nightWage = nightWageRate * totalNightHours;
    const grossWage = dayWage + nightWage;

    const nationalInsuranceCost = grossWage * (EMPLOYMENT_RATES.nationalInsurance / 100);
    const pensionCost = grossWage * (EMPLOYMENT_RATES.pension / 100);
    const holidayPayCost = grossWage * (EMPLOYMENT_RATES.holidayPay / 100);
    const totalStaffCost = grossWage + nationalInsuranceCost + pensionCost + holidayPayCost + totalTravelCosts + totalFoodAllowance;
    const grossMargin = totalRevenue - totalStaffCost;
    const marginPercentage = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

    setCare24x7Results({
      totalRevenue,
      grossWage,
      nationalInsuranceCost,
      pensionCost,
      holidayPayCost,
      travelCostTotal: totalTravelCosts,
      foodAllowanceTotal: totalFoodAllowance,
      totalStaffCost,
      grossMargin,
      marginPercentage
    });
  };

  const calculateShortVisits = () => {
    const chargeRate = parseFloat(shortVisitsCalc.chargeRate) || 0;
    const hourlyPay = parseFloat(shortVisitsCalc.hourlyPay) || 0;
    const careHoursDelivered = parseFloat(shortVisitsCalc.careHoursDelivered) || 0;
    const travelTimeMinutes = parseFloat(shortVisitsCalc.travelTimeMinutes) || 0;
    const minimumWage = shortVisitsCalc.minimumWage;

    const chargeRevenue = careHoursDelivered * chargeRate;
    const carePayCost = careHoursDelivered * hourlyPay;
    const travelPayCost = (travelTimeMinutes / 60) * minimumWage;
    const grossWage = carePayCost + travelPayCost;
    
    // Apply employment costs like other calculators
    const nationalInsuranceCost = grossWage * (EMPLOYMENT_RATES.nationalInsurance / 100);
    const pensionCost = grossWage * (EMPLOYMENT_RATES.pension / 100);
    const holidayPayCost = grossWage * (EMPLOYMENT_RATES.holidayPay / 100);
    
    const totalPayCost = grossWage + nationalInsuranceCost + pensionCost + holidayPayCost;
    const margin = chargeRevenue - totalPayCost;
    const marginPercentage = chargeRevenue > 0 ? (margin / chargeRevenue) * 100 : 0;

    setShortVisitsResults({ 
      chargeRevenue, 
      carePayCost, 
      travelPayCost, 
      grossWage,
      nationalInsuranceCost,
      pensionCost,
      holidayPayCost,
      totalPayCost, 
      margin, 
      marginPercentage 
    });
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
    <div className="space-y-8 max-w-5xl mx-auto px-4 lg:px-8 xl:px-12">
      <PageHeader
        title="Package Calculators"
        description="Calculate care package costs and margins with UK employment overheads"
        breadcrumbs={breadcrumbs}
      />

      {/* Package Calculators */}
      <Tabs defaultValue="hourly" className="w-full px-2 sm:px-4 lg:px-6" onValueChange={setActiveCalculator}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
          <TabsTrigger value="hourly" data-testid="tab-hourly-care" className="text-xs sm:text-sm">
            <Clock className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Hourly Care</span>
            <span className="sm:hidden">Hourly</span>
          </TabsTrigger>
          <TabsTrigger value="live-in" data-testid="tab-live-in-care" className="text-xs sm:text-sm">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Live-In Care</span>
            <span className="sm:hidden">Live-In</span>
          </TabsTrigger>
          <TabsTrigger value="care24x7" data-testid="tab-24x7-care" className="text-xs sm:text-sm">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">24/7 Care</span>
            <span className="sm:hidden">24/7</span>
          </TabsTrigger>
          <TabsTrigger value="short-visits" data-testid="tab-short-visits" className="text-xs sm:text-sm">
            <ArrowRight className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Short Visits</span>
            <span className="sm:hidden">Visits</span>
          </TabsTrigger>
        </TabsList>

        {/* Hourly Care Calculator */}
        <TabsContent value="hourly">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Hourly Care Calculator
              </CardTitle>
              <CardDescription>
                Calculate costs for hourly care services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Service Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hourly-charge-rate">Charge Rate (per hour)</Label>
                    <div className="relative">
                      <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="hourly-charge-rate"
                        type="number"
                        step="0.01"
                        placeholder="25.00"
                        className="pl-10"
                        value={hourlyCalc.chargeRate}
                        onChange={(e) => setHourlyCalc(prev => ({ ...prev, chargeRate: e.target.value }))}
                        data-testid="input-hourly-charge-rate"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourly-hours">Hours per Shift</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="hourly-hours"
                        type="number"
                        step="0.5"
                        placeholder="8.0"
                        className="pl-10"
                        value={hourlyCalc.hours}
                        onChange={(e) => setHourlyCalc(prev => ({ ...prev, hours: e.target.value }))}
                        data-testid="input-hourly-hours"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourly-carer-wage">Carer Wage (per hour)</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="hourly-carer-wage"
                        type="number"
                        step="0.01"
                        placeholder="12.50"
                        className="pl-10"
                        value={hourlyCalc.carerWage}
                        onChange={(e) => setHourlyCalc(prev => ({ ...prev, carerWage: e.target.value }))}
                        data-testid="input-hourly-carer-wage"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourly-travel-costs">Travel Costs (per shift)</Label>
                    <div className="relative">
                      <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="hourly-travel-costs"
                        type="number"
                        step="0.01"
                        placeholder="5.00"
                        className="pl-10"
                        value={hourlyCalc.travelCosts}
                        onChange={(e) => setHourlyCalc(prev => ({ ...prev, travelCosts: e.target.value }))}
                        data-testid="input-hourly-travel-costs"
                      />
                    </div>
                  </div>
                </div>

                {/* Results Section with DETAILED BREAKDOWN */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Financial Analysis</h3>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">Total Revenue</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400" data-testid="result-hourly-total-revenue">
                            {formatCurrency(hourlyResults.totalRevenue)}
                          </span>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                          <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Cost Breakdown:</div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Gross Wage</span>
                            <span data-testid="result-hourly-gross-wage">{formatCurrency(hourlyResults.grossWage)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">National Insurance ({EMPLOYMENT_RATES.nationalInsurance}%)</span>
                            <span data-testid="result-hourly-ni-cost">{formatCurrency(hourlyResults.nationalInsuranceCost)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Pension ({EMPLOYMENT_RATES.pension}%)</span>
                            <span data-testid="result-hourly-pension-cost">{formatCurrency(hourlyResults.pensionCost)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Holiday Pay ({EMPLOYMENT_RATES.holidayPay}%)</span>
                            <span data-testid="result-hourly-holiday-cost">{formatCurrency(hourlyResults.holidayPayCost)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Travel Costs</span>
                            <span data-testid="result-hourly-travel-cost">{formatCurrency(hourlyResults.travelCostTotal)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm font-medium border-t border-gray-200 dark:border-gray-700 pt-2">
                            <span className="text-red-600 dark:text-red-400">Total Staff Cost</span>
                            <span className="text-red-600 dark:text-red-400" data-testid="result-hourly-total-staff-cost">
                              {formatCurrency(hourlyResults.totalStaffCost)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Gross Margin</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="result-hourly-gross-margin">
                              {formatCurrency(hourlyResults.grossMargin)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Margin %</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="result-hourly-margin-percentage">
                              {hourlyResults.marginPercentage.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Generate Quote Button */}
                  <div className="flex justify-center mt-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-64"
                          disabled={hourlyResults.totalRevenue === 0}
                          data-testid="button-generate-quote-hourly"
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
                            onClick={() => setShowQuote(true)}
                            disabled={!quoteDetails.customerName || !quoteDetails.selectedService}
                            data-testid="button-create-quote"
                          >
                            Create Quote
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live-In Care Calculator */}
        <TabsContent value="live-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Live-In Care Calculator
              </CardTitle>
              <CardDescription>
                Calculate costs for live-in care services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Service Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="livein-charge-rate">Charge Rate (per hour)</Label>
                    <div className="relative">
                      <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="livein-charge-rate"
                        type="number"
                        step="0.01"
                        placeholder="25.00"
                        className="pl-10"
                        value={liveInCalc.chargeRate}
                        onChange={(e) => setLiveInCalc(prev => ({ ...prev, chargeRate: e.target.value }))}
                        data-testid="input-livein-charge-rate"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="livein-hours-per-day">Hours of Care (per day)</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="livein-hours-per-day"
                        type="number"
                        step="0.5"
                        placeholder="12.0"
                        className="pl-10"
                        value={liveInCalc.hoursPerDay}
                        onChange={(e) => setLiveInCalc(prev => ({ ...prev, hoursPerDay: e.target.value }))}
                        data-testid="input-livein-hours-per-day"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="livein-days">Number of Days</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="livein-days"
                        type="number"
                        step="1"
                        placeholder="7"
                        className="pl-10"
                        value={liveInCalc.days}
                        onChange={(e) => setLiveInCalc(prev => ({ ...prev, days: e.target.value }))}
                        data-testid="input-livein-days"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="livein-carer-wage">Carer Wage (per hour)</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="livein-carer-wage"
                        type="number"
                        step="0.01"
                        placeholder="12.50"
                        className="pl-10"
                        value={liveInCalc.carerWage}
                        onChange={(e) => setLiveInCalc(prev => ({ ...prev, carerWage: e.target.value }))}
                        data-testid="input-livein-carer-wage"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="livein-travel-costs">Travel Costs (one-time for period)</Label>
                    <div className="relative">
                      <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="livein-travel-costs"
                        type="number"
                        step="0.01"
                        placeholder="50.00"
                        className="pl-10"
                        value={liveInCalc.travelCosts}
                        onChange={(e) => setLiveInCalc(prev => ({ ...prev, travelCosts: e.target.value }))}
                        data-testid="input-livein-travel-costs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="livein-food-allowance">Food Allowance (total for period)</Label>
                    <div className="relative">
                      <Utensils className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="livein-food-allowance"
                        type="number"
                        step="0.01"
                        placeholder="50.00"
                        className="pl-10"
                        value={liveInCalc.foodAllowance}
                        onChange={(e) => setLiveInCalc(prev => ({ ...prev, foodAllowance: e.target.value }))}
                        data-testid="input-livein-food-allowance"
                      />
                    </div>
                  </div>
                </div>

                {/* Results Section with DETAILED BREAKDOWN */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Financial Analysis</h3>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">Total Revenue</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400" data-testid="result-livein-total-revenue">
                            {formatCurrency(liveInResults.totalRevenue)}
                          </span>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                          <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Cost Breakdown:</div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Gross Wage</span>
                            <span data-testid="result-livein-gross-wage">{formatCurrency(liveInResults.grossWage)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">National Insurance ({EMPLOYMENT_RATES.nationalInsurance}%)</span>
                            <span data-testid="result-livein-ni-cost">{formatCurrency(liveInResults.nationalInsuranceCost)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Pension ({EMPLOYMENT_RATES.pension}%)</span>
                            <span data-testid="result-livein-pension-cost">{formatCurrency(liveInResults.pensionCost)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Holiday Pay ({EMPLOYMENT_RATES.holidayPay}%)</span>
                            <span data-testid="result-livein-holiday-cost">{formatCurrency(liveInResults.holidayPayCost)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Travel Costs</span>
                            <span data-testid="result-livein-travel-cost">{formatCurrency(liveInResults.travelCostTotal)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Food Allowance</span>
                            <span data-testid="result-livein-food-cost">{formatCurrency(liveInResults.foodAllowanceTotal)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm font-medium border-t border-gray-200 dark:border-gray-700 pt-2">
                            <span className="text-red-600 dark:text-red-400">Total Staff Cost</span>
                            <span className="text-red-600 dark:text-red-400" data-testid="result-livein-total-staff-cost">
                              {formatCurrency(liveInResults.totalStaffCost)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Gross Margin</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="result-livein-gross-margin">
                              {formatCurrency(liveInResults.grossMargin)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Margin %</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="result-livein-margin-percentage">
                              {liveInResults.marginPercentage.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 24/7 Care Calculator */}
        <TabsContent value="care24x7">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                24/7 Care Calculator
              </CardTitle>
              <CardDescription>
                Calculate costs for 24/7 care services with day and night rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Service Details</h3>
                  
                  {/* Calculation Mode Toggle */}
                  <div className="space-y-2">
                    <Label>Calculation Mode</Label>
                    <RadioGroup 
                      value={care24x7Calc.calcMode} 
                      onValueChange={(value) => setCare24x7Calc(prev => ({ ...prev, calcMode: value as 'hourly' | 'weekly' }))}
                      className="flex gap-6"
                      data-testid="radio-24x7-calc-mode"
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
                  {care24x7Calc.calcMode === 'weekly' && (
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
                          value={care24x7Calc.periodDays}
                          onChange={(e) => setCare24x7Calc(prev => ({ ...prev, periodDays: e.target.value }))}
                          data-testid="input-24x7-period-days"
                        />
                      </div>
                    </div>
                  )}

                  {/* Day Rates Section */}
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center gap-2">
                      <PoundSterling className="h-4 w-4" />
                      Day Shift Rates
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="day-charge-rate">Day Charge Rate (per hour)</Label>
                        <div className="relative">
                          <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="day-charge-rate"
                            type="number"
                            step="0.01"
                            placeholder="25.00"
                            className="pl-10"
                            value={care24x7Calc.dayChargeRate}
                            onChange={(e) => setCare24x7Calc(prev => ({ ...prev, dayChargeRate: e.target.value }))}
                            data-testid="input-24x7-day-charge-rate"
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
                            value={care24x7Calc.dayWageRate}
                            onChange={(e) => setCare24x7Calc(prev => ({ ...prev, dayWageRate: e.target.value }))}
                            data-testid="input-24x7-day-wage-rate"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="day-hours">Day Hours ({care24x7Calc.calcMode === 'weekly' ? 'per day' : 'total'})</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="day-hours"
                            type="number"
                            step="0.5"
                            placeholder="12.0"
                            className="pl-10"
                            value={care24x7Calc.dayHours}
                            onChange={(e) => setCare24x7Calc(prev => ({ ...prev, dayHours: e.target.value }))}
                            data-testid="input-24x7-day-hours"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="travel-day">Day Travel Cost ({care24x7Calc.calcMode === 'weekly' ? 'per day' : 'total'})</Label>
                        <div className="relative">
                          <ArrowRight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="travel-day"
                            type="number"
                            step="0.01"
                            placeholder="10.00"
                            className="pl-10"
                            value={care24x7Calc.travelDayPerShift}
                            onChange={(e) => setCare24x7Calc(prev => ({ ...prev, travelDayPerShift: e.target.value }))}
                            data-testid="input-24x7-travel-day"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Night Rates Section */}
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                      <PoundSterling className="h-4 w-4" />
                      Night Shift Rates
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="night-charge-rate">Night Charge Rate (per hour)</Label>
                        <div className="relative">
                          <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="night-charge-rate"
                            type="number"
                            step="0.01"
                            placeholder="30.00"
                            className="pl-10"
                            value={care24x7Calc.nightChargeRate}
                            onChange={(e) => setCare24x7Calc(prev => ({ ...prev, nightChargeRate: e.target.value }))}
                            data-testid="input-24x7-night-charge-rate"
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
                            value={care24x7Calc.nightWageRate}
                            onChange={(e) => setCare24x7Calc(prev => ({ ...prev, nightWageRate: e.target.value }))}
                            data-testid="input-24x7-night-wage-rate"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="night-hours">Night Hours ({care24x7Calc.calcMode === 'weekly' ? 'per night' : 'total'})</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="night-hours"
                            type="number"
                            step="0.5"
                            placeholder="12.0"
                            className="pl-10"
                            value={care24x7Calc.nightHours}
                            onChange={(e) => setCare24x7Calc(prev => ({ ...prev, nightHours: e.target.value }))}
                            data-testid="input-24x7-night-hours"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="travel-night">Night Travel Cost ({care24x7Calc.calcMode === 'weekly' ? 'per night' : 'total'})</Label>
                        <div className="relative">
                          <ArrowRight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="travel-night"
                            type="number"
                            step="0.01"
                            placeholder="10.00"
                            className="pl-10"
                            value={care24x7Calc.travelNightPerShift}
                            onChange={(e) => setCare24x7Calc(prev => ({ ...prev, travelNightPerShift: e.target.value }))}
                            data-testid="input-24x7-travel-night"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Food Allowance (only for weekly) */}
                  {care24x7Calc.calcMode === 'weekly' && (
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
                          value={care24x7Calc.foodAllowance}
                          onChange={(e) => setCare24x7Calc(prev => ({ ...prev, foodAllowance: e.target.value }))}
                          data-testid="input-24x7-food-allowance"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Results Section with DETAILED BREAKDOWN */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Financial Analysis</h3>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">Total Revenue</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400" data-testid="result-24x7-total-revenue">
                            {formatCurrency(care24x7Results.totalRevenue)}
                          </span>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                          <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Cost Breakdown:</div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Gross Wage</span>
                            <span data-testid="result-24x7-gross-wage">{formatCurrency(care24x7Results.grossWage)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">National Insurance ({EMPLOYMENT_RATES.nationalInsurance}%)</span>
                            <span data-testid="result-24x7-ni-cost">{formatCurrency(care24x7Results.nationalInsuranceCost)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Pension ({EMPLOYMENT_RATES.pension}%)</span>
                            <span data-testid="result-24x7-pension-cost">{formatCurrency(care24x7Results.pensionCost)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Holiday Pay ({EMPLOYMENT_RATES.holidayPay}%)</span>
                            <span data-testid="result-24x7-holiday-cost">{formatCurrency(care24x7Results.holidayPayCost)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Travel Costs</span>
                            <span data-testid="result-24x7-travel-cost">{formatCurrency(care24x7Results.travelCostTotal)}</span>
                          </div>
                          
                          {care24x7Results.foodAllowanceTotal > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Food Allowance</span>
                              <span data-testid="result-24x7-food-cost">{formatCurrency(care24x7Results.foodAllowanceTotal)}</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center text-sm font-medium border-t border-gray-200 dark:border-gray-700 pt-2">
                            <span className="text-red-600 dark:text-red-400">Total Staff Cost</span>
                            <span className="text-red-600 dark:text-red-400" data-testid="result-24x7-total-staff-cost">
                              {formatCurrency(care24x7Results.totalStaffCost)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Gross Margin</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="result-24x7-gross-margin">
                              {formatCurrency(care24x7Results.grossMargin)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Margin %</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="result-24x7-margin-percentage">
                              {care24x7Results.marginPercentage.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Short Visits Calculator */}
        <TabsContent value="short-visits">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Short Visits Calculator
              </CardTitle>
              <CardDescription>
                Calculate costs for short visit care services with separate care and travel pay
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Service Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shortvisits-charge-rate">Charge Rate (per hour)</Label>
                    <div className="relative">
                      <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="shortvisits-charge-rate"
                        type="number"
                        step="0.01"
                        placeholder="25.00"
                        className="pl-10"
                        value={shortVisitsCalc.chargeRate}
                        onChange={(e) => setShortVisitsCalc(prev => ({ ...prev, chargeRate: e.target.value }))}
                        data-testid="input-shortvisits-charge-rate"
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Short Visits Configuration
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shortvisits-hourly-pay">Hourly Pay (to staff)</Label>
                        <div className="relative">
                          <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="shortvisits-hourly-pay"
                            type="number"
                            step="0.01"
                            placeholder="15.00"
                            className="pl-10"
                            value={shortVisitsCalc.hourlyPay}
                            onChange={(e) => setShortVisitsCalc(prev => ({ ...prev, hourlyPay: e.target.value }))}
                            data-testid="input-shortvisits-hourly-pay"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shortvisits-shift-length">Shift Length (Total)</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="shortvisits-shift-length"
                            type="text"
                            className="pl-10 bg-gray-50 dark:bg-gray-800"
                            value={(() => {
                              const careHours = parseFloat(shortVisitsCalc.careHoursDelivered) || 0;
                              const travelMinutes = parseFloat(shortVisitsCalc.travelTimeMinutes) || 0;
                              const travelHours = travelMinutes / 60;
                              const totalHours = careHours + travelHours;
                              return totalHours > 0 ? `${totalHours.toFixed(2)} hours` : 'Auto-calculated';
                            })()}
                            readOnly
                            data-testid="display-shortvisits-shift-length"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Automatically calculated: Care Hours + Travel Time
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shortvisits-care-hours-delivered">Care Hours Delivered</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="shortvisits-care-hours-delivered"
                            type="number"
                            step="0.5"
                            placeholder="5.0"
                            className="pl-10"
                            value={shortVisitsCalc.careHoursDelivered}
                            onChange={(e) => setShortVisitsCalc(prev => ({ ...prev, careHoursDelivered: e.target.value }))}
                            data-testid="input-shortvisits-care-hours-delivered"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shortvisits-travel-time-minutes">Travel Time (minutes)</Label>
                        <div className="relative">
                          <ArrowRight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="shortvisits-travel-time-minutes"
                            type="number"
                            step="1"
                            placeholder="60"
                            className="pl-10"
                            value={shortVisitsCalc.travelTimeMinutes}
                            onChange={(e) => setShortVisitsCalc(prev => ({ ...prev, travelTimeMinutes: e.target.value }))}
                            data-testid="input-shortvisits-travel-time-minutes"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Fixed Minimum Wage Info */}
                    <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                        <Info className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Travel time paid at minimum wage: £{shortVisitsCalc.minimumWage.toFixed(2)} per hour
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Section with DETAILED BREAKDOWN */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Financial Analysis</h3>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">Total Revenue</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400" data-testid="result-shortvisits-charge-revenue">
                            {formatCurrency(shortVisitsResults.chargeRevenue)}
                          </span>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                          <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Cost Breakdown:</div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Care Pay Cost</span>
                            <span data-testid="result-shortvisits-care-pay-cost">{formatCurrency(shortVisitsResults.carePayCost)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Travel Pay Cost</span>
                            <span data-testid="result-shortvisits-travel-pay-cost">{formatCurrency(shortVisitsResults.travelPayCost)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Gross Wage</span>
                            <span data-testid="result-shortvisits-gross-wage">{formatCurrency(shortVisitsResults.grossWage)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">National Insurance ({EMPLOYMENT_RATES.nationalInsurance}%)</span>
                            <span data-testid="result-shortvisits-ni-cost">{formatCurrency(shortVisitsResults.nationalInsuranceCost)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Pension ({EMPLOYMENT_RATES.pension}%)</span>
                            <span data-testid="result-shortvisits-pension-cost">{formatCurrency(shortVisitsResults.pensionCost)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Holiday Pay ({EMPLOYMENT_RATES.holidayPay}%)</span>
                            <span data-testid="result-shortvisits-holiday-cost">{formatCurrency(shortVisitsResults.holidayPayCost)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm font-medium border-t border-gray-200 dark:border-gray-700 pt-2">
                            <span className="text-red-600 dark:text-red-400">Total Staff Cost</span>
                            <span className="text-red-600 dark:text-red-400" data-testid="result-shortvisits-total-pay-cost">
                              {formatCurrency(shortVisitsResults.totalPayCost)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Gross Margin</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="result-shortvisits-margin">
                              {formatCurrency(shortVisitsResults.margin)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Margin %</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="result-shortvisits-margin-percentage">
                              {shortVisitsResults.marginPercentage.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Information Panel */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 mt-8">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
              <p className="font-semibold">UK Employment Cost Information:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>National Insurance: Employer contribution rate ({EMPLOYMENT_RATES.nationalInsurance}% current rate)</li>
                <li>Pension: Minimum auto-enrolment employer contribution ({EMPLOYMENT_RATES.pension}%)</li>
                <li>Holiday Pay: Statutory holiday entitlement calculation ({EMPLOYMENT_RATES.holidayPay}%)</li>
              </ul>
              <p className="mt-2 text-xs opacity-80">
                These rates are fixed and may vary based on specific employment arrangements and current legislation.
              </p>
            </div>
          </div>
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

            {/* Cost Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Cost Breakdown</h3>
              <div className="border border-gray-300 rounded">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="p-3">Total Cost</td>
                      <td className="p-3 text-right text-lg">
                        {activeCalculator === 'short-visits' ? 
                          formatCurrency(shortVisitsResults.chargeRevenue) : 
                          activeCalculator === 'hourly' ? formatCurrency(hourlyResults.totalRevenue) :
                          activeCalculator === 'live-in' ? formatCurrency(liveInResults.totalRevenue) :
                          formatCurrency(care24x7Results.totalRevenue)
                        }
                      </td>
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