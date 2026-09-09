# Frontend - Self-Print

React 19 + Vite + TypeScript + Tailwind CSS client application.

## Tech Stack

- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS + PostCSS + Lucide Icons
- **Routing:** React Router v7
- **Data Fetching & Caching:** TanStack Query (React Query v5)
- **HTTP Client:** Axios with reusable client and interceptors
- **Forms & Validation:** React Hook Form + Zod

## Directory Structure

```
src/
├── assets/         # Static assets (images, icons, fonts)
├── components/     # UI and presentation components
│   ├── common/     # Reusable application-wide components
│   ├── layout/     # Page layout wrappers (headers, sidebars, footers)
│   └── ui/         # Base design system primitives (buttons, inputs, dialogs)
├── pages/          # Route page views
├── routes/         # Router configuration and route declarations
├── hooks/          # Custom reusable React hooks
├── services/       # API call services
├── lib/            # Shared libraries configuration (Axios, TanStack Query, utils)
├── types/          # Global TypeScript interfaces and types
├── context/        # React Context providers
├── utils/          # Pure helper functions
├── constants/      # App configuration constants
├── styles/         # Global styles and Tailwind overrides
├── App.tsx         # Root component with providers
├── main.tsx        # React DOM mount entry
└── index.css       # Tailwind base styles
```

## Scripts

```bash
# Start local development server (port 5173)
npm run dev

# Type check and build production bundle
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```
