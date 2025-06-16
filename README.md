# Credit Card Recommendation App

This is a [Next.js](https://nextjs.org) web application that helps users find the best credit card recommendations based on their current cards, spending habits, and reward preferences.

## Features

- Add your existing credit cards to personalize recommendations
- Specify planned yearly spend and maximum cards to open per year
- Choose between points or cashback reward preferences
- Optionally include business cards in recommendations
- View recommended cards with links, optimal open dates, and detailed value breakdowns

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm, yarn, pnpm, or bun

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/credit-card-recommendation.git
cd credit-card-recommendation
npm install
# or
yarn install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the app.

## Project Structure

- `src/app/page.tsx` - Main application page and UI logic
- `src/app/card-optimization/` - Card optimization logic and types
- `src/app/lib/data.ts` - Card data fetching utilities

## Customization

You can start editing the main page by modifying `src/app/page.tsx`. The app supports hot reloading for a smooth development experience.

## License

MIT

---

Made with ❤️ using Next.js.


