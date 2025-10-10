export const BRAND_NAME = "EdgeAIRealty";

export const NAVIGATION_ITEMS = [
  { label: "Getting Started", href: "#getting-started" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Benefits", href: "#benefits" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export const NAVIGATION_ITEMS_MOBILE = [
  { label: "Getting Started", href: "#getting-started" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Benefits", href: "#benefits" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
  { label: "Report Analytics", href: "/report-analytics" },
];

export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// Design System Constants
export const DESIGN_SYSTEM = {
  colors: {
    primary: {
      blue: "#3B82F6",
      purple: "#8B5CF6",
      pink: "#EC4899",
      red: "#EF4444",
    },
    gray: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
    },
    text: {
      primary: "#374151",
      secondary: "#6B7280",
      accent: "#3B82F6",
    },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  },
  transitions: {
    fast: "150ms ease-out",
    normal: "300ms ease-out",
    slow: "500ms ease-out",
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
  containers: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
    "7xl": "1440px",
  },
} as const;

// Animation constants
export const ANIMATIONS = {
  staggerDelay: 100,
  maxStaggerDelay: 800,
  scrollThreshold: 10, // pixels scrolled before header changes
  throttleDelay: 16, // ~60fps for scroll events
} as const;

export const SLIDER_ITEMS = [
  {
    id: "homeowners-preference",
    statistic: "73%",
    content: "of Homeowners Prefer Agents Who Use Video. Clients trust agents who show up on video. It's not just flash — it's credibility.",
    attribution: "— National Association of Realtors",
  },
  {
    id: "more-inquiries",
    statistic: "403%",
    content: "More Inquiries for Listings With Video. You'll get more calls, more clicks, and more showings — period.",
    attribution: "— PhotoUp",
  },
  {
    id: "social-engagement",
    statistic: "20 Hours",
    content: "Increase in Social Media Engagement with Video. Compared to image or text posts, video dominates on every platform.",
  },
  {
    id: "faster-sales",
    statistic: "32%",
    content: "Properties with video tours sell faster and for more money. Turn browsers into buyers with compelling video presentations.",
    attribution: "— Real Estate Analytics",
  },
  {
    id: "client-satisfaction",
    statistic: "67%",
    content: "Higher client satisfaction when agents use video. Build stronger relationships with AI-assisted personalization.",
    attribution: "— Client Satisfaction Survey",
  },
  {
    id: "roi-increase",
    statistic: "4x",
    content: "Agents using AI video see 4x return on investment. Invest in technology that pays for itself through increased sales.",
    attribution: "— Technology ROI Study",
  },
];

export const REVIEW_SLIDER_ITEMS = [
  {
    id: "review-1",
    content: "I've been using EdgeAIRealty for a few months now, and it's been a game-changer for my business. The videos are professional and engaging, and I've seen a significant increase in inquiries and showings.",
    stars: 3,
    name: "John Doe",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    id: "review-2",
    content: "I've been using EdgeAIRealty for a few months now, and it's been a game-changer for my business. The videos are professional and engaging, and I've seen a significant increase in inquiries and showings.",
    stars: 5,
    name: "Jane Doe",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80",
  },
  {
    id: "review-3",
    content: "I've been using EdgeAIRealty for a few months now, and it's been a game-changer for my business. The videos are professional and engaging, and I've seen a significant increase in inquiries and showings.",
    stars: 4,
    name: "David Doe",
    image: "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    id: "review-4",
    content: "I've been using EdgeAIRealty for a few months now, and it's been a game-changer for my business. The videos are professional and engaging, and I've seen a significant increase in inquiries and showings.",
    stars: 5,
    name: "John Smith",
    image: "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
];
