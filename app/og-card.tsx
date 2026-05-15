export const OG_IMAGE_ALT = "Yevora workspace overview card";
export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

export const OG_IMAGE_CONTENT_TYPE = "image/png";

export function YevoraOgCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, rgba(255,252,247,1) 0%, rgba(255,248,240,1) 50%, rgba(255,255,255,1) 100%)",
        color: "#181411",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -140,
          right: -120,
          width: 420,
          height: 420,
          borderRadius: 9999,
          background: "radial-gradient(circle, rgba(245,158,11,0.24) 0%, rgba(245,158,11,0) 72%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -180,
          left: -100,
          width: 420,
          height: 420,
          borderRadius: 9999,
          background: "radial-gradient(circle, rgba(14,165,233,0.14) 0%, rgba(14,165,233,0) 74%)",
        }}
      />

      <div
        style={{
          display: "flex",
          flex: 1,
          padding: "56px 64px",
          justifyContent: "space-between",
          gap: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 680,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 24,
              color: "#7c6f63",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 56,
                height: 56,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
                color: "white",
                fontSize: 28,
                fontWeight: 700,
                boxShadow: "0 18px 36px -18px rgba(234,88,12,0.46)",
              }}
            >
              Y
            </div>
            Yevora
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                fontSize: 74,
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: "-0.04em",
              }}
            >
              A calmer way to
              <br />
              re-enter your workday
            </div>
            <div
              style={{
                display: "flex",
                width: 620,
                fontSize: 28,
                lineHeight: 1.45,
                color: "#675f55",
              }}
            >
              GitHub activity, focus sessions, notes, and weekly momentum in one composed workspace.
            </div>
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {["Today queue", "Commit-aware focus", "Searchable notes"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 18px",
                  borderRadius: 9999,
                  border: "1px solid rgba(226,217,206,1)",
                  background: "rgba(255,255,255,0.8)",
                  fontSize: 22,
                  color: "#5b544b",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 16,
            width: 320,
          }}
        >
          {[
            { label: "Focus", value: "18:42" },
            { label: "Open PRs", value: "05" },
            { label: "Streak", value: "11 days" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                borderRadius: 28,
                border: "1px solid rgba(232,223,211,1)",
                background: "rgba(255,255,255,0.86)",
                padding: "24px 24px 22px",
                boxShadow: "0 24px 70px -52px rgba(15,23,42,0.36)",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#8a7d70",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: "#181411",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
