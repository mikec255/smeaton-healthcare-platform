import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle2, Loader2 } from "lucide-react";

const SHIFT_OPTIONS = ["Early", "Late", "Long Days", "Nights"] as const;

const HEARD_ABOUT_OPTIONS = [
  "Indeed",
  "Google",
  "Facebook / Instagram",
  "Friend or family referral",
  "Current / former employee",
  "Job board (other)",
  "Leaflet / local advertising",
  "Other",
];

const schema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Required"),
  location: z.string().min(1, "Required"),
  heard_about_us: z.string().min(1, "Required"),
  currently_working: z.enum(["Yes", "No"], { required_error: "Required" }),
  care_experience: z.string().optional(),
  upcoming_holiday: z.enum(["Yes", "No"], { required_error: "Required" }),
  driver: z.enum(["Yes", "No"], { required_error: "Required" }),
  shift_preferences: z.array(z.string()).optional(),
  hours_wanted: z.string().optional(),
  dbs_update_service: z.enum(["Yes", "No"], { required_error: "Required" }),
  mh_certificate: z.enum(["Yes", "No"], { required_error: "Required" }),
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
      location: "",
      heard_about_us: "",
      currently_working: undefined,
      care_experience: "",
      upcoming_holiday: undefined,
      driver: undefined,
      shift_preferences: [],
      hours_wanted: "",
      dbs_update_service: undefined,
      mh_certificate: undefined,
      privacy_consent: false,
    },
  });

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
          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem>
              <FormLabel>Where do you live? *</FormLabel>
              <FormControl><Input placeholder="e.g. Plymouth" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="heard_about_us" render={({ field }) => (
            <FormItem>
              <FormLabel>How did you hear about us? *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {HEARD_ABOUT_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Employment & experience */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base border-b pb-2">Experience</h3>
          <YesNoField control={form.control} name="currently_working" label="Are you currently working? *" />
          <FormField control={form.control} name="care_experience" render={({ field }) => (
            <FormItem>
              <FormLabel>Tell us about your care experience</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="e.g. 3 years in homecare, short visits and live-in…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Shift preferences */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base border-b pb-2">Availability</h3>
          <FormField
            control={form.control}
            name="shift_preferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Which shifts can you work? <span className="text-gray-400 font-normal">(tick all that apply)</span></FormLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  {SHIFT_OPTIONS.map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <Checkbox
                        id={`shift-${s}`}
                        checked={field.value?.includes(s) ?? false}
                        onCheckedChange={(checked) => {
                          const current = field.value ?? [];
                          field.onChange(
                            checked ? [...current, s] : current.filter((v) => v !== s)
                          );
                        }}
                      />
                      <label htmlFor={`shift-${s}`} className="text-sm cursor-pointer">{s}</label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="hours_wanted" render={({ field }) => (
            <FormItem>
              <FormLabel>How many hours per week are you looking for?</FormLabel>
              <FormControl><Input placeholder="e.g. 30 hours, full time" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <YesNoField control={form.control} name="upcoming_holiday" label="Do you have any holidays booked? *" />
        </div>

        {/* Transport & compliance */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base border-b pb-2">Transport &amp; compliance</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <YesNoField control={form.control} name="driver" label="Are you a driver? *" />
            <YesNoField control={form.control} name="dbs_update_service" label="Are you on the DBS Update Service? *" />
            <YesNoField control={form.control} name="mh_certificate" label="Do you hold a Moving &amp; Handling certificate? *" />
          </div>
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
            your name and contact details, the area you live in, the role you're applying for,
            your care experience, driving details, shift preferences, DBS and certificate status,
            and any upcoming holidays.
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
