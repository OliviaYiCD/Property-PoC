// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // run everywhere except Next internals, static assets, and your public webhooks
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:png|jpg|jpeg|svg|gif|ico)|api/aplyid/webhook).*)",
  ],
};

// optional: prove it’s running
console.log("[Clerk] middleware active");