# How to Run TraveXa

This project is a React application built with Vite, TypeScript, and Tailwind CSS. It uses Supabase for the backend.

## Prerequisites

You need **Node.js** and **npm** (or bun/pnpm/yarn) installed on your machine.
Since the system detected that `npm` and `node` are not currently available in your terminal path, please ensure:
1. Node.js is installed (Download from [nodejs.org](https://nodejs.org/)).
2. You have restarted your terminal/IDE after installation.

## Setup Instructions

1.  **Install Dependencies**:
    Open a terminal in this directory and run:
    ```bash
    npm install
    # OR if using bun
    bun install
    ```

2.  **Environment Variables**:
    Ensure your `.env` file is set up with valid Supabase credentials.
    Current configuration detected:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_PUBLISHABLE_KEY`
    - `VITE_SUPABASE_PROJECT_ID`
    - `VITE_GOOGLE_MAPS_KEY`

3.  **Run Development Server**:
    To start the app and preview it:
    ```bash
    npm run dev
    # OR
    bun dev
    ```
    This will start the server at `http://localhost:8080`.

## Troubleshooting

-   **"npm is not recognized"**: Add Node.js to your system PATH.
-   **Supabase Errors**: Check if your Supabase project is active and the URL/Keys in `.env` are correct.
-   **Routing Issues**: The app uses client-side routing. If you see 404s on refresh in production, you need to configure your web server to redirect all requests to `index.html`.

## Code Status
I have reviewed the code structure, imports, and configuration. The codebase appears healthy with valid component hierarchy and type definitions. I fixed some broken route links in `AppSidebar.tsx`.
