import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, AlertTriangle, Brain, Building2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface KnowledgeQuestion {
  id: string;
  questionText: string;
  questionType: "multiple_choice" | "true_false" | "short_answer";
  answerChoices?: string[];
  correctAnswer?: string;
  points: number;
}

interface AssessmentData {
  questionnaire: {
    id: string;
    title: string;
    description: string;
    instructions: string;
    timeLimit: number | null;
    category: string;
    subcategory: string | null;
  };
  questions: KnowledgeQuestion[];
}

const startSessionSchema = z.object({
  staffName: z.string().min(1, "Name is required"),
  staffEmail: z.string().email("Valid email is required"),
  questionnaireId: z.string(),
});

type StartSessionData = z.infer<typeof startSessionSchema>;

export default function Assessment() {
  const [, params] = useRoute("/assessment/:shareableLink");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  const shareableLink = params?.shareableLink;

  // Fetch assessment data
  const { data: assessmentData, isLoading, error } = useQuery<AssessmentData>({
    queryKey: [`/api/public/knowledge/assessment/${shareableLink}`],
    enabled: !!shareableLink,
  });

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: async (data: StartSessionData) => {
      const response = await apiRequest("POST", "/api/public/knowledge/start-session", data);
      return response as { sessionId: string };
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setSessionStarted(true);
      if (assessmentData?.questionnaire.timeLimit) {
        setTimeRemaining(assessmentData.questionnaire.timeLimit * 60); // Convert minutes to seconds
      }
      toast({
        title: "Assessment Started",
        description: "Good luck with your Smeaton Healthcare assessment!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit session mutation
  const submitSessionMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error("No session ID");
      
      const responses = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        selectedAnswer: answer,
      }));

      await apiRequest("POST", `/api/public/knowledge/sessions/${sessionId}/complete`, {
        responses,
      });
    },
    onSuccess: () => {
      setIsCompleted(true);
      toast({
        title: "Assessment Completed",
        description: "Thank you for completing your Smeaton Healthcare assessment!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Timer effect
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && sessionStarted && !isCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, sessionStarted, isCompleted]);

  const handleStartSession = () => {
    if (!assessmentData) return;
    
    const data: StartSessionData = {
      staffName,
      staffEmail,
      questionnaireId: assessmentData.questionnaire.id,
    };

    startSessionMutation.mutate(data);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (!assessmentData) return;
    if (currentQuestionIndex < assessmentData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    submitSessionMutation.mutate();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p>Loading Smeaton Healthcare Assessment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !assessmentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Assessment Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This Smeaton Healthcare assessment link is invalid or has expired.
            </p>
            <p className="text-sm text-muted-foreground">
              Please contact your supervisor for a new assessment link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Assessment Completed!</h2>
            <p className="text-muted-foreground mb-4">
              Thank you for completing your Smeaton Healthcare knowledge assessment.
            </p>
            <p className="text-sm text-muted-foreground">
              Your responses have been submitted and will be reviewed by your supervisor.
            </p>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Smeaton Healthcare
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                Professional Development & Training
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Smeaton Healthcare Knowledge Assessment
            </CardTitle>
            <CardDescription className="text-lg">
              {assessmentData.questionnaire.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Assessment Information</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {assessmentData.questionnaire.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Questions:</span> {assessmentData.questions.length}
                </div>
                <div>
                  <span className="font-medium">Time Limit:</span>{" "}
                  {assessmentData.questionnaire.timeLimit ? `${assessmentData.questionnaire.timeLimit} minutes` : "No limit"}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {assessmentData.questionnaire.category}
                </div>
              </div>
            </div>

            {assessmentData.questionnaire.instructions && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Instructions</h3>
                <p className="text-sm whitespace-pre-wrap">
                  {assessmentData.questionnaire.instructions}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Enter your full name"
                  data-testid="input-staff-name"
                />
              </div>
              <div>
                <Label htmlFor="email">Your Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="Enter your email address"
                  data-testid="input-staff-email"
                />
              </div>
            </div>

            <Button
              onClick={handleStartSession}
              disabled={!staffName.trim() || !staffEmail.trim() || startSessionMutation.isPending}
              className="w-full"
              data-testid="button-start-assessment"
            >
              {startSessionMutation.isPending ? "Starting Assessment..." : "Start Assessment"}
            </Button>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>Powered by Smeaton Healthcare Training System</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safety check: ensure we have valid data before proceeding
  if (!assessmentData?.questions || assessmentData.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Questions Available</h2>
            <p className="text-muted-foreground">
              This assessment has no questions configured.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = assessmentData.questions[currentQuestionIndex];
  
  // Additional safety check for current question
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Question Not Found</h2>
            <p className="text-muted-foreground">
              Unable to load the current question. Please refresh and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / assessmentData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="font-semibold text-lg">Smeaton Healthcare Assessment</h1>
                <p className="text-sm text-muted-foreground">{assessmentData.questionnaire.title}</p>
              </div>
            </div>
            {timeRemaining !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className={timeRemaining < 300 ? "text-red-600" : "text-muted-foreground"}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Question {currentQuestionIndex + 1} of {assessmentData.questions.length}
          </p>
        </div>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Question {currentQuestionIndex + 1}
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {currentQuestion.questionText}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.questionType === "multiple_choice" && currentQuestion.answerChoices && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                {currentQuestion.answerChoices.map((choice, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={choice} id={`choice-${index}`} />
                    <Label htmlFor={`choice-${index}`} className="cursor-pointer">
                      {choice}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.questionType === "true_false" && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="True" id="true" />
                  <Label htmlFor="true" className="cursor-pointer">True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="False" id="false" />
                  <Label htmlFor="false" className="cursor-pointer">False</Label>
                </div>
              </RadioGroup>
            )}

            {currentQuestion.questionType === "short_answer" && (
              <Textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Enter your answer here..."
                rows={4}
                data-testid="textarea-short-answer"
              />
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                data-testid="button-previous"
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestionIndex < assessmentData.questions.length - 1 ? (
                  <Button onClick={handleNext} data-testid="button-next">
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitSessionMutation.isPending}
                    data-testid="button-submit-assessment"
                  >
                    {submitSessionMutation.isPending ? "Submitting..." : "Submit Assessment"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}