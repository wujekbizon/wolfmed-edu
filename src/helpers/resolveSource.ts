export const resolveSrc = (m: any) => {
  const url = m.fileUrl ?? m.url;
  if (typeof url === "string") {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return url.startsWith("/") ? url : `/${url}`;
  }
  if (m.key) return `/uploads/${m.key}`;
  if (m.title) return `/${m.title}`;
  return "";
};
