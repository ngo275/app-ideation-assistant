This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## OpenAI API Setup

This application uses the OpenAI API for analyzing app reviews. To set up the API:

1. Sign up for an account at [OpenAI](https://platform.openai.com/) if you don't have one
2. Generate an API key in your OpenAI dashboard
3. Create a `.env.local` file in the root of your project with the following content:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Replace `your_openai_api_key_here` with your actual OpenAI API key

Note: Make sure to keep your API key secure and never commit it to version control.

## Schema Validation

This application uses [Zod](https://github.com/colinhacks/zod) for schema validation with OpenAI's responses. The `zodResponseFormat` helper from the OpenAI SDK ensures that the API responses are properly typed and validated according to our defined schemas.

To install Zod:

```bash
npm install zod
```

The schema for the analysis result is defined in `src/app/api/analyze/route.ts` and ensures that the OpenAI API returns data in the expected format.
