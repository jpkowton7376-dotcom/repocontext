// Server component — reads process.env at request time so it reflects the
// live deployment's environment, not the build-time snapshot.
export const dynamic = "force-dynamic";

type Row = {
  key: string;
  required: "required" | "recommended" | "optional";
};

const ROWS: Row[] = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", required: "required" },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: "required" },
  { key: "SUPABASE_SERVICE_ROLE_KEY", required: "required" },
  { key: "NEXT_PUBLIC_SITE_URL", required: "recommended" },
  { key: "OPENAI_API_KEY", required: "recommended" },
  { key: "GITHUB_TOKEN", required: "optional" },
  { key: "RESEND_API_KEY", required: "optional" },
  { key: "CREEM_API_KEY", required: "optional" },
  { key: "SENTRY_DSN", required: "optional" },
];

function mask(value: string): string {
  if (value.length <= 10) return "•".repeat(value.length);
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export default function StartupCheckPage() {
  const rows = ROWS.map((row) => {
    const value = process.env[row.key];
    const present = Boolean(value && value.trim().length > 0);
    return { ...row, present, preview: present ? mask(value as string) : "" };
  });

  const requiredMissing = rows.filter(
    (r) => r.required === "required" && !r.present
  );
  const recommendedMissing = rows.filter(
    (r) => r.required === "recommended" && !r.present
  );

  const allOk = requiredMissing.length === 0;

  const statusColor = (present: boolean, kind: Row["required"]) =>
    present ? "#1f9d55" : kind === "optional" ? "#8b95a8" : "#e0594b";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f8fb",
        color: "#1a2230",
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        padding: "64px 24px",
      }}
    >
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <p
          style={{
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#64707f",
            margin: "0 0 8px",
          }}
        >
          Startup self-check
        </p>
        <h1
          style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "32px",
            fontWeight: 300,
            margin: "0 0 8px",
          }}
        >
          Environment variables
        </h1>
        <p style={{ fontSize: "14px", color: "#64707f", margin: "0 0 28px" }}>
          Verifies the Supabase (and related) environment variables required by
          the running deployment. Refreshes on each load.
        </p>

        <div
          style={{
            padding: "16px 20px",
            borderRadius: "10px",
            marginBottom: "24px",
            fontSize: "14px",
            fontWeight: 600,
            background: allOk ? "rgba(31,157,85,0.1)" : "rgba(224,89,75,0.1)",
            color: allOk ? "#1f9d55" : "#e0594b",
            border: `1px solid ${allOk ? "rgba(31,157,85,0.35)" : "rgba(224,89,75,0.35)"}`,
          }}
        >
          {allOk
            ? "✓ All required variables are set."
            : `✗ ${requiredMissing.length} required variable(s) missing: ${requiredMissing
                .map((r) => r.key)
                .join(", ")}`}
          {allOk && recommendedMissing.length > 0 && (
            <span style={{ fontWeight: 400, color: "#64707f" }}>
              {" "}
              ({recommendedMissing.length} recommended not set — features degrade gracefully)
            </span>
          )}
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {rows.map((r, i) => (
            <div
              key={r.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                padding: "14px 20px",
                borderTop: i === 0 ? "none" : "1px solid #eef2f7",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {r.key}
                </div>
                <div style={{ fontSize: "11px", color: "#8b95a8", marginTop: "2px" }}>
                  {r.required === "required"
                    ? "Required"
                    : r.required === "recommended"
                    ? "Recommended"
                    : "Optional"}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "12px",
                    color: "#64707f",
                  }}
                >
                  {r.present ? r.preview : "— not set —"}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: statusColor(r.present, r.required),
                    background: `${statusColor(r.present, r.required)}1a`,
                    padding: "3px 10px",
                    borderRadius: "999px",
                  }}
                >
                  {r.present ? "SET" : "MISSING"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "12px", color: "#8b95a8", marginTop: "20px", lineHeight: 1.6 }}>
          Values are masked (first 6 + last 4 characters) and never leave the
          server. Set missing variables in your Vercel project settings →
          Environment Variables, then redeploy.
        </p>
      </div>
    </main>
  );
}
