export async function POST(req: Request) {
    try {
      const { firstName, lastName, email, phone, verificationType } = await req.json();
  
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email,
        mobile_number: phone,
        verification_type: 
          verificationType === "AML" ? "aml" : verificationType === "Biometric + AML" ? "biometric_with_aml" : "biometric",
        redirect_success_url: "https://property-po-c-cwf7.vercel.app/voi/results",
        redirect_cancel_url: "https://property-po-c-cwf7.vercel.app/voi",
      };
  
      const res = await fetch("https://api.aplyid.com/identity-verifications", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`${process.env.APLYID_KEY}:${process.env.APLYID_SECRET}`)}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
  
      if (!res.ok) {
        const text = await res.text();
        return new Response(JSON.stringify({ ok: false, status: res.status, error: text }), { status: res.status });
      }
  
      const data = await res.json();
      return new Response(JSON.stringify(data), { status: 200 });
  
    } catch (err: any) {
      return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
    }
  }
  