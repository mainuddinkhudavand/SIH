/**
 * Safely constructs full backend URL for image paths,
 * accounting for REACT_APP_BACKEND_URL, REACT_APP_API_URL,
 * leading slashes, and stripping accidental /api suffixes.
 */
export const getMediaUrl = (path) => {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  let base =
    process.env.REACT_APP_BACKEND_URL ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:5000";

  // Remove trailing /api or /api/ if present
  base = base.replace(/\/api\/?$/, "").replace(/\/$/, "");

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
};
