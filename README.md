# GearsNP - F1 Merchandise Store

A modern e-commerce platform for premium F1 merchandise built with Next.js 15, Supabase, Tailwind CSS, and shadcn/ui.

## 🏎️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd gears-np
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
app/
├── (store)/              # Public storefront
│   ├── layout.tsx        # Store layout with navigation
│   ├── page.tsx          # Homepage
│   ├── products/         # Product pages
│   ├── teams/            # Team pages
│   ├── cart/             # Shopping cart
│   ├── checkout/         # Checkout flow
│   └── events/           # F1 events
│
├── (admin)/admin/        # Admin portal (auth protected)
│   ├── layout.tsx        # Admin layout with sidebar
│   ├── login/            # Admin login
│   ├── dashboard/        # Admin dashboard
│   ├── categories/       # Manage categories
│   ├── teams/            # Manage teams
│   ├── products/         # Manage products
│   ├── orders/           # Manage orders
│   ├── deliveries/       # Track deliveries
│   ├── events/           # Manage events
│   └── settings/         # Store settings
│
components/
├── ui/                   # shadcn/ui components
└── shared/               # Shared components
    ├── MobileBottomNav.tsx
    ├── DesktopTopNav.tsx
    └── TeamBadge.tsx

lib/
└── supabase/
    ├── client.ts         # Browser client
    └── server.ts         # Server client
```

## 🎨 Design System

- **Primary Color**: Racing Red (#dc2626)
- **Accent Colors**: Electric Blue (#3b82f6), Neon Yellow (#facc15)
- **Background**: Dark (#0a0a0a)
- **Theme**: F1-inspired dark theme with smooth transitions

## 📱 Responsive Design

- **Mobile**: Bottom navigation bar (< md breakpoint)
- **Desktop**: Top navigation bar (≥ md breakpoint)
- Mobile-first approach with Tailwind breakpoints

## 🔐 Authentication

Admin routes are protected with Supabase Auth. Unauthenticated users are redirected to `/admin/login`.

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🚢 Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 📝 Next Steps

1. Set up Supabase database schema
2. Configure Supabase authentication
3. Implement product catalog
4. Add payment integration (Stripe recommended)
5. Set up email notifications
6. Configure CDN for images

## 🤝 Contributing

This is a production-ready scaffold. Customize according to your business requirements.

## 📄 License

Private project - All rights reserved
