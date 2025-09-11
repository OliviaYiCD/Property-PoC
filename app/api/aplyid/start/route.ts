// app/api/aplyid/start/route.ts
/**
 * Start an APLYiD verification (or return a fake link if demo mode is on).
 *
 * Env vars used:
 *  - APLYID_FAKE_START       = "true" | "false"
 *  - APLYID_BASE_URL         = "https://integration.aplyid.com"  (or https://api.aplyid.com)
 *  - APLYID_START_PATH       = "/api/v4/identity-verifications"
 *  - APLYID_API_KEY          = "<key>"
 *  - APLYID_API_SECRET       = "<secret>"
 *  - APLYID_REDIRECT_SUCCESS = "https://<your-domain>/voi/thanks"   (optional)
 *  - APLYID_REDIRECT_CANCEL  = "https://<your-domain>/voi/thanks"   (optional)
 */

type StartRequest = {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    // "link" | "sms" | "email" (defaults to "link")
    communication_method?: "link" | "sms" | "email";
    // optional AML options etc. can be added later
  };
  
  const truthy = new Set(["true", "1", "yes", "on"]);
  function isTrue(v?: string | null) {
    return v ? truthy.has(v.toLowerCase()) : false;
  }
  
  function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  export async function POST(req: Request) {
    try {
      const url = new URL(req.url);
      const body = (await req.json().catch(() => ({}))) as StartRequest;
  
      // --- Demo/fake checks (env OR ?fake=1) ---
      const fakeEnv = process.env.APLYID_FAKE_START || "";
      const useFake = isTrue(fakeEnv) || isTrue(url.searchParams.get("fake"));
      if (useFake) {
        return json({
          ok: true,
          fake: true,
          start_process_url:
            "https://example.com/demo-aplyid-start?token=DEMO-" + Date.now(),
        });
      }
  
      // --- Real call setup ---
      const BASE_URL =
        process.env.APLYID_BASE_URL?.trim() || "https://integration.aplyid.com";
      const START_PATH =
        process.env.APLYID_START_PATH?.trim() ||
        "/api/v4/identity-verifications";
  
      const API_KEY = process.env.APLYID_API_KEY || "";
      const API_SECRET = process.env.APLYID_API_SECRET || "";
  
      if (!API_KEY || !API_SECRET) {
        return json(
          {
            ok: false,
            error: "Missing APLYiD API credentials",
            hint:
              "Set APLYID_API_KEY and APLYID_API_SECRET in your environment variables.",
          },
          500
        );
      }
  
      const redirectSuccess =
        process.env.APLYID_REDIRECT_SUCCESS ||
        `${url.origin}/voi/thanks`; // safe default
      const redirectCancel =
        process.env.APLYID_REDIRECT_CANCEL || `${url.origin}/voi/thanks`;
  
      const payload = {
        // a reference you can filter by in APLYiD portal
        reference: `VOI-${Date.now()}`,
        firstname: body.firstname || "Olivia",
        lastname: body.lastname || "Yi",
        email: body.email || "you@example.com",
        phone: body.phone, // used for sms if provided
        communication_method: body.communication_method || "link",
        redirect_success_url: redirectSuccess,
        redirect_cancel_url: redirectCancel,
      };
  
      const basic = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");
      const target = `${BASE_URL}${START_PATH}`;
  
      let aplyResp: Response;
      try {
        aplyResp = await fetch(target, {
          method: "POST",
          headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        return json(
          {
            ok: false,
            error: `Network error calling APLYiD: ${(e as Error).message}`,
            status: 500,
          },
          500
        );
      }
  
      const text = await aplyResp.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        // keep raw text if not JSON
        data = { raw: text };
      }
  
      if (!aplyResp.ok) {
        return json(
          {
            ok: false,
            error: "APLYiD error",
            status: aplyResp.status,
            url: target,
            data,
            bodyText: typeof data === "object" ? undefined : text,
            hint:
              aplyResp.status === 403
                ? "Forbidden. Check IP allow-list, tenant API permissions, host/path, or auth format."
                : aplyResp.status === 422
                ? "Validation error. Check redirect domains, phone/email format, or required fields."
                : "See 'data' / 'bodyText' for details.",
          },
          aplyResp.status
        );
      }
  
      // APLYiD generally returns a URL for the user to start/continue the process.
      // Different endpoints may name it differently; try the common keys:
      const startUrl =
        data?.start_process_url ||
        data?.url ||
        data?.link ||
        data?.startUrl ||
        null;
  
      return json({
        ok: true,
        fake: false,
        start_process_url: startUrl,
        aplyid: data,
      });
    } catch (err) {
      return json(
        {
          ok: false,
          error: (err as Error).message || "Unexpected error",
        },
        500
      );
    }
  }
  
  // (Optional) If you want to support CORS for external tools/tests:
  // export async function OPTIONS() {
  //   return new Response(null, {
  //     status: 204,
  //     headers: {
  //       "Access-Control-Allow-Origin": "*",
  //       "Access-Control-Allow-Methods": "POST,OPTIONS",
  //       "Access-Control-Allow-Headers": "Content-Type,Authorization",
  //     },
  //   });
  // }
  