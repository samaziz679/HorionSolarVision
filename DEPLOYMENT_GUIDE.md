# Solar Vision ERP - Deployment Guide

This guide provides step-by-step instructions for deploying the Solar Vision ERP system with complete batch tracking functionality.

## Quick Start

For a fresh installation, you only need to run **ONE** script:
- `scripts/00_fresh_install_complete.sql` - Complete database setup

## Prerequisites

Before you begin, ensure you have:

1. **A GitHub Account**: Your project repository should be hosted on GitHub
2. **A Vercel Account**: Sign up or log in at [vercel.com](https://vercel.com/)
3. **A Supabase Project**: Create a new Supabase project at [supabase.com](https://supabase.com/)

## Database Setup

### 1. Set Up Supabase Database

1. **Create a new Supabase project** at [supabase.com](https://supabase.com/)
2. **Run the unified installation script**:
   - Go to your Supabase dashboard
   - Navigate to the SQL Editor
   - Copy and paste the entire contents of `scripts/00_fresh_install_complete.sql`
   - Click "Run" to execute the script

**That's it!** This single script creates:
- ✅ All core tables (products, clients, suppliers, sales, purchases, expenses)
- ✅ **Complete batch tracking system** (stock_lots, stock_movements)
- ✅ User management and RBAC system
- ✅ Analytics views and functions
- ✅ Row Level Security policies
- ✅ Performance indexes
- ✅ Automated triggers for batch creation
- ✅ FIFO inventory deduction system

### 2. Configure Authentication

1. In your Supabase dashboard, go to **Authentication > Settings**
2. **Enable Email authentication**
3. **Set up your site URL** (will be your Vercel deployment URL)

### 3. Get Your Supabase Credentials

From your Supabase dashboard, go to **Settings > API** and copy:
- **Project URL** (e.g., `https://your-project-id.supabase.co`)
- **Anon/Public Key** (for client-side usage)
- **Service Role Key** (for server-side usage - keep this secret!)

## Vercel Deployment

### 1. Link Your GitHub Repository to Vercel

1. **Log in to Vercel**: Go to your Vercel dashboard
2. **Add New Project**: Click "Add New..." and then "Project"
3. **Import Git Repository**: Select your `solar-vision-erp` repository from GitHub
4. **Configure Framework**: Vercel should auto-detect Next.js

### 2. Configure Environment Variables

In the Vercel project settings, add these environment variables:

**Required Variables:**
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_CURRENCY=FCFA
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
\`\`\`

**Optional Variables:**
\`\`\`
VERCEL_FORCE_NO_BUILD_CACHE=1
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

### 3. Deploy Your Project

1. Click **"Deploy"** button
2. Monitor the build process in the deployment logs
3. Once successful, you'll get a unique URL for your application

## Post-Deployment Setup

### 1. Create Your First Admin User

1. **Access your deployed application**
2. **Sign up** with your email address
3. **Check your email** for the confirmation link
4. **Confirm your account**

### 2. Set Admin Role in Database

Since the first user won't have admin privileges automatically:

1. Go to your **Supabase dashboard**
2. Navigate to **Table Editor > user_roles**
3. **Insert a new row**:
   - `user_id`: Your user ID from the `auth.users` table
   - `role`: `admin`
   - `created_by`: Your user ID

### 3. Test Your Installation

**Inventory Management:**
- ✅ Add products with zero quantity
- ✅ Use purchases to create stock lots automatically
- ✅ Verify batch tracking is working (LOT-2025-001, LOT-2025-002, etc.)

**Sales Process:**
- ✅ Create a sale
- ✅ Verify FIFO deduction from oldest batches first
- ✅ Check inventory updates automatically

**Reporting:**
- ✅ View analytics dashboard
- ✅ Check batch-specific reports
- ✅ Verify stock movement tracking

## What You Get

Your deployment includes a comprehensive batch tracking system:

### **Automatic Lot Creation**
- Every purchase creates a unique stock lot (LOT-2025-001, LOT-2025-002, etc.)
- Tracks quantity received, available, and unit cost per batch

### **FIFO Inventory Management**
- Sales automatically deduct from oldest batches first
- Maintains accurate cost tracking and inventory aging

### **Complete Audit Trail**
- All stock movements tracked with lot numbers
- User activity logging in audit_logs table
- Detailed reporting and analytics

### **Enhanced Features**
- Bulk CSV import for purchases
- User role management (admin, manager, user)
- Company settings and branding
- Mobile-responsive interface

## Scripts Reference

### For Fresh Installation
- `scripts/00_fresh_install_complete.sql` - **Use this for new deployments**

### Development Scripts (Reference Only)
The `scripts/` folder contains many development scripts that were used during the building process. These are for reference only and should NOT be run on a fresh installation:

- `complete_database_schema.sql` - Older version, use `00_fresh_install_complete.sql` instead
- `create_stock_lots_system.sql` - Included in main script
- `migrate_direct_inventory_to_stock_lots.sql` - Migration script (not needed for fresh install)
- Various fix and update scripts - Applied during development

## Troubleshooting

### Common Issues

**Build Failures:**
- Check environment variables are correctly set
- Verify `pnpm-lock.yaml` is committed to repository
- Review build logs for specific errors

**Database Connection Issues:**
- Verify Supabase URL and keys
- Check RLS policies are properly configured
- Ensure the installation script completed successfully

**Authentication Problems:**
- Confirm email authentication is enabled in Supabase
- Check site URL configuration matches your deployment
- Verify user roles are properly assigned

### Getting Help

1. **Check Vercel deployment logs** for build/runtime errors
2. **Review Supabase logs** for database issues
3. **Verify environment variables** are correctly configured
4. **Test database functions** directly in Supabase SQL editor

## Security Considerations

1. **Never expose Service Role Key** on client-side
2. **Configure proper RLS policies** (included in installation script)
3. **Set up proper user roles** and permissions
4. **Regular database backups** through Supabase
5. **Monitor application logs** for security issues

Your Solar Vision ERP system is now fully deployed with comprehensive batch tracking, ready for production use! 🚀
