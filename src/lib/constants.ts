import { Info, MessageCircle, Shield, Settings, HelpCircle, Play, Layers, UserCheck, Headphones, DollarSign, RefreshCw, Download, Edit, FileText, Video, Smartphone } from 'lucide-react';

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
  { label: "Schedule Post", href: "/scheduled-post" },
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
  // {
  //   id: "more-inquiries",
  //   statistic: "403%",
  //   content: "More Inquiries for Listings With Video. You'll get more calls, more clicks, and more showings — period.",
  //   attribution: "— PhotoUp",
  // },
  {
    id: "social-engagement",
    statistic: "20 Hours",
    content: "Increase in Social Media Engagement with Video. Compared to image or text posts, video dominates on every platform.",
  },
  // {
  //   id: "faster-sales",
  //   statistic: "32%",
  //   content: "Properties with video tours sell faster and for more money. Turn browsers into buyers with compelling video presentations.",
  //   attribution: "— Real Estate Analytics",
  // },
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


export const FAQ_DATA = {
  'Series & Videos': [
    {
      id: 'what-is-edge-ai-realty',
      question: 'What is Edge Ai Realty?',
      answer: 'Edge Ai Realty is a cutting-edge platform that empowers real estate professionals to create high-quality, customized Ai-generated videos for property listings, market updates, and personal branding. Our goal is to streamline your marketing efforts, saving you time and enhancing your online presence.',
      icon: Info
    },
    {
      id: 'subscription-plan-differences',
      question: 'What are the differences between the subscription plans?',
      answer: 'Our plan is priced at $997/month and includes 30 videos per month, unlimited photo avatars, unlimited video avatars, and unlimited custom voices. This comprehensive plan is designed to meet all your content creation needs with complete flexibility.',
      icon: Layers
    },
    {
      id: 'multiple-avatars-availability',
      question: 'Can I use multiple avatars in my videos?',
      answer: 'Yes, our plan includes unlimited photo avatars and unlimited video avatars, giving you complete flexibility to create multiple avatars for your content.',
      icon: UserCheck
    },
    {
      id: 'quarterly-strategy-session',
      question: 'What is included in the quarterly strategy session?',
      answer: 'The quarterly strategy session is a 30-minute call with our team to discuss your marketing goals, review past video performance, and plan future content strategies. Please contact our support team for more information about strategy session availability.',
      icon: MessageCircle
    },
    {
      id: 'how-to-get-started',
      question: 'How do I get started?',
      answer: 'Choose the plan that best fits your needs and complete the sign-up process on our website. You\'ll then go through our onboarding process to set up your avatar and provide information for your first video.',
      icon: Play
    },
    {
      id: 'need-more-videos',
      question: 'What if I need more videos than my plan offers?',
      answer: 'If you require additional videos beyond your plan\'s allocation, please contact our sales team to discuss custom solutions or upgrading to a higher-tier plan.',
      icon: Video
    },
    {
      id: 'contract-cancellation-policy',
      question: 'Is there a contract or can I cancel anytime?',
      answer: 'Our plan is a monthly subscription with no long-term contracts. You can cancel anytime before your next billing cycle.',
      icon: RefreshCw
    },
    {
      id: 'support-options',
      question: 'What kind of support do you offer?',
      answer: 'We offer priority email support with responses within 24 hours. Our support team is dedicated to helping you get the most out of your subscription and resolve any issues quickly.',
      icon: Headphones
    },
    {
      id: 'plan-upgrade-downgrade',
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes, you can change your subscription plan at any time through your account settings or by contacting our support team. Changes will take effect in the next billing cycle.',
      icon: Settings
    },
  ],
  'Billing': [
    {
      id: 'manage-subscription',
      question: 'How do I manage my subscription?',
      answer: 'You can update or cancel your plan anytime from your account dashboard or by emailing our support team.',
      icon: Settings
    },
    {
      id: 'when-am-i-billed',
      question: 'When am I billed?',
      answer: 'All subscriptions are billed monthly on the date of your original sign-up.',
      icon: DollarSign
    },
    {
      id: 'cancel-anytime',
      question: 'Can I cancel anytime?',
      answer: 'Yes. You\'ll retain access to your plan until the end of your billing period — no penalties or surprise fees.',
      icon: Shield
    },
  ],
  'Account': [
    {
      id: 'access-my-videos',
      question: 'How do I access my videos?',
      answer: 'Once your videos are ready, you\'ll get an email notification with a download link and social-ready formats.',
      icon: Download
    },
    {
      id: 'update-avatar-branding',
      question: 'Can I update my avatar or branding later?',
      answer: 'Yes — you can request changes anytime. With unlimited avatars and voices, you have full flexibility to update your avatar or branding as needed.',
      icon: Edit
    },
  ],
  'Technical': [
    {
      id: 'video-file-issues',
      question: 'What if I have issues with my video or files?',
      answer: 'Just email us — we\'ll resolve most issues within 24 hours.',
      icon: HelpCircle
    },
    {
      id: 'special-software-needed',
      question: 'Do I need special software to use the videos?',
      answer: 'Nope. All videos are delivered in standard MP4 formats, ready for upload to Instagram, YouTube, TikTok, and more.',
      icon: Smartphone
    },
    {
      id: 'preview-scripts-changes',
      question: 'Can I preview scripts or request changes?',
      answer: 'Yes. Our plan includes script customization with optimization and review built-in.',
      icon: FileText
    },
  ]
};