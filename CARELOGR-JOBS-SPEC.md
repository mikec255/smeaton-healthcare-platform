# CareLogr → Smeaton Healthcare: Jobs Integration Spec

This document tells the CareLogr Replit exactly how to build the jobs editor
so that listings appear and work correctly on the Smeaton Healthcare website.

---

## How it works

CareLogr creates and manages job listings via the Smeaton API. The Smeaton
website fetches them and displays them on the public careers page with filters.
Candidates apply directly on the Smeaton site. Applications land back in
CareLogr for review.

---

## API connection

```
Base URL:   https://www.smeatonhealthcare.co.uk/api/carelogr
Auth:       Header — X-Api-Key: <CARELOGR_API_KEY>
```

---

## Job listing fields

When creating or updating a job (`POST /jobs` or `PATCH /jobs/:id`), send a
JSON body with these fields:

| Field             | Type    | Required | Notes |
|-------------------|---------|----------|-------|
| `title`           | string  | YES      | Job title shown on the website |
| `type`            | string  | YES      | See allowed values below |
| `location`        | string  | YES      | e.g. `Plymouth`, `Truro`, `Devon`, `Cornwall` |
| `branch`          | string  | YES      | `Plymouth` or `Truro` |
| `department`      | string  | no       | e.g. `Care`, `Management`, `Administration` |
| `salaryType`      | string  | YES      | `hourly`, `weekly`, or `annual` |
| `salaryMin`       | integer | YES      | Minimum salary/rate (e.g. `12` for £12/hr) |
| `salaryMax`       | integer | no       | Maximum salary/rate — leave blank if fixed rate |
| `summary`         | string  | YES      | One or two sentence overview shown in the listing card |
| `description`     | string  | YES      | Full job description shown in the details popup |
| `requirements`    | string  | no       | What the candidate needs — qualifications, experience, skills |
| `benefits`        | string  | no       | What Smeaton offers — pension, mileage, training, etc. |
| `reportsTo`       | string  | no       | e.g. `Registered Manager` |
| `experienceLevel` | string  | no       | See allowed values below |
| `isActive`        | boolean | no       | Default `true`. Set `false` to hide from the site. |

---

## Allowed values

### `type`
| Value          | Shown as on site      |
|----------------|-----------------------|
| `permanent`    | Permanent             |
| `care-at-home` | Care at Home          |
| `temporary`    | Temporary             |

### `salaryType`
| Value    | Shown as     |
|----------|--------------|
| `hourly` | per hour     |
| `weekly` | per week     |
| `annual` | per year     |

### `experienceLevel`
| Value         | Shown as        |
|---------------|-----------------|
| `entry`       | Entry level     |
| `1-2-years`   | 1-2 years       |
| `3-5-years`   | 3-5 years       |
| `5-plus-years`| 5+ years        |

### `branch`
- `Plymouth`
- `Truro`

---

## Description and requirements formatting

`description`, `requirements`, and `benefits` are plain text fields.
Use line breaks to separate sections. The site wraps these in a styled
container so they display cleanly.

If you want to include bullet points, use plain hyphens:

```
- Full UK driving licence required
- Enhanced DBS check (we can support with this)
- Compassionate and patient nature
```

---

## Workflow: creating a job listing

```
1. POST  /jobs           → creates the listing (live immediately if isActive: true)
2. PATCH /jobs/:id       → update any field
3. PATCH /jobs/:id       → set { "isActive": false } to hide it from the site
4. DELETE /jobs/:id      → permanently remove it
```

To take a listing offline without deleting it:
```json
PATCH /jobs/:id   { "isActive": false }
```

---

## Viewing applications

When a candidate applies on the Smeaton website, an application is created
automatically. CareLogr can read and manage these:

```
GET    /applications                          → list all applications
GET    /applications?jobId=<id>              → filter by job
GET    /applications?status=pending           → filter by status
GET    /applications/:id                      → single application
PATCH  /applications/:id                      → update status or add notes
```

### Application statuses

| Value        | Meaning                        |
|--------------|--------------------------------|
| `pending`    | Just submitted, not reviewed   |
| `reviewed`   | Admin has looked at it         |
| `interview`  | Invited for interview          |
| `hired`      | Successful                     |
| `rejected`   | Unsuccessful                   |

### Updating an application

```json
PATCH /applications/:id
{
  "status": "interview",
  "notes": "Good phone manner, invited for interview 20 Jan"
}
```

---

## What the old Smeaton admin jobs editor had (for reference)

Build something similar on CareLogr:

### Job list view
- Table of all listings with title, location, branch, type, salary, status
- Active / Inactive badge
- Edit, Activate/Deactivate, Delete buttons
- Filter by status (active/inactive) and branch (Plymouth/Truro)
- Search by title, location or department

### Create / edit job form
- Title
- Job type (dropdown: Permanent, Care at Home, Temporary)
- Location (free text)
- Branch (dropdown: Plymouth, Truro)
- Department (free text)
- Salary type (dropdown: hourly, weekly, annual)
- Salary min + max (number fields)
- Experience level (dropdown)
- Reports to (free text)
- Summary (short text — 1-2 sentences)
- Description (large text area — full job details)
- Requirements (text area — what they need)
- Benefits (text area — what Smeaton offers)
- Active toggle (show/hide from site)

### Applications list view (per job)
- Table of applicants: name, email, phone, location, applied date
- Status badge (pending / reviewed / interview / hired / rejected)
- Status update dropdown
- Notes field per applicant
- View full application details

---

## Example: create a job listing

```js
const job = await fetch('https://www.smeatonhealthcare.co.uk/api/carelogr/jobs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': CARELOGR_API_KEY
  },
  body: JSON.stringify({
    title: 'Care Assistant',
    type: 'permanent',
    location: 'Plymouth',
    branch: 'Plymouth',
    department: 'Care',
    salaryType: 'hourly',
    salaryMin: 12,
    salaryMax: 13,
    experienceLevel: 'entry',
    reportsTo: 'Registered Manager',
    summary: 'Join our Plymouth team providing compassionate home care to adults across the local area.',
    description: 'We are looking for caring and dedicated individuals to join our growing team...',
    requirements: '- Full UK driving licence\n- Compassionate nature\n- DBS check (we can support)',
    benefits: '- Competitive hourly rate\n- Mileage paid\n- Full training provided\n- Pension scheme',
    isActive: true
  })
});
const { data } = await job.json();
console.log('Job created:', data.id);
```

---

## Example: mark an applicant as hired

```js
await fetch(`https://www.smeatonhealthcare.co.uk/api/carelogr/applications/${applicationId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': CARELOGR_API_KEY
  },
  body: JSON.stringify({
    status: 'hired',
    notes: 'Start date agreed: 1 February 2026'
  })
});
```
