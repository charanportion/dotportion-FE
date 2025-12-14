# NoCodeApiBuilder-FE

This is the frontend for the No-Code API Builder, a platform that allows users to visually create, configure, and manage API workflows without writing code. The application provides a dashboard for managing projects, workflows, secrets, and settings, with real-time statistics and analytics.

## Features

- Visual API workflow builder
- Project and secret management
- Real-time API call statistics (success/fail, top workflows)
- CORS and Rate Limiting configuration
- Modern, responsive UI built with Next.js and React

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd NoCodeApiBuilder-FE
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

- `app/` - Next.js app directory (pages, layouts, protected routes)
- `components/` - Reusable UI and feature components
- `lib/` - API clients, Redux store, and utility functions
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions
- `styles/` - Global and component styles

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit and push (`git commit -am 'Add new feature' && git push origin feature/your-feature`)
5. Open a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
