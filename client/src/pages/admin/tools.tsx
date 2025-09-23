import { useState, useEffect } from "react";
import { Calculator, TrendingUp, Clock, Users, DollarSign, Info, ArrowRight, Calendar, Utensils } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function AdminTools() {
  const [packageType, setPackageType] = useState('hourly'); // 'hourly' or 'live-in'
  const [calculation, setCalculation] = useState({
    chargeRate: '',
    hours: '',
    days: '',
    hoursPerDay: '',
    carerWage: '',
    travelCosts: '',
    foodAllowance: '',
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
  });

  const calculatePackage = () => {
    const chargeRate = parseFloat(calculation.chargeRate) || 0;
    const hours = parseFloat(calculation.hours) || 0;
    const days = parseFloat(calculation.days) || 0;
    const hoursPerDay = parseFloat(calculation.hoursPerDay) || 0;
    const carerWage = parseFloat(calculation.carerWage) || 0;
    const travelCosts = parseFloat(calculation.travelCosts) || 0;
    const foodAllowance = parseFloat(calculation.foodAllowance) || 0;

    // Debug logging
    console.log('Calculate Package Debug:', {
      packageType,
      chargeRate,
      hours,
      days,
      hoursPerDay,
      carerWage
    });

    let totalRevenue = 0;
    let grossWage = 0;
    let totalHours = 0;

    if (packageType === 'hourly') {
      // Hourly package calculations
      totalRevenue = chargeRate * hours;
      grossWage = carerWage * hours;
      totalHours = hours;
    } else {
      // Live-in care package calculations: hourly rate × hours per day × number of days
      totalHours = hoursPerDay * days;
      totalRevenue = chargeRate * totalHours;
      grossWage = carerWage * totalHours;
    }

    console.log('Calculation Results:', {
      totalHours,
      totalRevenue,
      grossWage
    });

    // Staff cost calculations
    const nationalInsuranceCost = grossWage * (calculation.nationalInsurance / 100);
    const pensionCost = grossWage * (calculation.pensionContribution / 100);
    const holidayPayCost = grossWage * (calculation.holidayPay / 100);
    
    const totalStaffCost = grossWage + nationalInsuranceCost + pensionCost + holidayPayCost;
    
    // For live-in care: travel costs and food allowance are applied once for the entire period
    // For hourly care: travel costs are per shift, no food allowance
    const totalOtherCosts = packageType === 'live-in' 
      ? travelCosts + foodAllowance
      : travelCosts;
    
    const totalCosts = totalStaffCost + totalOtherCosts;
    const shiftMargin = totalRevenue - totalCosts;
    const hourlyMargin = totalHours > 0 ? shiftMargin / totalHours : 0;
    const marginPercentage = totalRevenue > 0 ? (shiftMargin / totalRevenue) * 100 : 0;

    setResults({
      totalRevenue,
      totalStaffCost,
      grossWage,
      nationalInsuranceCost,
      pensionCost,
      holidayPayCost,
      travelCostTotal: travelCosts,
      foodAllowanceTotal: foodAllowance,
      totalCosts,
      shiftMargin,
      hourlyMargin,
      marginPercentage,
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

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Tools</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Business tools and calculators for operations management
          </p>
        </div>
        <Calculator className="h-8 w-8 text-pink-600" />
      </div>

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
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="charge-rate">
                  Charge Rate (per {packageType === 'hourly' ? 'hour' : 'day'})
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
              ) : (
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
              )}

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
                      <span>Shift Margin:</span>
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
    </div>
  );
}