# ☁️ Big Cloud Metrics AI

**Pharmacy performance tracking for Pill Cloud Specialty Pharmacy of Long Island**

A modern, elegant web application for tracking daily performance metrics across your pharmacy team — built with Next.js 14, PostgreSQL, and a beautiful dark/light UI.

---

## ✅ Pre-Launch Checklist

Before running the app, you need:

1. **Node.js** installed (≥ 18)
2. **A free Neon.tech PostgreSQL database** (takes 2 minutes)
3. **A free Resend account** for email (takes 2 minutes)
4. **A free Vercel account** for hosting (takes 5 minutes)

---

## 🚀 Step-by-Step Setup

### Step 1 — Install Node.js

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** version (e.g., 20.x)
3. Run the installer — accept all defaults
4. Open a new **PowerShell** or **Command Prompt** window
5. Verify: `node --version` should print `v20.x.x`

---

### Step 2 — Set Up Neon Database (Free)

1. Go to [https://neon.tech](https://neon.tech) and create a free account
2. Create a new project → name it `big-cloud-metrics`
3. Click **"Connection string"** → copy the full `postgresql://...` URL
4. You'll paste this into `.env.local` in Step 4

---

### Step 3 — Set Up Resend Email (Free)

1. Go to [https://resend.com](https://resend.com) and create a free account
2. Go to **API Keys** → Create a new key → copy it
3. *(Optional but recommended)* Add and verify your domain for the `FROM` address
   - Without a verified domain, use: `onboarding@resend.dev` (only sends to your own email)
4. You'll paste this into `.env.local` in Step 4

---

### Step 4 — Configure Environment Variables

In the project folder, copy the example env file:

```
# Windows PowerShell:
Copy-Item .env.example .env.local
```

Then open `.env.local` with Notepad (or VS Code) and fill in all values:

```env
DATABASE_URL="postgresql://your-neon-url-here"
NEXTAUTH_SECRET="paste-a-random-32-char-string-here"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="Big Cloud Metrics <noreply@yourdomain.com>"

SEED_ADMIN_NAME="George Michael"
SEED_ADMIN_EMAIL="george@pillcloudpharmacy.com"
SEED_ADMIN_PASSWORD="Admin2026!"
```

> **Generating NEXTAUTH_SECRET:** Open PowerShell and run:
> ```
> [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
> ```
> Copy the output as your secret.

---

### Step 5 — Install Dependencies

Open PowerShell, navigate to the project folder, and run:

```powershell
cd "C:\Users\pillc\Desktop\Claudie Ai\big-cloud-metrics-ai"
npm install
```

This installs all packages (~2 minutes).

---

### Step 6 — Set Up the Database

```powershell
# Generate Prisma client
npm run db:generate

# Push schema to Neon (creates all tables)
npm run db:push

# Seed the database (creates your admin account + all metric types)
npm run db:seed
```

After `db:seed`, you'll see your login credentials printed in the terminal.

---

### Step 7 — Start the App

```powershell
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**

**Login with:**
- Email: `george@pillcloudpharmacy.com` (or whatever you set in `.env.local`)
- Password: `Admin2026!` (or whatever you set)

> ⚠️ **Change your password after first login!** Go to Admin → User Management → Edit your account.

---

## 📱 Accessing From Other Devices (Phone/Tablet)

While running `npm run dev`:

1. Find your computer's local IP: Open PowerShell → `ipconfig` → look for `IPv4 Address` (e.g., `192.168.1.42`)
2. On your phone or tablet, open a browser and go to: `http://192.168.1.42:3000`
3. The app is fully mobile-responsive

---

## 🌐 Deploying to the Internet (Free on Vercel)

### One-Time Setup

1. **Create a GitHub account** if you don't have one: [github.com](https://github.com)
2. **Create a Vercel account**: [vercel.com](https://vercel.com) — sign in with GitHub
3. Push the project to GitHub (run once from the project folder):

```powershell
git init
git add .
git commit -m "Initial commit"
# Create a repo at github.com then:
git remote add origin https://github.com/YOUR_USERNAME/big-cloud-metrics.git
git push -u origin main
```

4. In Vercel: **New Project** → Import from GitHub → select your repo
5. **Add Environment Variables** in Vercel dashboard (same values as `.env.local`)
   - Important: set `NEXTAUTH_URL` to your Vercel URL, e.g., `https://big-cloud-metrics.vercel.app`
6. Click **Deploy** — done! Your app is live on the internet.

### Future Deployments

Every time you push to GitHub, Vercel auto-deploys the update.

---

## 👥 Creating User Accounts

1. Log in as George Michael (SUPER_ADMIN)
2. Go to **Admin → User Management**
3. Click **New User**
4. Fill in name, email, role (Manager / Pharmacist / Technician), and set a temporary password
5. Click **Create User** — a welcome email is sent automatically with their credentials

---

## 📊 Roles & Access

| Role | What they can do |
|------|-----------------|
| **Super Admin** (you) | Everything — create users, manage metrics, view all data |
| **Manager** | View all dashboards, manage metric types, export reports |
| **Pharmacist** | Log their own metrics, view all team data |
| **Technician** | Log their own metrics, view all team data |

---

## 📈 Features

- **Technician Dashboard** — Large colorful +1 buttons for instant metric logging, running totals
- **Team Progress Panel** — Live team target tracking visible to all users
- **Manager Overview** — Leaderboard, gap analysis chart, contribution charts
- **Team Dashboard** — Trend charts by team member, full metrics table
- **Reports** — Date range picker, CSV and PDF export
- **Manage Metrics** — Add/edit/deactivate metric types with targets
- **User Management** — Create/edit/deactivate users, auto-generated passwords
- **Dark/Light Mode** — Toggle in sidebar, remembers preference
- **Email Notifications** — Welcome emails, daily summaries, mid-day alerts, shift reminders
- **Auto-refresh** — Dashboard data updates every 10 seconds automatically

---

## ⚙️ Useful Commands

```powershell
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Run production build locally
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:seed      # Re-run the seed (safe — uses upsert, won't duplicate)
```

---

## 📁 Project Structure

```
big-cloud-metrics-ai/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Initial data seed
├── src/
│   ├── app/
│   │   ├── (auth)/login/       # Login page
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/      # Technician/Pharmacist views
│   │   │   ├── manager/        # Manager views
│   │   │   └── admin/          # Super admin views
│   │   └── api/                # All API routes
│   ├── components/             # Reusable UI components
│   ├── hooks/                  # React Query hooks
│   ├── lib/                    # Utilities, auth, email
│   └── types/                  # TypeScript types
└── .env.local                  # Your environment variables (never commit this!)
```

---

## 🆘 Troubleshooting

| Problem | Fix |
|---------|-----|
| `node: command not found` | Restart terminal after installing Node.js |
| `DATABASE_URL` connection error | Double-check the Neon connection string; make sure `?sslmode=require` is appended |
| Email not received | Check Resend dashboard for delivery logs; verify domain or use `onboarding@resend.dev` |
| Login not working | Make sure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set in `.env.local` |
| Blank page after login | Check browser console (F12) for errors; usually a missing env var |

---

*Big Cloud Metrics AI — Built for Pill Cloud Specialty Pharmacy of Long Island*
