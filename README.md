
# KNWN Food | Premium Ghost Kitchen SPA

A high-performance, editorial-style single page application for a premium ghost kitchen. Built with React, TypeScript, Vite, and Framer Motion.

## Features
- **Tomorrow Menu System**: Automatically calculates and displays the menu for the next business day (Mon-Fri) based on a 3:00 PM ET cutoff.
- **One-Minute Checkout**: Streamlined, conversion-focused ordering flow.
- **Premium UI/UX**: Apple-inspired motion design, smooth scrolling, and a refined neutral color palette.
- **Serverless Backend**: Orders are processed via a Vercel serverless function and sent to the merchant's Gmail inbox.

## Environment Variables
To enable order emails, set the following variables in your Vercel project settings:

- `ORDER_RECEIVER_EMAIL`: The email address where orders should be sent.
- `GMAIL_USER`: The Gmail account used to send the emails.
- `GMAIL_APP_PASSWORD`: A Gmail App Password (NOT your regular password). [How to create one](https://support.google.com/accounts/answer/185833).

## Menu Configuration
Edit `src/data/menus.ts` to update the rotating menu items. The application automatically maps `monday` through `friday` keys to the correct service dates.

## Deployment
This project is pre-configured for Vercel deployment with a `vercel.json` file.
1. Push to GitHub.
2. Connect to Vercel.
3. Add Environment Variables.
4. Deploy.

## Local Development
```bash
npm install
npm run dev
```
