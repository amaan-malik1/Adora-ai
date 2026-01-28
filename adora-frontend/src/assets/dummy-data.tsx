import { UploadIcon, VideoIcon, ZapIcon } from "lucide-react";

export const featuresData = [
  {
    icon: <UploadIcon className="w-6 h-6" />,
    title: "Smart upload",
    desc: "Drag and drop your assets. We auto-optimize formats and sizes for best performance.",
  },
  {
    icon: <ZapIcon className="w-6 h-6" />,
    title: "Instant Generation",
    desc: "Optimized model deliver output in seconds with great fidelity.",
  },
  {
    icon: <VideoIcon className="w-6 h-6" />,
    title: "Video Synthesis",
    desc: "Brings products shoot to life with short-form, social-ready videos.",
  },
];

export const plansData = [
  {
    id: "starter",
    name: "Starter",
    price: "$10",
    desc: "Try the platform at not cost.",
    credits: 25,
    features: [
      "25 credits",
      "Standard quality",
      "No watermark",
      "Slower generation speed",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    desc: "Creators and small teams.",
    credits: 80,
    features: [
      "80 credits",
      "HD quality",
      "No watermark",
      "video generation",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "ultra",
    name: "Ultra",
    price: "$99",
    desc: "Scale scross teams and agencies.",
    credits: 300,
    features: [
      "300 credits",
      "FHD quality",
      "No watermark",
      "Fast generation speed",
      "Chat + Email support",
    ],
  },
];

export const faqData = [
  {
    question: "How does the AI generate work?",
    answer:
      "We leverage state-of-the-art-diffusion models trained on milliosn of the product images to blend your product into realistic scenes while preserving details, lightning and reflections.",
  },
  {
    question: "Do I own the generated images?",
    answer:
      "Yes - you receive full commercial rights to any images or videos generated on the platform. Use them for your marketing, ads, social media or e-commerce listings without any restrictions.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel anytime from your dashboard. You will retain access through the end of your billing cycle.",
  },
  {
    question: "What input formats do you support?",
    answer:
      "We accept JPG, PNG, and WEBP formats. Output are high-resolution in PNG and MP4 optimized for social platforms.",
  },
];

export const footerLinks = [
  {
    title: "Quick Links",
    links: [
      { name: "Home", url: "#" },
      { name: "Features", url: "#" },
      { name: "Pricing", url: "#" },
      { name: "FAQs", url: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", url: "#" },
      { name: "Terms of Service", url: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { name: "Twitter", url: "https://x.com/amaaan_malik/" },
      { name: "LinkedIn", url: "https://linkedin.com/in/amaan-malik1" },
      { name: "GitHub", url: "https://github.com/amaan-malik1" },
    ],
  },
];
