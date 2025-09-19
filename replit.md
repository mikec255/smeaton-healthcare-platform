# Overview

This is a full-stack healthcare staffing platform called "Smeaton Healthcare" built with React, Express, and PostgreSQL. The application serves as both a job board for healthcare positions across Devon and Cornwall, and a management system for applications and contact submissions. It features a modern UI built with shadcn/ui components, comprehensive job management capabilities, file upload functionality, and admin tools for managing listings and applications.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: wouter for client-side routing with pages for home, services, jobs, contact, and admin
- **State Management**: TanStack Query for server state management with optimistic updates
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **File Uploads**: Uppy with AWS S3 integration for direct-to-cloud uploads

## Backend Architecture  
- **Framework**: Express.js with TypeScript running in ESM mode
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Storage Strategy**: Dual storage implementation with in-memory storage (MemStorage) for development and database storage for production
- **File Storage**: Google Cloud Storage integration with Access Control List (ACL) system for secure file management
- **API Design**: RESTful endpoints with comprehensive CRUD operations for jobs, applications, and contact submissions

## Data Layer
- **ORM**: Drizzle with PostgreSQL dialect for schema management and migrations
- **Database Provider**: Neon serverless PostgreSQL with connection pooling
- **Schema Design**: 
  - Users table for authentication
  - Jobs table with comprehensive job details (salary, location, type, requirements)
  - Applications table linking to jobs with file upload support
  - Contact submissions table for inquiries
- **Data Validation**: Zod schemas shared between client and server for consistent validation

## Authentication & Authorization
- Basic user authentication system in place with username/password
- Object-level access control system for file uploads with configurable ACL policies
- Admin interface protected by authentication checks

## External Dependencies

- **Database**: Neon PostgreSQL serverless database
- **File Storage**: Google Cloud Storage with Replit sidecar integration for credentials
- **Email Service**: SendGrid for email notifications (configured but not fully implemented)
- **UI Components**: Radix UI primitives for accessible component foundation
- **File Upload**: Uppy dashboard for rich file upload experience
- **Styling**: Tailwind CSS with custom design system variables
- **Development**: Replit-specific plugins for development environment integration