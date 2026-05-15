export const alt = "Yevora workspace overview card";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
  const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return Response.redirect(new URL("/yevora-social-card.png", siteUrl));
}
