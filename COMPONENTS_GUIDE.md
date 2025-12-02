# Component Usage Guide

## 🎨 Shared Components

### MobileBottomNav
Fixed bottom navigation for mobile devices.

**Usage:**
```tsx
import MobileBottomNav from "@/components/shared/MobileBottomNav";

// Already included in (store)/layout.tsx
```

**Features:**
- Auto-shows on mobile (< md breakpoint)
- Active state highlighting
- Icons from Lucide React
- Smooth transitions

---

### DesktopTopNav
Top navigation bar for desktop devices.

**Usage:**
```tsx
import DesktopTopNav from "@/components/shared/DesktopTopNav";

// Already included in (store)/layout.tsx
```

**Features:**
- Auto-shows on desktop (≥ md breakpoint)
- Logo with gradient
- Search icon
- Cart with item count badge
- Active link highlighting

---

### TeamBadge
Reusable badge component for F1 teams.

**Usage:**
```tsx
import TeamBadge from "@/components/shared/TeamBadge";

// Basic usage
<TeamBadge teamName="Red Bull Racing" />

// With custom color
<TeamBadge 
  teamName="Ferrari" 
  teamColor="#dc143c" 
/>

// With size
<TeamBadge 
  teamName="Mercedes" 
  teamColor="#00d2be"
  size="lg" 
/>
```

**Props:**
- `teamName`: string (required) - Team name to display
- `teamColor`: string (optional) - Hex color code, defaults to #dc2626
- `size`: "sm" | "md" | "lg" (optional) - Badge size, defaults to "md"

---

## 🧩 shadcn/ui Components

### Button
```tsx
import { Button } from "@/components/ui/button";

<Button>Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

**Variants:** default | outline | destructive | ghost | link | secondary
**Sizes:** default | sm | lg | icon

---

### Card
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
</Card>
```

---

### Input
```tsx
import { Input } from "@/components/ui/input";

<Input type="text" placeholder="Enter text" />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
```

---

### Table
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Item 1</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

### Dialog
```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description goes here
      </DialogDescription>
    </DialogHeader>
    <div>Dialog content</div>
  </DialogContent>
</Dialog>
```

---

### Sheet (Side Panel)
```tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

<Sheet>
  <SheetTrigger asChild>
    <Button>Open Sheet</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Sheet Title</SheetTitle>
      <SheetDescription>
        Sheet description
      </SheetDescription>
    </SheetHeader>
    <div>Sheet content</div>
  </SheetContent>
</Sheet>
```

**Sides:** right (default) | left | top | bottom

---

### Dropdown Menu
```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 🎯 Common Patterns

### Loading State
```tsx
const [loading, setLoading] = useState(false);

<Button disabled={loading}>
  {loading ? "Loading..." : "Submit"}
</Button>
```

### Form with Validation
```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MyForm() {
  const [value, setValue] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {items.map((item) => (
    <Card key={item.id}>
      {/* Card content */}
    </Card>
  ))}
</div>
```

---

## 🔧 Supabase Usage

### Client Component
```tsx
"use client";

import { supabase } from "@/lib/supabase/client";

export default function MyComponent() {
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*');
  };
  
  return <div>...</div>;
}
```

### Server Component
```tsx
import { supabaseServer } from "@/lib/supabase/server";

export default async function MyServerComponent() {
  const supabase = await supabaseServer();
  const { data } = await supabase.from('products').select('*');
  
  return <div>...</div>;
}
```

---

## 🎨 Styling Utilities

### Custom Classes
```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  condition && "conditional-class",
  "hover:bg-primary"
)}>
  Content
</div>
```

### Theme Colors
```tsx
// Use Tailwind classes with theme variables
<div className="bg-primary text-primary-foreground">
  Primary colored box
</div>

<div className="bg-card text-card-foreground border border-border">
  Card styled box
</div>

<div className="bg-accent text-accent-foreground">
  Accent colored box
</div>
```

---

**For more components**: Visit [shadcn/ui documentation](https://ui.shadcn.com)
