#  Ecomate

Track the environmental impact of your AI conversations in real-time. Ecomate is a Next.js PWA that visualizes the carbon emissions, energy consumption, and water usage of AI chat interactions.

## Features

- **Real-time Environmental Metrics**: Track energy (Wh), carbon emissions (gCO₂e), and water usage (L) per session
- **Multiple Chat Sessions**: Organize conversations into separate sessions with independent metrics
- **Persistent Storage**: All data saved to Supabase for cross-device access
- **Customizable Settings**: Adjust model size, energy mix, and water factors per session
- **Modern UI**: Built with Next.js 15, React 19, Tailwind CSS, and shadcn/ui
- **Mobile Responsive**: Fully responsive design with PWA support
- **Offline Capable**: Progressive Web App with service worker caching

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Radix primitives)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini AI (gemini-2.0-flash-exp)
- **PWA**: next-pwa with offline support
- **Testing**: Jest, React Testing Library, Cypress

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- Google AI API key (Gemini)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd digital-footprints
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_API_KEY=your_google_api_key
```

**📚 For detailed setup instructions, see [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)**

** Migrating from Streamlit?** Environment variable names have changed. See the migration warning in the setup guide.

### 4. Set Up Database

Run the SQL migration in your Supabase SQL editor:

```bash
# Copy contents of supabase/schema.sql to Supabase SQL Editor and execute
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Troubleshooting

If you encounter errors (like "Failed to create session"), see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions.

## Project Structure

```
digital-footprints/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── chat/         # Chat endpoint (Gemini AI)
│   │   └── sessions/     # Session CRUD
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── SessionList.tsx   # Session sidebar
│   ├── ChatInterface.tsx # Chat UI
│   ├── MetricsPanel.tsx  # Metrics display
│   └── SettingsPanel.tsx # Settings controls
├── contexts/             # React Context providers
│   ├── ChatContext.tsx   # Chat state management
│   └── SettingsContext.tsx # Settings management
├── lib/                  # Utilities and helpers
│   ├── supabase/        # Supabase client & queries
│   ├── types.ts         # TypeScript definitions
│   ├── constants.ts     # App constants
│   └── utils.ts         # Utility functions
├── supabase/            # Database schema
│   ├── schema.sql       # Complete schema
│   └── migrations/      # Migration files
└── public/              # Static assets
    ├── manifest.json    # PWA manifest
    └── icons/          # App icons
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google Gemini AI API key | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:coverage # Run tests with coverage
npm run cypress      # Open Cypress E2E tests
npm run type-check   # Run TypeScript type checking
```

## Testing

### Unit Tests

```bash
npm run test
```

Runs Jest tests with React Testing Library. Target: ≥90% coverage.

### E2E Tests

```bash
npm run cypress
```

Runs Cypress end-to-end tests.

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Build the production bundle:

```bash
npm run build
npm run start
```

Deploy the `.next` folder and `public` assets.

## Environmental Metrics Methodology

### Energy Calculation

Energy per 1000 tokens (kilotoken):
- Small Model: 0.005 Wh/kToken
- Medium Model (GPT-3.5/Flash): 0.025 Wh/kToken
- Large Model (GPT-4/Ultra): 0.09 Wh/kToken

### Carbon Calculation

Carbon intensity by grid:
- Renewables: 20 gCO₂e/kWh
- Global Average: 450 gCO₂e/kWh
- US Average: 400 gCO₂e/kWh
- Coal-Powered: 820 gCO₂e/kWh

Formula: `Carbon = (Energy_Wh / 1000) × Carbon_Intensity`

### Water Calculation

Default: 1.1 L/kWh (based on Google's 2023 data center report)

Formula: `Water = (Energy_Wh / 1000) × Water_Factor`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Environmental impact calculations based on academic research
- Inspired by the need for transparency in AI environmental costs
- Built with modern web technologies for maximum performance

## Support

**Having issues?**
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common problems and solutions
2. Review [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for setup instructions
3. Look at server console logs for detailed error messages (marked with ❌)
4. Open an issue on GitHub with error details

For questions or contributions, please open an issue on GitHub.

---

Made with  for a more sustainable AI future
