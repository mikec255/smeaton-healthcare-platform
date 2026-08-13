import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, PoundSterling, Building, Check, Phone, Mail, ArrowLeft, Loader2 } from "lucide-react";
import SocialShareBar from "@/components/shared/SocialShareBar";
import { type Job } from "@shared/schema";
import { useState } from "react";
import SimpleJobApplicationModal from "@/components/jobs/job-application-modal-simple";

const SITE = "https://smeatonhealthcare.co.uk";
const PINK = "#EF2A86";

function formatSalary(job: Job) {
  const min = job.salaryMin;
  const max = job.salaryMax ?? null;
  if (job.salaryType === "hourly") {
    return max ? `£${min.toFixed(2)}–£${max.toFixed(2)} per hour` : `£${min.toFixed(2)} per hour`;
  } else if (job.salaryType === "weekly") {
    return max ? `£${min.toFixed(0)}–£${max.toFixed(0)} per week` : `£${min.toFixed(0)} per week`;
  } else {
    return max ? `£${min.toLocaleString()}–£${max.toLocaleString()} per year` : `£${min.toLocaleString()} per year`;
  }
}

function formatType(type: string) {
  switch (type) {
    case "care-at-home": return "Care at Home";
    case "permanent": return "Permanent";
    case "temporary": return "Temporary";
    default: return type;
  }
}

const BENEFITS = [
  "Competitive salary",
  "Comprehensive training",
  "Career development",
  "Supportive team environment",
  "Flexible working arrangements",
];

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showApplication, setShowApplication] = useState(false);

  const { data: job, isLoading, isError } = useQuery<Job>({
    queryKey: [`/api/jobs/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) throw new Error("Job not found");
      return res.json();
    },
    enabled: !!id,
  });

  const pageUrl = `${SITE}/jobs/${id}`;
  const ogImage = `https://carelogr.replit.app/public/job-image/${id}.png`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-5">
        <p className="text-gray-500">This job listing couldn't be found.</p>
        <Link href="/jobs">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* OG / Twitter meta */}
      <Helmet>
        <title>{job.title} | Smeaton Healthcare</title>
        <meta name="description" content={job.summary} />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Smeaton Healthcare" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={job.title} />
        <meta property="og:description" content={job.summary} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={job.title} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={job.title} />
        <meta name="twitter:description" content={job.summary} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      {/* Hero */}
      <div style={{ backgroundColor: PINK }} className="text-white py-12 px-5">
        <div className="max-w-5xl mx-auto">
          <Link href="/jobs">
            <button className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft size={14} /> Back to Jobs
            </button>
          </Link>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className="bg-white/20 text-white border-transparent text-xs">
              {formatType(job.type)}
            </Badge>
            {job.department && (
              <Badge className="bg-white/20 text-white border-transparent text-xs">
                {job.department}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{job.title}</h1>
          <div className="flex flex-wrap gap-5 text-white/80 text-sm">
            <span className="flex items-center gap-1.5"><MapPin size={14} />{job.location}</span>
            <span className="flex items-center gap-1.5"><PoundSterling size={14} />{formatSalary(job)}</span>
            {job.department && (
              <span className="flex items-center gap-1.5"><Building size={14} />{job.department}</span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-5 py-10">
        <div className="grid md:grid-cols-3 gap-10">

          {/* Main content */}
          <div className="md:col-span-2 prose max-w-none">
            <h2 className="text-xl font-bold mb-3">Job Summary</h2>
            <p className="text-gray-700 mb-6">{job.summary}</p>

            {job.description && (
              <>
                <h3 className="text-lg font-semibold mb-2">Full Description</h3>
                <div className="whitespace-pre-line text-gray-700 mb-6">{job.description}</div>
              </>
            )}

            {job.requirements && (
              <>
                <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                <div className="whitespace-pre-line text-gray-700 mb-6">{job.requirements}</div>
              </>
            )}

            {job.benefits && (
              <>
                <h3 className="text-lg font-semibold mb-2">Benefits</h3>
                <div className="whitespace-pre-line text-gray-700 mb-6">{job.benefits}</div>
              </>
            )}

            <SocialShareBar title={`${job.title} – Smeaton Healthcare`} url={pageUrl} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gray-50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Quick Apply</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Interested? Apply now and we'll get back to you within 24 hours.
                </p>
                <Button
                  onClick={() => setShowApplication(true)}
                  style={{ backgroundColor: PINK }}
                  className="w-full text-white hover:opacity-90"
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Benefits</h3>
                <ul className="space-y-2 text-sm text-gray-500">
                  {BENEFITS.map((b) => (
                    <li key={b} className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Contact Us</h3>
                <div className="space-y-2 text-sm text-gray-500">
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> 0330 165 8880</p>
                  <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@smeatonhealthcare.co.uk</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Devon &amp; Cornwall</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showApplication && (
        <SimpleJobApplicationModal
          job={job}
          isOpen={showApplication}
          onClose={() => setShowApplication(false)}
        />
      )}
    </div>
  );
}
