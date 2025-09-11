// app/api/diag/route.ts
export async function GET() {
    const fake = process.env.APLYID_FAKE_START || "";
    const vercelEnv = process.env.VERCEL_ENV || "";
    const sha = process.env.VERCEL_GIT_COMMIT_SHA || "";
  
    return new Response(
      JSON.stringify({ APLYID_FAKE_START: fake, vercelEnv, sha }, null, 2),
      { headers: { "Content-Type": "application/json" } }
    );
  }
  