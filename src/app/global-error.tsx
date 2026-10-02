"use client";

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en-IN">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#f6efe4",
          color: "#2a2420",
          padding: "4rem 1.5rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "2rem" }}>Sorry, something went wrong</h1>
        <p>Please try again, or order on WhatsApp at +91 95555 48126.</p>
        <p style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.5rem" }}>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              padding: "0.7rem 1.4rem",
              borderRadius: 999,
              border: 0,
              background: "#7a1f2b",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            Try again
          </button>
          <a
            href="https://wa.me/919555548126"
            style={{
              padding: "0.7rem 1.4rem",
              borderRadius: 999,
              background: "#15803d",
              color: "#fff",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            WhatsApp
          </a>
        </p>
      </body>
    </html>
  );
}
