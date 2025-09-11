export default function ThanksPage() {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 16px", textAlign: "center" }}>
        <h1>Thanks!</h1>
        <p style={{ marginTop: 8 }}>
          Your identity check has been started. You’ll receive an update shortly.
        </p>
  
        <div style={{ marginTop: 24 }}>
          <a
            href="/voi/results"
            style={{
              display: "inline-block",
              padding: "12px 18px",
              borderRadius: 10,
              background: "#cc3369",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            View Status / Reports
          </a>
        </div>
  
        <p style={{ marginTop: 16 }}>
          Or <a href="/voi">start another check</a>.
        </p>
      </main>
    );
  }
  