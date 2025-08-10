# Solar Vision ERP

This is a Solar Vision ERP (Enterprise Resource Planning) system built with Next.js, React, and Supabase.

## Features

-   **Authentication**: User login and session management using Supabase Auth.
-   **Dashboard**: Overview of key metrics and recent activities.
-   **Clients Management**: Add, view, edit, and delete client information.
-   **Suppliers Management**: Add, view, edit, and delete supplier information.
-   **Inventory Management**: Track products, stock levels, and product details.
-   **Sales Management**: Record and manage sales transactions.
-   **Purchases Management**: Record and manage purchase orders.
-   **Expenses Tracking**: Log and categorize business expenses.
-   **Banking Management**: Manage bank accounts and transactions.

## Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   pnpm (or npm/yarn)
-   Supabase project set up with the provided schema.

### Installation

1.  **Clone the repository**:
    \`\`\`bash
    git clone https://github.com/your-username/solar-vision-erp.git
    cd solar-vision-erp
    \`\`\`

2.  **Install dependencies**:
    \`\`\`bash
    pnpm install
    \`\`\`

3.  **Set up Supabase**:
    -   Create a new Supabase project.
    -   Run the SQL scripts located in the `scripts/` directory to set up your database schema and seed initial data. Start with `supabase_schema.sql`, then `complete_supabase_schema.sql`, `complete_supabase_schema_corrected.sql`, `complete_supabase_schema_final_correction.sql`, `complete_supabase_schema_final_correction_v2.sql`, `insert_initial_stock.sql`, and finally `insert_initial_stock_corrected.sql`.
    -   Retrieve your Supabase Project URL and Anon Key from your Supabase project settings (`Settings > API`).

4.  **Configure Environment Variables**:
    Create a `.env.local` file in the root of your project and add the following:

    \`\`\`env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
    \`\`\`
    Replace `YOUR_SUPABASE_URL`, `YOUR_SUPABASE_ANON_KEY`, and `YOUR_SUPABASE_SERVICE_ROLE_KEY` with your actual Supabase credentials.

5.  **Run the development server**:
    \`\`\`bash
    pnpm run dev
    \`\`\`
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

This project is designed to be deployed on Vercel.

1.  **Connect your GitHub repository to Vercel**.
2.  **Configure Environment Variables on Vercel**: Add the same Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) to your Vercel project settings.
3.  **Deploy**: Vercel will automatically build and deploy your application on every push to the configured branch (e.g., `main`).

## Project Structure

-   `app/`: Next.js App Router pages and API routes.
-   `components/`: Reusable React components, including Shadcn UI components.
-   `lib/`: Utility functions, data fetching logic, and Supabase client setup.
-   `public/`: Static assets.
-   `scripts/`: SQL scripts for Supabase schema and data seeding.
-   `styles/`: Global CSS.

## Contributing

Feel free to fork the repository, make improvements, and submit pull requests.

## License

This project is open-source and available under the MIT License.
