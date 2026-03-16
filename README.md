# Cashually — Frontend

A clean, minimal budget tracking app built with Next.js. Track expenses, manage budgets, and stay on top of your spending.

🌐 Live at [cashually.vercel.app](https://cashually.vercel.app)

## Features

- Login & register with JWT auth
- Dashboard with spending overview and budget progress
- Add, edit, and delete expenses
- Filter expenses by category, date, and amount
- Set monthly budgets per category
- Responsive, clean UI

## Tech Stack

- **Framework** — Next.js
- **Styling** — Tailwind CSS
- **HTTP Client** — Axios
- **Auth** — JWT stored in localStorage

## Run Locally

1. **Clone the repo**
```bash
   git clone https://github.com/p-koteswara/expense_tracker_fe
   cd cashually
```

2. **Install dependencies**
```bash
   npm install
```

3. **Set up environment variables** — create a `.env.local` file:
```
   NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. **Run the dev server**
```bash
   npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Backend

API built with FastAPI — https://github.com/p-koteswara/expense_tracker