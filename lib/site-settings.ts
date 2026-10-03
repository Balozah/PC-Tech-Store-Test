export const DAYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"] as const;
export type Day = (typeof DAYS)[number];

export type Hours = { day: Day; open: string; close: string; closed: boolean };

export const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
  { key: "telegram", label: "Telegram" },
  { key: "youtube", label: "YouTube" },
] as const;
