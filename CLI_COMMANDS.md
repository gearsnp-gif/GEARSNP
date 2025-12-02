# Quick Reference - CLI Commands

## 🎯 Development Commands

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Run Linter
```bash
npm run lint
```

## 📦 Package Management

### Install Dependencies
```bash
npm install
```

### Add shadcn/ui Component
```bash
npx shadcn@latest add [component-name]
```

### Update Packages
```bash
npm update
```

## 🗄️ Environment Setup

### Create Environment File
```bash
cp .env.local.example .env.local
```

### Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Deployment (Vercel)

### Install Vercel CLI
```bash
npm i -g vercel
```

### Deploy
```bash
vercel
```

### Deploy to Production
```bash
vercel --prod
```

## 🔧 Useful Next.js Commands

### Clear Next.js Cache
```bash
rm -rf .next
```

### Analyze Bundle Size
```bash
npm run build
# Then check the output
```

### Type Check
```bash
npx tsc --noEmit
```

## 📱 Testing Routes

### Storefront Routes
- Homepage: http://localhost:3000
- Products: http://localhost:3000/products
- Teams: http://localhost:3000/teams
- Cart: http://localhost:3000/cart
- Checkout: http://localhost:3000/checkout
- Events: http://localhost:3000/events

### Admin Routes
- Login: http://localhost:3000/admin/login
- Dashboard: http://localhost:3000/admin/dashboard
- Products: http://localhost:3000/admin/products
- Orders: http://localhost:3000/admin/orders
- Settings: http://localhost:3000/admin/settings

## 🛠️ Common Tasks

### Add New shadcn/ui Components
```bash
# Single component
npx shadcn@latest add badge

# Multiple components
npx shadcn@latest add badge tabs select
```

### Create New Page
1. Create file in appropriate route group
2. Export default React component
3. Navigate to route in browser

### Update Theme Colors
Edit `app/globals.css` - Look for CSS variables under `:root`

### Add New Navigation Item
- Mobile: Edit `components/shared/MobileBottomNav.tsx`
- Desktop: Edit `components/shared/DesktopTopNav.tsx`

## 🐛 Troubleshooting

### Clear All Cache and Reinstall
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Fix Type Errors
```bash
npx tsc --noEmit
```

### Check for Unused Dependencies
```bash
npx depcheck
```

## 📊 Project Stats

### View Bundle Size
```bash
npm run build
# Check .next/static output
```

### Count Lines of Code
```bash
find . -name '*.tsx' -o -name '*.ts' | xargs wc -l
```

## 🔑 Git Commands

### Initial Commit
```bash
git add .
git commit -m "Initial GearsNP scaffold"
git push origin main
```

### Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

---

**Quick Start**: `npm install` → `cp .env.local.example .env.local` → Add Supabase keys → `npm run dev`
