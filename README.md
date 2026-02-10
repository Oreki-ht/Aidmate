# AidMate

AidMate is an AI-assisted emergency response coordination platform. It connects medical directors and paramedics with real-time case management, location tracking, and an on-demand first-aid assistant.

## What the project does

- Role-based dashboards for medical directors and paramedics
- Emergency case creation, assignment, and status tracking
- AI assistant for first-aid guidance and triage questions
- Map-based location capture for incidents and paramedic updates
- Push notifications for newly assigned cases

## Why the project is useful

- Speeds up emergency coordination with a single source of truth
- Reduces response time by routing cases to available paramedics
- Provides consistent, safety-focused first-aid guidance
- Keeps teams updated with notifications and live case status

## How users can get started

- You can try logging in as a medical director with these credentials
- email: director@aidmate.com
- pass: director123

### Prerequisites

- Node.js 18+
- PostgreSQL
- A package manager (npm, pnpm, or yarn)

### Install dependencies

```bash
npm install
```

### Configure environment

Create a `.env` file in the project root:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/aidmate"
NEXTAUTH_SECRET="replace-with-a-long-random-string"
GOOGLE_API_KEY="your-google-generative-ai-key"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-vapid-key"
VAPID_PRIVATE_KEY="your-private-vapid-key"
```

Generate VAPID keys (once):

```bash
npx web-push generate-vapid-keys
```

### Prepare the database

```bash
npx prisma migrate dev
```

### Run the app

```bash
npm run dev
```

Open http://localhost:3000.

### Usage example

Create a case as a director:

```bash
curl -X POST http://localhost:3000/api/cases \
	-H "Content-Type: application/json" \
	-d '{
		"patientName":"John Doe",
		"patientAge":42,
		"patientGender":"male",
		"location":"Bole, Addis Ababa",
		"latitude":8.9981,
		"longitude":38.7853,
		"description":"Severe chest pain",
		"severity":"HIGH",
		"notes":"Onset 10 minutes ago"
	}'
```

Try the AI assistant:

```bash
curl -X POST http://localhost:3000/api/gemini \
	-H "Content-Type: application/json" \
	-d '{"query":"What should I do for a suspected fracture?"}'
```

## Where users can get help

- Project API routes live in [app/api](app/api)
- Next.js docs: https://nextjs.org/docs
- Prisma docs: https://www.prisma.io/docs
- NextAuth docs: https://next-auth.js.org
- Web Push docs: https://github.com/web-push-libs/web-push

## Who maintains and contributes

AidMate is maintained by the AidMate contributors. Contributions are welcome via pull requests and issues. If you plan a larger change, open an issue first to discuss scope and approach.
