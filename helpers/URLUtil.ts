export const GetImageUrl = (imgName: string): string => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7015/api";
  return `${API_BASE_URL}/files/image?uploadType=1&fileName=${imgName}`;
};
