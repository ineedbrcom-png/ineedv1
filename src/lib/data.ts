import type { LucideIcon } from "lucide-react";
import {
  Home,
  Paintbrush,
  Code,
  GraduationCap,
  HeartPulse,
  Wrench,
  Camera,
  Briefcase,
  PenTool,
} from "lucide-react";

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  subcategories: string[];
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  budget: number;
  location: string;
  category: Category;
  author: {
    name: string;
    avatarId: string;
  };
  imageId: string;
}

export const categories: Category[] = [
  {
    id: "home-services",
    name: "Home Services",
    icon: Home,
    subcategories: ["Plumbing", "Cleaning", "Electrical"],
  },
  {
    id: "creative",
    name: "Creative",
    icon: Paintbrush,
    subcategories: ["Graphic Design", "Writing", "Video Editing"],
  },
  {
    id: "tech",
    name: "Tech",
    icon: Code,
    subcategories: ["Web Development", "Mobile Apps", "IT Support"],
  },
  {
    id: "education",
    name: "Education",
    icon: GraduationCap,
    subcategories: ["Tutoring", "Music Lessons", "Language"],
  },
  {
    id: "health",
    name: "Health & Wellness",
    icon: HeartPulse,
    subcategories: ["Personal Training", "Yoga", "Nutrition"],
  },
  {
    id: "repairs",
    name: "Repairs",
    icon: Wrench,
    subcategories: ["Auto", "Electronics", "Appliances"],
  },
  {
    id: "events",
    name: "Events",
    icon: Camera,
    subcategories: ["Photography", "Planning", "Catering"],
  },
  {
    id: "business",
    name: "Business",
    icon: Briefcase,
    subcategories: ["Consulting", "Accounting", "Legal"],
  },
];

export const listings: Listing[] = [
  {
    id: "1",
    title: "Need a modern logo for my new coffee shop",
    description:
      "Looking for a talented graphic designer to create a minimalist and modern logo for a specialty coffee shop. The brand is focused on sustainability and high-quality, ethically sourced beans. Should be versatile for use on cups, signage, and social media.",
    budget: 500,
    location: "Brooklyn, NY",
    category: categories[1],
    author: { name: "Alice", avatarId: "avatar-2" },
    imageId: "listing-1",
  },
  {
    id: "2",
    title: "Help with weekly garden maintenance",
    description:
      "My backyard garden is getting out of hand. I need someone to come once a week for weeding, pruning, and general upkeep. The garden is approximately 500 sq ft and has a mix of flowers and vegetables. All tools will be provided.",
    budget: 75,
    location: "Austin, TX",
    category: categories[0],
    author: { name: "Bob", avatarId: "avatar-3" },
    imageId: "listing-2",
  },
  {
    id: "3",
    title: "Build a responsive landing page for my SaaS product",
    description:
      "Seeking an experienced web developer to build a single-page landing site for a new software product. I have the Figma designs ready. Must be built with Next.js and Tailwind CSS, and be fully responsive. Fast turnaround needed.",
    budget: 1200,
    location: "Remote",
    category: categories[2],
    author: { name: "Charlie", avatarId: "avatar-4" },
    imageId: "listing-3",
  },
  {
    id: "4",
    title: "Private Spanish tutoring for beginner",
    description:
      "I want to learn Spanish for an upcoming trip to Spain. Looking for a tutor for 2-3 sessions per week. I'm a complete beginner, so patience is a must! Prefer in-person sessions if possible, but open to virtual.",
    budget: 40,
    location: "Miami, FL",
    category: categories[3],
    author: { name: "Diana", avatarId: "avatar-5" },
    imageId: "listing-4",
  },
];

export const popularTags = [
  "urgent",
  "remote",
  "beginner-friendly",
  "logo-design",
  "react",
  "full-time",
  "part-time",
];

export const currentUser = {
  name: "Emily Carter",
  email: "emily.carter@example.com",
  avatarId: "avatar-1",
  joinDate: "2023-05-15",
  skills: ["Product Management", "UX/UI Design", "Market Research"],
  about: "I'm a product manager passionate about creating user-centric digital experiences. In my free time, I'm often looking for creative professionals to collaborate on side projects.",
  isEmailVerified: true,
  isPhoneVerified: true,
  isDocumentVerified: false,
};
