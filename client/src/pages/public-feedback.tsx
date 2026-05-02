import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Star, Heart, Shield, Users, ThumbsUp, CheckCircle, AlertCircle, MessageCircle } from "lucide-react";

interface FeedbackCampaign {
  id: string;
  name: string;
  description?: string;
  category: "C" | "S" | "P" | "F";
  customQuestions?: Array<{
    id: string;
    question: string;
    type: "rating" | "text" | "choice";
    required: boolean;
    options?: string[];
  }>;
}

const categoryConfig = {
  C: { 
    label: "Caring", 
    icon: Heart, 
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    description: "How caring is the service you receive?"
  },
  S: { 
    label: "Safe", 
    icon: Shield, 
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    description: "How safe do you feel with our services?"
  },
  P: { 
    label: "People", 
    icon: Users, 
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    description: "How well do our staff support you?"
  },
  F: { 
    label: "Friends & Family", 
    icon: ThumbsUp, 
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    description: "Would you recommend us to friends and family?"
  },
};

export default function PublicFeedback() {
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const [formData, setFormData] = useState({
    overallRating: 0,
    npsScore: 5,
    wouldRecommend: undefined as boolean | undefined,
    positiveComments: "",
    improvementComments: "",
    additionalComments: "",
    respondentName: "",
    respondentEmail: "",
    respondentRelationship: "",
    consentToContact: false,
    consentToPublish: false,
    customResponses: {} as Record<string, any>,
  });

  const { data: campaign, isLoading, error } = useQuery<FeedbackCampaign>({
    queryKey: ["/api/feedback", token],
    enabled: !!token,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", `/api/feedback/${token}`, data);
    },
    onSuccess: () => {
      setStep(totalSteps + 1);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Error",
        description: error.message || "There was a problem submitting your feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading feedback form...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-center">Form Not Available</CardTitle>
            <CardDescription className="text-center">
              {error?.message || "This feedback form is not currently available. It may have closed or the link may be invalid."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const config = categoryConfig[campaign.category];
  const Icon = config.icon;

  const handleSubmit = () => {
    submitMutation.mutate(formData);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.overallRating > 0;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  if (step > totalSteps) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription className="text-lg">
              Your feedback has been submitted successfully. We really appreciate you taking the time to share your thoughts with us.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>Your feedback helps us improve the quality of care we provide.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className={`${config.bgColor} rounded-lg p-6 mb-6`}>
          <div className="flex items-center gap-3 mb-2">
            <Icon className={`h-8 w-8 ${config.color}`} />
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
          </div>
          {campaign.description && (
            <p className="text-gray-600">{campaign.description}</p>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <Progress value={(step / totalSteps) * 100} className="h-2" />
        </div>

        <Card>
          <CardContent className="pt-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">How would you rate your overall experience?</h2>
                  <p className="text-muted-foreground">{config.description}</p>
                </div>
                
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, overallRating: rating })}
                      className={`p-3 rounded-full transition-all ${
                        formData.overallRating >= rating
                          ? "bg-amber-400 text-white scale-110"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                      data-testid={`rating-star-${rating}`}
                    >
                      <Star className="h-8 w-8" fill={formData.overallRating >= rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  {formData.overallRating === 1 && "Very Poor"}
                  {formData.overallRating === 2 && "Poor"}
                  {formData.overallRating === 3 && "Average"}
                  {formData.overallRating === 4 && "Good"}
                  {formData.overallRating === 5 && "Excellent"}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold mb-2">Would you recommend us?</h2>
                  <p className="text-muted-foreground">On a scale of 0-10, how likely are you to recommend our services?</p>
                </div>

                <div className="flex justify-center gap-1 flex-wrap">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setFormData({ ...formData, npsScore: score })}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        formData.npsScore === score
                          ? score <= 6
                            ? "bg-red-500 text-white"
                            : score <= 8
                            ? "bg-amber-500 text-white"
                            : "bg-green-500 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                      data-testid={`nps-score-${score}`}
                    >
                      {score}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between text-xs text-muted-foreground px-2">
                  <span>Not at all likely</span>
                  <span>Extremely likely</span>
                </div>

                <div className="pt-4 border-t">
                  <Label className="text-base font-medium">Would you recommend us to friends and family?</Label>
                  <RadioGroup
                    value={formData.wouldRecommend === undefined ? "" : formData.wouldRecommend ? "yes" : "no"}
                    onValueChange={(v) => setFormData({ ...formData, wouldRecommend: v === "yes" })}
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="recommend-yes" data-testid="recommend-yes" />
                      <Label htmlFor="recommend-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="recommend-no" data-testid="recommend-no" />
                      <Label htmlFor="recommend-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <MessageCircle className="h-10 w-10 text-primary mx-auto mb-2" />
                  <h2 className="text-xl font-semibold">Tell us more</h2>
                  <p className="text-muted-foreground">Your comments help us understand what we're doing well and where we can improve.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="positive">What did we do well?</Label>
                    <Textarea
                      id="positive"
                      placeholder="Share what you appreciated about our service..."
                      value={formData.positiveComments}
                      onChange={(e) => setFormData({ ...formData, positiveComments: e.target.value })}
                      className="mt-1"
                      rows={3}
                      data-testid="input-positive-comments"
                    />
                  </div>

                  <div>
                    <Label htmlFor="improvement">How could we improve?</Label>
                    <Textarea
                      id="improvement"
                      placeholder="Suggest ways we could do better..."
                      value={formData.improvementComments}
                      onChange={(e) => setFormData({ ...formData, improvementComments: e.target.value })}
                      className="mt-1"
                      rows={3}
                      data-testid="input-improvement-comments"
                    />
                  </div>

                  <div>
                    <Label htmlFor="additional">Any other comments?</Label>
                    <Textarea
                      id="additional"
                      placeholder="Anything else you'd like to share..."
                      value={formData.additionalComments}
                      onChange={(e) => setFormData({ ...formData, additionalComments: e.target.value })}
                      className="mt-1"
                      rows={3}
                      data-testid="input-additional-comments"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold">Your Details (Optional)</h2>
                  <p className="text-muted-foreground">Let us know who you are if you'd like us to follow up with you.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={formData.respondentName}
                      onChange={(e) => setFormData({ ...formData, respondentName: e.target.value })}
                      className="mt-1"
                      data-testid="input-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.respondentEmail}
                      onChange={(e) => setFormData({ ...formData, respondentEmail: e.target.value })}
                      className="mt-1"
                      data-testid="input-email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="relationship">Your relationship to the service</Label>
                    <Input
                      id="relationship"
                      placeholder="e.g., Patient, Family Member, Staff"
                      value={formData.respondentRelationship}
                      onChange={(e) => setFormData({ ...formData, respondentRelationship: e.target.value })}
                      className="mt-1"
                      data-testid="input-relationship"
                    />
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="consent-contact"
                        checked={formData.consentToContact}
                        onCheckedChange={(checked) => setFormData({ ...formData, consentToContact: checked === true })}
                        data-testid="checkbox-consent-contact"
                      />
                      <Label htmlFor="consent-contact" className="text-sm leading-tight">
                        I consent to being contacted about my feedback
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="consent-publish"
                        checked={formData.consentToPublish}
                        onCheckedChange={(checked) => setFormData({ ...formData, consentToPublish: checked === true })}
                        data-testid="checkbox-consent-publish"
                      />
                      <Label htmlFor="consent-publish" className="text-sm leading-tight">
                        I consent to my feedback being published anonymously
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              data-testid="button-back"
            >
              Back
            </Button>
            
            {step < totalSteps ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                data-testid="button-next"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                data-testid="button-submit"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Feedback"}
              </Button>
            )}
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your feedback is confidential and will be used to improve our services.
        </p>
      </div>
    </div>
  );
}
