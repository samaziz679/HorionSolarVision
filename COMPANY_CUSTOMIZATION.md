# Company Customization Guide

## How to Customize for Your Company

### 1. Update Company Information
Edit `lib/config/company.ts` to change:
- Company name and tagline
- Contact information
- Currency and language settings

### 2. Add Your Logo
1. Place your logo file in `public/images/company/logo.png`
2. Update the `logo` path in the config file
3. Recommended logo size: 200x60px (PNG format)

### 3. Customize Colors
Update the `theme` object in the config file:
\`\`\`typescript
theme: {
  primary: "rgb(your-primary-color)",
  secondary: "rgb(your-secondary-color)",
  // ... other colors
}
\`\`\`

### 4. Update Favicon
Replace `public/favicon.ico` with your company's favicon.

### 5. Customize Welcome Messages
All text is centralized in the config file for easy customization.

## Example Customization
\`\`\`typescript
export const companyConfig = {
  name: "Your Company ERP",
  fullName: "Your Company - Business Management System",
  tagline: "Welcome to Your Company ERP System",
  logo: "/images/company/your-logo.png",
  // ... rest of config
}
