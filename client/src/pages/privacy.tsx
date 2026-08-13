import Seo from "@/components/seo";

const sections = [
  {
    number: "01",
    title: "Who We Are",
    content: (
      <>
        <p>
          Smeaton Healthcare Limited is a provider of regulated domiciliary care services within the
          United Kingdom and is registered with the Care Quality Commission (CQC).
        </p>
        <p className="mt-3">We are the Data Controller for the personal information we collect.</p>
        <p className="mt-3">
          If you have any questions regarding this Privacy Notice or how we process your personal
          information, please contact us:
        </p>
        <div className="mt-3 not-prose">
          <p className="font-semibold">Email: <a href="mailto:hello@smeatonhealthcare.co.uk" className="text-pink-600 underline">hello@smeatonhealthcare.co.uk</a></p>
          <address className="mt-2 not-italic text-gray-700 leading-relaxed">
            Smeaton Healthcare Ltd<br />
            Brunswick House<br />
            1-3 Brunswick Road<br />
            Plymouth<br />
            PL4 0BG
          </address>
        </div>
      </>
    ),
  },
  {
    number: "02",
    title: "What Personal Information We Collect",
    content: (
      <>
        <h3 className="font-semibold text-gray-800 mt-4 mb-2">Identification Information</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {["Name","Date of birth","Address","Telephone number","Email address","Photograph","NHS Number (where applicable)","Emergency contacts","Next of kin"].map(i => <li key={i}>{i}</li>)}
        </ul>

        <h3 className="font-semibold text-gray-800 mt-5 mb-2">Health Information</h3>
        <p className="text-gray-700 mb-2">Where necessary to provide care we may collect:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {["Medical history","Care needs","Risk assessments","Medication records","Allergies","GP information","Clinical observations","Care plans","Safeguarding information","Incident reports"].map(i => <li key={i}>{i}</li>)}
        </ul>

        <h3 className="font-semibold text-gray-800 mt-5 mb-2">Employment Information</h3>
        <p className="text-gray-700 mb-2">For employees and applicants we may collect:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {["CVs","Employment history","References","Qualifications","Professional registrations","Right to work documentation","DBS information","Driving licence details","Vehicle insurance details","Training records","Payroll information","Bank details","Attendance records"].map(i => <li key={i}>{i}</li>)}
        </ul>

        <h3 className="font-semibold text-gray-800 mt-5 mb-2">Website Information</h3>
        <p className="text-gray-700 mb-2">When you visit our website we may collect:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {["IP address","Browser type","Device information","Cookies","Website usage information","Contact forms","Recruitment enquiries"].map(i => <li key={i}>{i}</li>)}
        </ul>
      </>
    ),
  },
  {
    number: "03",
    title: "How We Use Your Information",
    content: (
      <ul className="list-disc list-inside space-y-1 text-gray-700">
        {[
          "Deliver safe, effective and person-centred care",
          "Develop and review care plans",
          "Manage medication records",
          "Schedule care visits",
          "Recruit and employ staff",
          "Verify identity and right to work",
          "Carry out DBS checks",
          "Meet safeguarding responsibilities",
          "Comply with CQC regulations",
          "Meet legal obligations",
          "Respond to enquiries",
          "Process payroll",
          "Improve our services",
          "Manage complaints",
          "Protect customers and staff",
          "Prevent fraud",
          "Maintain business records",
        ].map(i => <li key={i}>{i}</li>)}
      </ul>
    ),
  },
  {
    number: "04",
    title: "Our Lawful Basis for Processing",
    content: (
      <>
        <p className="text-gray-700 mb-3">
          We process information under one or more of the following lawful bases under the UK GDPR:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {[
            "Performance of a Contract",
            "Compliance with a Legal Obligation",
            "Legitimate Interests",
            "Vital Interests",
            "Consent (where appropriate)",
            "Provision of Health and Social Care",
            "Employment Law obligations",
            "Safeguarding and Public Interest",
          ].map(i => <li key={i}>{i}</li>)}
        </ul>
        <p className="mt-4 text-gray-700">
          Where we process Special Category Data, including health information, we do so in
          accordance with Article 9 UK GDPR and the Data Protection Act 2018.
        </p>
      </>
    ),
  },
  {
    number: "05",
    title: "Who We Share Information With",
    content: (
      <>
        <p className="text-gray-700 mb-3">Where necessary, we may share information with:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {[
            "The NHS",
            "General Practitioners",
            "Local Authorities",
            "Pharmacies",
            "Hospitals",
            "Emergency Services",
            "Care Quality Commission (CQC)",
            "Disclosure and Barring Service",
            "Payroll providers",
            "Professional advisers",
            "Regulators",
            "Law enforcement agencies where legally required",
          ].map(i => <li key={i}>{i}</li>)}
        </ul>
        <p className="mt-4 text-gray-700">We only share information that is necessary and lawful.</p>
      </>
    ),
  },
  {
    number: "06",
    title: "International Transfers",
    content: (
      <>
        <p className="text-gray-700">
          We aim to store and process personal information within the United Kingdom.
        </p>
        <p className="mt-3 text-gray-700">
          Where information is processed outside the UK, we ensure appropriate safeguards are in
          place in accordance with UK GDPR.
        </p>
      </>
    ),
  },
  {
    number: "07",
    title: "Keeping Your Information Secure",
    content: (
      <>
        <p className="text-gray-700 mb-3">
          We use appropriate technical and organisational measures to protect personal information,
          including:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {[
            "Secure cloud infrastructure",
            "Encryption",
            "Access controls",
            "Password protection",
            "Multi-factor authentication where appropriate",
            "Staff confidentiality agreements",
            "Regular system monitoring",
            "Secure backups",
            "Cyber security measures",
          ].map(i => <li key={i}>{i}</li>)}
        </ul>
        <p className="mt-4 text-gray-700">
          Only authorised staff can access personal information necessary for their role.
        </p>
      </>
    ),
  },
  {
    number: "08",
    title: "How Long We Keep Information",
    content: (
      <p className="text-gray-700">
        We retain information only for as long as necessary to fulfil the purposes for which it was
        collected and to meet legal and regulatory requirements. Retention periods are determined in
        accordance with applicable legislation, NHS Records Management guidance and regulatory
        requirements.
      </p>
    ),
  },
  {
    number: "09",
    title: "Your Rights",
    content: (
      <>
        <p className="text-gray-700 mb-3">Under UK GDPR you have the right to:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {[
            "Access your personal information",
            "Request correction of inaccurate information",
            "Request erasure where appropriate",
            "Restrict processing",
            "Object to processing",
            "Request data portability where applicable",
            "Withdraw consent where processing relies on consent",
          ].map(i => <li key={i}>{i}</li>)}
        </ul>
        <p className="mt-4 text-gray-700">
          Requests should be submitted to our Data Protection contact at{" "}
          <a href="mailto:hello@smeatonhealthcare.co.uk" className="text-pink-600 underline">
            hello@smeatonhealthcare.co.uk
          </a>.
        </p>
      </>
    ),
  },
  {
    number: "10",
    title: "Cookies",
    content: (
      <p className="text-gray-700">
        Our website uses cookies to improve website functionality, security and user experience.
        Further information is available within our separate Cookie Policy.
      </p>
    ),
  },
  {
    number: "11",
    title: "Complaints",
    content: (
      <>
        <p className="text-gray-700">
          If you are unhappy with how we have handled your personal information, please contact us
          first so that we can try to resolve your concerns.
        </p>
        <p className="mt-3 text-gray-700">
          You also have the right to complain to the Information Commissioner's Office (ICO),
          Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF —{" "}
          <a href="https://www.ico.org.uk" target="_blank" rel="noreferrer" className="text-pink-600 underline">
            www.ico.org.uk
          </a>
        </p>
      </>
    ),
  },
  {
    number: "12",
    title: "Changes to This Privacy Notice",
    content: (
      <p className="text-gray-700">
        We may update this Privacy Notice from time to time to reflect changes in legislation,
        technology or the way we provide our services. The latest version will always be available
        on our website, and the revision date shown at the top of this document will indicate when
        it was last updated.
      </p>
    ),
  },
  {
    number: "SY",
    title: "The Systems We Use",
    content: (
      <>
        <p className="text-gray-700 mb-4">
          To deliver our services safely and efficiently, Smeaton Healthcare uses secure digital
          systems.
        </p>
        {[
          {
            name: "CareLogr",
            desc: "Our secure care management and recruitment platform, used to manage customer enquiries, recruitment, care plans, risk assessments, medication records, visit scheduling, incident reporting, staff training and compliance.",
          },
          {
            name: "Website Hosting (Microsoft Azure)",
            desc: "Our website is securely hosted using Microsoft Azure cloud infrastructure. Information submitted through our website is encrypted during transmission.",
          },
          {
            name: "Microsoft 365",
            desc: "Used to manage business email, documents, collaboration and internal communications.",
          },
          {
            name: "Payroll Systems",
            desc: "We use secure payroll software to process salaries, pensions, statutory payments and employment records.",
          },
          {
            name: "Artificial Intelligence (AI)",
            desc: "We may use AI within CareLogr to support administrative functions including quality assurance, audit support, compliance monitoring and reporting. Decisions that could significantly affect individuals are never made solely by AI and are always subject to human review.",
          },
        ].map(s => (
          <div key={s.name} className="mb-4">
            <p className="font-semibold text-gray-800">{s.name}</p>
            <p className="text-gray-700 mt-1">{s.desc}</p>
          </div>
        ))}
        <p className="text-gray-700 mt-2">
          All third-party providers are required to process personal information securely and in
          accordance with UK data protection legislation.
        </p>
      </>
    ),
  },
];

export default function PrivacyNotice() {
  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Privacy Notice | Smeaton Healthcare"
        description="How Smeaton Healthcare collects, uses and protects your personal information."
      />

      {/* Hero */}
      <div style={{ backgroundColor: "#EF2A86" }} className="text-white py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-white/60 mb-2">Legal</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Privacy Notice</h1>
          <p className="text-white/70 text-sm">Version 1.0 &nbsp;·&nbsp; Last updated: July 2026</p>
          <p className="mt-5 text-white/90 leading-relaxed max-w-2xl">
            Smeaton Healthcare is committed to protecting your privacy and handling your personal
            information fairly, lawfully and transparently. This Privacy Notice explains how we
            collect, use, store and protect your personal information.
          </p>
        </div>
      </div>

      {/* Who it applies to */}
      <div className="bg-gray-50 border-b border-gray-100 py-8 px-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
            This notice applies to
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Customers receiving care",
              "Family members & representatives",
              "Employees & agency workers",
              "Job applicants",
              "Website visitors",
              "Healthcare professionals",
              "Suppliers & contractors",
            ].map(group => (
              <span
                key={group}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-50 text-pink-700 border border-pink-100"
              >
                {group}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-3xl mx-auto px-5 py-12 space-y-12">
        {sections.map(section => (
          <section key={section.number} className="scroll-mt-8">
            <div className="flex items-start gap-5">
              <span
                className="flex-shrink-0 text-xs font-bold tracking-widest text-pink-400 pt-1 w-8"
                aria-hidden="true"
              >
                {section.number}
              </span>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
                <div className="text-base leading-relaxed">{section.content}</div>
              </div>
            </div>
            <div className="mt-10 border-t border-gray-100" />
          </section>
        ))}
      </div>

      {/* Contact footer */}
      <div style={{ backgroundColor: "#EF2A86" }} className="text-white py-10 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-semibold text-lg mb-1">Questions about this notice?</p>
          <p className="text-white/80 mb-4 text-sm">
            Contact our Data Protection team and we'll be happy to help.
          </p>
          <a
            href="mailto:hello@smeatonhealthcare.co.uk"
            className="inline-block bg-white text-pink-600 font-bold px-6 py-2.5 rounded-full text-sm hover:bg-white/90 transition-colors"
          >
            hello@smeatonhealthcare.co.uk
          </a>
        </div>
      </div>
    </div>
  );
}
