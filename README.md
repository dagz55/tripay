# Welcome to Tripay - Payables Management App

![Tech Stack](https://img.shields.io/badge/Next.js-14.0-black?style=flat-square&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38bdf8?style=flat-square&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-1.0-3ecf8e?style=flat-square&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript&logoColor=white)

A modern, Apple-inspired accounts payable management system built with Next.js, Tailwind CSS, and Supabase. Features real-time updates, calendar views, inline editing, and PDF receipt extraction.

Authored by Dagz Suarez

## ✨ Features
- 📊 **Dashboard Overview** - Real-time stats and metrics
- 📅 **Calendar View** - Monthly view of payment due dates
- ✏️ **Inline Editing** - Click-to-edit amounts, dates, and vendors
- 🔄 **Real-time Updates** - Instant synchronization across all users
- 📄 **PDF Receipt Extraction** - Upload and auto-extract invoice data
- 🔍 **Smart Search & Filtering** - Find Tripay instantly
- 📱 **Responsive Design** - Works perfectly on all devices
- 🔒 **Row-Level Security** - Secure, user-specific data access
- 🎨 **Apple-Inspired UI** - Clean, modern interface with Shadcn/ui

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Git
- Supabase account (free tier works)
- Vercel account (for deployment)

### 1️⃣ Clone & Install
```bash
# Clone the repository
git clone https://github.com/dagz55/tripay.git
cd tripay

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### 2️⃣ Environment Setup
```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3️⃣ Run Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Project Structure
```
tripay/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles
│   ├── auth/
│   │   ├── login/page.tsx      # Login page
│   │   ├── signup/page.tsx     # Signup page
│   │   └── callback/route.ts   # Auth callback
│   └── dashboard/
│       └── page.tsx            # Protected dashboard
├── components/
│   ├── TripayDemo.tsx          # Main dashboard component
│   ├── AuthForm.tsx            # Authentication form
│   └── ui/                     # Reusable UI components
│       ├── button.tsx
│       ├── input.tsx
│       └── card.tsx
├── lib/
│   ├── supabase.ts             # Supabase client & types
│   └── utils.ts                # Utility functions
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── next.config.js              # Next.js configuration
```

## 🔧 Complete Setup Guide

### Step 1: Create Next.js App
```bash
# Create a new Next.js app with TypeScript and Tailwind
npx create-next-app@latest tripay --typescript --tailwind --app

cd tripay

# Install additional dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs lucide-react clsx tailwind-merge
```

### Step 2: Environment Variables
Create `.env.local` in your project root:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For PDF processing
NEXT_PUBLIC_PDF_API_KEY=your_pdf_extraction_api_key
```

### Step 3: Supabase Setup

#### 3.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key to `.env.local`

#### 3.2 Database Schema
Run this SQL in Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Tripay table
CREATE TABLE Tripay (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  vendor TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'paid')) DEFAULT 'pending',
  category TEXT,
  invoice_number TEXT UNIQUE,
  notes TEXT,
  contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_Tripay_user_id ON Tripay(user_id);
CREATE INDEX idx_Tripay_due_date ON Tripay(due_date);
CREATE INDEX idx_Tripay_status ON Tripay(status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE Tripay ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Tripay
CREATE POLICY "Users can view own Tripay" ON Tripay
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own Tripay" ON Tripay
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Tripay" ON Tripay
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own Tripay" ON Tripay
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_Tripay_updated_at BEFORE UPDATE ON Tripay
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 3.3 Enable Realtime
1. Go to Supabase Dashboard > Database > Replication
2. Enable replication for the `Tripay` table
3. Select all events (INSERT, UPDATE, DELETE)

### Step 4: Run the Application
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🚢 Deploy to Vercel

### Step 1: Push to GitHub
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/tripay.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

### Step 3: Configure Domain (Optional)
1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ |
| `NEXT_PUBLIC_PDF_API_KEY` | API key for PDF extraction service | ❌ |

## 🔐 Security Best Practices
- **Row Level Security (RLS)** - Already configured in the schema
- **Environment Variables** - Never commit `.env.local` to git
- **API Keys** - Use server-side API routes for sensitive operations
- **Authentication** - Email verification enabled by default
- **CORS** - Configure allowed origins in Supabase

## 📦 Additional Features to Implement

### Email Notifications
```typescript
// Create Supabase Edge Function for email notifications
const sendPaymentReminder = async (payable: any) => {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to: payable.contact,
      subject: `Payment Reminder: ${payable.invoice_number}`,
      html: `Payment of $${payable.amount} is due on ${payable.due_date}`
    }
  })
}
```

### PDF Processing
```typescript
// Integrate with PDF extraction API
const extractPDFData = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/extract-pdf', {
    method: 'POST',
    body: formData
  })
  
  const data = await response.json()
  return data
}
```

### Export to Accounting Software
```typescript
// Export to CSV/QuickBooks format
const exportToCSV = (Tripay: any[]) => {
  const csv = Tripay.map(p => 
    `"${p.invoice_number}","${p.vendor}","${p.amount}","${p.due_date}"`
  ).join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Tripay.csv'
  a.click()
}
```

## 🧪 Testing
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run tests
npm test

# E2E testing with Playwright
npm install --save-dev @playwright/test
npx playwright test
```

## 📊 Performance Optimization
- **Image Optimization** - Use Next.js Image component
- **Code Splitting** - Dynamic imports for large components
- **Caching** - Implement SWR or React Query
- **Database Indexes** - Already configured in schema
- **CDN** - Vercel Edge Network included

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Supabase](https://supabase.com/) - Backend as a Service
- [Shadcn/ui](https://ui.shadcn.com/) - Component library inspiration
- [Lucide Icons](https://lucide.dev/) - Icon library

## 📧 Support
For support, email support@trigo.live or open an issue on GitHub.

---

***Built with ❤️ using Next.js and Supabase***
