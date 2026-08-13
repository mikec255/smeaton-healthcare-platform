import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle2, Loader2 } from "lucide-react";

const EXPERIENCE_SETTINGS = [
  "Short Visits",
  "Care Home",
  "Hospital",
  "Private",
  "Family",
  "Community",
] as const;

const schema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Required"),
  date_of_birth: z.string().min(1, "Required"),
  area: z.string().min(1, "Required"),
  experience_settings: z.array(z.string()).optional(),
  other_experience: z.string().optional(),
  time_in_care: z.string().optional(),
  driver: z.enum(["Yes", "No"], { required_error: "Required" }),
  vehicle_access: z.enum(["Yes", "No"], { required_error: "Required" }),
  british_licence: z.enum(["Yes", "No"], { required_error: "Required" }),
  upcoming_holiday: z.enum(["Yes", "No"], { required_error: "Required" }),
  holiday_details: z.string().optional(),
  questions: z.string().optional(),
  privacy_consent: z.boolean().refine((v) => v === true, "You must agree to the privacy notice"),
});

type FormValues = z.infer<typeof schema>;

interface QuickApplyFormProps {
  jobId: string;
  jobTitle: string;
}

const PINK = "#EF2A86";

function YesNoField({
  control,
  name,
  label,
}: {
  control: any;
  name: any;
  label: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value ?? ""}
              className="flex gap-6 mt-1"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Yes" id={`${name}-yes`} />
                <label htmlFor={`${name}-yes`} className="text-sm cursor-pointer">Yes</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="No" id={`${name}-no`} />
                <label htmlFor={`${name}-no`} className="text-sm cursor-pointer">No</label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default function QuickApplyForm({ jobId, jobTitle }: QuickApplyFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [serverError, setServerError] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      area: "",
      experience_settings: [],
      other_experience: "",
      time_in_care: "",
      driver: undefined,
      vehicle_access: undefined,
      british_licence: undefined,
      upcoming_holiday: undefined,
      holiday_details: "",
      questions: "",
      privacy_consent: false,
    },
  });

  const upcomingHoliday = form.watch("upcoming_holiday");
  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: FormValues) {
    setServerError("");
    setAlreadyApplied(false);
    try {
      const res = await fetch("/api/quick-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, ...values }),
      });
      if (res.status === 409) {
        setAlreadyApplied(true);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setServerError(body.message || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setServerError("Could not connect. Please check your internet and try again.");
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <CheckCircle2 className="h-14 w-14" style={{ color: PINK }} />
        <h3 className="text-xl font-bold">Application received!</h3>
        <p className="text-gray-500 max-w-sm">
          Thanks {form.getValues("first_name")} — we'll review your application and be in touch
          within 24 hours.
        </p>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <CheckCircle2 className="h-14 w-14 text-green-500" />
        <h3 className="text-xl font-bold">You've already applied!</h3>
        <p className="text-gray-500 max-w-sm">
          We already have your application on file. We'll be in touch soon — no need to apply again.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* Personal details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base border-b pb-2">Your details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="first_name" render={({ field }) => (
              <FormItem>
                <FormLabel>First name *</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="last_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Last name *</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone *</FormLabel>
                <FormControl><Input type="tel" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="date_of_birth" render={({ field }) => (
              <FormItem>
                <FormLabel>Date of birth *</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="area" render={({ field }) => (
              <FormItem>
                <FormLabel>What area do you live in? *</FormLabel>
                <FormControl><Input placeholder="e.g. Plymouth" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        {/* Experience */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base border-b pb-2">Experience</h3>
          <FormField
            control={form.control}
            name="experience_settings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Which settings have you worked in? <span className="text-gray-400 font-normal">(tick all that apply)</span></FormLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                  {EXPERIENCE_SETTINGS.map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <Checkbox
                        id={`exp-${s}`}
                        checked={field.value?.includes(s) ?? false}
                        onCheckedChange={(checked) => {
                          const current = field.value ?? [];
                          field.onChange(
                            checked ? [...current, s] : current.filter((v) => v !== s)
                          );
                        }}
                      />
                      <label htmlFor={`exp-${s}`} className="text-sm cursor-pointer">{s}</label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="other_experience" render={({ field }) => (
            <FormItem>
              <FormLabel>Any other relevant experience?</FormLabel>
              <FormControl><Textarea rows={3} placeholder="Tell us about any other relevant experience…" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="time_in_care" render={({ field }) => (
            <FormItem>
              <FormLabel>How long have you worked in care?</FormLabel>
              <FormControl><Input placeholder="e.g. 3 years, 6 months" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Transport */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base border-b pb-2">Transport</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <YesNoField control={form.control} name="driver" label="Are you a driver?" />
            <YesNoField control={form.control} name="vehicle_access" label="Do you have access to a vehicle?" />
            <YesNoField control={form.control} name="british_licence" label="Do you hold a British driving licence?" />
          </div>
        </div>

        {/* Holiday */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base border-b pb-2">Availability</h3>
          <YesNoField control={form.control} name="upcoming_holiday" label="Do you have any holidays coming up?" />
          {upcomingHoliday === "Yes" && (
            <FormField control={form.control} name="holiday_details" render={({ field }) => (
              <FormItem>
                <FormLabel>Please give dates / details</FormLabel>
                <FormControl><Textarea rows={2} placeholder="e.g. 2–9 September 2026" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          )}
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <FormField control={form.control} name="questions" render={({ field }) => (
            <FormItem>
              <FormLabel>Any questions for us?</FormLabel>
              <FormControl><Textarea rows={3} placeholder="Anything you'd like to know before we speak?" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Privacy notice */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 space-y-3 text-sm text-gray-600 leading-relaxed">
          <p className="font-semibold text-gray-800 text-base">Privacy Notice — Job Applications</p>
          <p>
            When you apply for a role with Smeaton Healthcare, the details you give us on this form
            are stored securely in CareLogr, our care management and recruitment system.
          </p>
          <p>
            <span className="font-medium text-gray-700">What we collect when you apply:</span>{" "}
            your name and contact details, date of birth, the area you live in, the role you're
            applying for, your care experience and time in care, driving/vehicle details,
            right-to-work licence information, any upcoming holidays, and any questions you ask us.
          </p>
          <p>
            <span className="font-medium text-gray-700">What we hold during recruitment:</span>{" "}
            if your application progresses, we will also record interview notes and scores,
            references, right-to-work and identity documents, DBS check details, and qualification
            or training certificates. This information is used only to assess your suitability for
            the role and to meet our legal obligations as a regulated care provider.
          </p>
          <p>
            <span className="font-medium text-gray-700">How long we keep it:</span>{" "}
            if you join us, your application becomes part of your staff record. If your application
            is unsuccessful, we keep your details for 6 months from the date we tell you the
            outcome, then securely delete them.
          </p>
          <p>
            We process this information under UK GDPR on the basis of taking steps to enter into an
            employment contract, and our legal obligations under health and social care regulations.
            You can ask to see, correct, or delete your information at any time.
          </p>
          <FormField
            control={form.control}
            name="privacy_consent"
            render={({ field }) => (
              <FormItem className="pt-1">
                <div className="flex items-start gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <FormLabel className="font-medium text-gray-800 leading-snug cursor-pointer">
                    I have read and agree to the Privacy Notice above. *
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {serverError && (
          <p className="text-sm text-red-600 font-medium">{serverError}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          style={{ backgroundColor: PINK }}
          className="w-full text-white hover:opacity-90 h-12 text-base font-semibold"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</>
          ) : (
            "Submit Application"
          )}
        </Button>
      </form>
    </Form>
  );
}
