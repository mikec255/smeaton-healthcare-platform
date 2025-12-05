import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle, XCircle, AlertCircle, Brain, ArrowRight, ArrowLeft, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { StaffAssessmentTopic, StaffAssessmentLink } from "@shared/schema";

interface AssessmentQuestion {
  id: string;
  text: string;
  type: "scored" | "agreement" | "training" | "text";
  isScored?: boolean;
  points?: number;
  options?: string[];
  required?: boolean;
}

interface AssessmentData {
  id: string;
  title: string;
  description: string;
  introduction: string;
  questions: AssessmentQuestion[];
  branch: string;
  linkId: string;
}

export default function StaffAssessment() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<"intro" | "assessment" | "complete">("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [staffInfo, setStaffInfo] = useState({ name: "", jobTitle: "" });
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    percentageScore: number;
    totalScore: number;
    maxScore: number;
  } | null>(null);

  const { data, isLoading, error } = useQuery<AssessmentData>({
    queryKey: ["/api/assessments", token],
    enabled: !!token,
  });

  const submitMutation = useMutation({
    mutationFn: async (submission: any) => {
      const response = await apiRequest("POST", `/api/assessments/${token}/submit`, submission);
      return await response.json();
    },
    onSuccess: (response: any) => {
      setResult(response);
      setSubmitted(true);
      setCurrentStep("complete");
      toast({
        title: "Assessment Submitted",
        description: "Your assessment has been submitted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit assessment",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-6 w-6" />
                <CardTitle>Assessment Not Available</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This assessment link is invalid, expired, or has been deactivated.
                Please contact your manager for a valid assessment link.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const questions = data.questions || [];
  const passingPercentage = 70; // Default passing percentage

  const handleStartAssessment = () => {
    if (!staffInfo.name.trim() || !staffInfo.jobTitle.trim()) {
      toast({
        title: "Required Information",
        description: "Please enter your name and job title to begin the assessment.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep("assessment");
  };

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;

    questions.forEach(q => {
      if (q.isScored && q.points && q.points > 0) {
        maxScore += q.points;
        const answer = answers[q.id];
        if (answer === 'Yes' || answer === 'yes') {
          totalScore += q.points;
        }
      }
    });

    const percentageScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passed = percentageScore >= passingPercentage;

    return { totalScore, maxScore, percentageScore, passed };
  };

  const handleSubmit = () => {
    const requiredUnanswered = questions
      .filter(q => q.required !== false)
      .filter(q => !answers[q.id]);

    if (requiredUnanswered.length > 0) {
      toast({
        title: "Incomplete Assessment",
        description: "Please answer all required questions before submitting.",
        variant: "destructive",
      });
      return;
    }

    const scoreResult = calculateScore();
    const trainingQuestion = questions.find(q => q.type === "training");
    const feedbackQuestion = questions.find(q => q.type === "text");

    submitMutation.mutate({
      staffName: staffInfo.name,
      jobTitle: staffInfo.jobTitle,
      answers,
      totalScore: scoreResult.totalScore,
      maxScore: scoreResult.maxScore,
      percentageScore: scoreResult.percentageScore,
      passed: scoreResult.passed,
      needsFurtherTraining: trainingQuestion ? answers[trainingQuestion.id] : null,
      feedback: feedbackQuestion ? answers[feedbackQuestion.id] : null,
    });
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (currentStep === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-pink-100 dark:bg-pink-900">
                  <Brain className="h-12 w-12 text-pink-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">{data.title}</CardTitle>
              <CardDescription className="text-base mt-2">
                {data.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Assessment Information</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Branch: <strong>{data.branch}</strong></li>
                  <li>• Total Questions: <strong>{questions.length}</strong></li>
                  <li>• Passing Score: <strong>{passingPercentage}%</strong></li>
                  <li>• Answer all questions honestly - this is for learning and development</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="staffName">Your Full Name *</Label>
                  <Input
                    id="staffName"
                    placeholder="Enter your full name"
                    value={staffInfo.name}
                    onChange={(e) => setStaffInfo(prev => ({ ...prev, name: e.target.value }))}
                    data-testid="input-staff-name"
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Your Job Title *</Label>
                  <Input
                    id="jobTitle"
                    placeholder="Enter your job title"
                    value={staffInfo.jobTitle}
                    onChange={(e) => setStaffInfo(prev => ({ ...prev, jobTitle: e.target.value }))}
                    data-testid="input-job-title"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={handleStartAssessment}
                data-testid="button-start-assessment"
              >
                Start Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (currentStep === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className={result?.passed ? "border-green-200" : "border-orange-200"}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`p-4 rounded-full ${result?.passed ? 'bg-green-100 dark:bg-green-900' : 'bg-orange-100 dark:bg-orange-900'}`}>
                  {result?.passed ? (
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  ) : (
                    <AlertCircle className="h-12 w-12 text-orange-600" />
                  )}
                </div>
              </div>
              <CardTitle className="text-2xl">
                {result?.passed ? "Assessment Completed Successfully!" : "Assessment Completed"}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Thank you, {staffInfo.name}, for completing this assessment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={`p-6 rounded-lg text-center ${result?.passed ? 'bg-green-50 dark:bg-green-950' : 'bg-orange-50 dark:bg-orange-950'}`}>
                <div className="text-5xl font-bold mb-2">{result?.percentageScore}%</div>
                <div className="text-lg text-muted-foreground">
                  Score: {result?.totalScore} / {result?.maxScore}
                </div>
                <Badge
                  variant={result?.passed ? "default" : "secondary"}
                  className={`mt-3 ${result?.passed ? 'bg-green-600' : 'bg-orange-600'}`}
                >
                  {result?.passed ? "PASSED" : "NEEDS FURTHER REVIEW"}
                </Badge>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What Happens Next?</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Your assessment has been submitted to your manager. They will review your responses
                  and may schedule further training or discussion if needed. Thank you for taking the
                  time to complete this knowledge assessment.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.close()}
                data-testid="button-close-assessment"
              >
                Close Window
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline">{data.title}</Badge>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <Progress value={progress} className="mb-4" />
            <CardTitle className="text-lg">{currentQuestion.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.type === "scored" && currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
              >
                {currentQuestion.options.map((option, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem
                      value={option}
                      id={`option-${idx}`}
                      data-testid={`radio-option-${idx}`}
                    />
                    <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === "agreement" && currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
              >
                {currentQuestion.options.map((option, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem
                      value={option}
                      id={`option-${idx}`}
                      data-testid={`radio-option-${idx}`}
                    />
                    <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === "training" && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
              >
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="yes" id="training-yes" data-testid="radio-training-yes" />
                  <Label htmlFor="training-yes" className="flex-1 cursor-pointer">
                    Yes, I would like further training in this area
                  </Label>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="no" id="training-no" data-testid="radio-training-no" />
                  <Label htmlFor="training-no" className="flex-1 cursor-pointer">
                    No, I feel confident in this area
                  </Label>
                </div>
              </RadioGroup>
            )}

            {currentQuestion.type === "text" && (
              <Textarea
                placeholder="Enter your response here..."
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                rows={4}
                data-testid="textarea-response"
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              data-testid="button-previous"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
                data-testid="button-next"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                data-testid="button-submit-assessment"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Assessment"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
