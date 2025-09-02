# Deployment Guide for Solar Vision ERP

This comprehensive guide provides step-by-step instructions for deploying the Solar Vision ERP system with complete batch tracking functionality.

## Prerequisites

Before you begin, ensure you have:

1. **A GitHub Account**: Your project repository should be hosted on GitHub
2. **A Vercel Account**: Sign up or log in at [vercel.com](https://vercel.com/)
3. **A Supabase Project**: Create a new Supabase project at [supabase.com](https://supabase.com/)

## Database Setup

### 1. Set Up Supabase Database

1. **Create a new Supabase project** at [supabase.com](https://supabase.com/)
2. **Run the complete database schema**:
   - Go to your Supabase dashboard
   - Navigate to the SQL Editor
   - Copy and paste the entire contents of `scripts/complete_database_schema.sql`
   - Click "Run" to execute the script

This will create:
- All core tables (products, clients, suppliers, sales, purchases, expenses)
- **Batch tracking system** (stock_lots, stock_movements)
- User management and RBAC system
- Analytics views and functions
- Row Level Security policies
- Performance indexes

### 2. Configure Authentication

1. In your Supabase dashboard, go to **Authentication > Settings**
2. **Enable Email authentication**
3. **Configure email templates** (optional)
4. **Set up your site URL** (will be your Vercel deployment URL)

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

### 3. Configure Build Settings

Ensure these settings in Vercel:
- **Framework Preset**: Next.js
- **Build Command**: `pnpm run build`
- **Install Command**: `pnpm install`
- **Output Directory**: `dist`
- **Node.js Version**: 18.x or higher

### 4. Deploy Your Project

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

### 3. Configure Company Settings

1. **Log in to your application**
2. **Navigate to Settings** (Paramètres)
3. **Upload your company logo**
4. **Configure company information**

### 4. Test Core Functionality

**Inventory Management:**
- Add products with zero quantity
- Use purchases to create stock lots
- Verify batch tracking is working

**Sales Process:**
- Create a sale
- Verify FIFO deduction from stock lots
- Check inventory updates

**Reporting:**
- View analytics dashboard
- Check batch-specific reports
- Verify stock movement tracking

## Batch Tracking System Features

Your deployment includes a comprehensive batch tracking system:

### **Automatic Lot Creation**
- Every purchase creates a unique stock lot (LOT-2025-001, LOT-2025-002, etc.)
- Tracks quantity received, available, and unit cost per batch

### **FIFO Inventory Management**
- Sales automatically deduct from oldest batches first
- Maintains accurate cost tracking and inventory aging

### **Detailed Tracking**
- Complete audit trail of all stock movements
- Batch-specific reporting and analytics
- Aging inventory analysis

### **Enhanced Inventory Display**
- View total quantities and batch counts
- Expandable rows showing individual lot details
- Stock status indicators (Critical, Low, Normal)

## Troubleshooting

### Common Issues

**Build Failures:**
- Check environment variables are correctly set
- Verify `pnpm-lock.yaml` is committed to repository
- Review build logs for specific errors

**Database Connection Issues:**
- Verify Supabase URL and keys
- Check RLS policies are properly configured
- Ensure database schema was applied correctly

**Authentication Problems:**
- Confirm email authentication is enabled in Supabase
- Check site URL configuration matches your deployment
- Verify user roles are properly assigned

**Batch Tracking Issues:**
- Ensure all database triggers are created
- Check stock_lots table has proper constraints
- Verify purchase/sales actions are using batch functions

### Getting Help

1. **Check Vercel deployment logs** for build/runtime errors
2. **Review Supabase logs** for database issues
3. **Verify environment variables** are correctly configured
4. **Test database functions** directly in Supabase SQL editor

## Security Considerations

1. **Never expose Service Role Key** on client-side
2. **Configure proper RLS policies** for production use
3. **Set up proper user roles** and permissions
4. **Regular database backups** through Supabase
5. **Monitor application logs** for security issues

## Maintenance

### Regular Tasks
- **Monitor stock levels** and set up low stock alerts
- **Review batch aging** reports for slow-moving inventory
- **Backup database** regularly through Supabase
- **Update dependencies** and security patches

### Scaling Considerations
- **Database performance**: Add indexes for large datasets
- **File storage**: Monitor Vercel Blob usage for images
- **User management**: Implement more granular RLS policies
- **Analytics**: Consider data archiving for historical reports

Your Solar Vision ERP system is now fully deployed with comprehensive batch tracking, ready for production use!
