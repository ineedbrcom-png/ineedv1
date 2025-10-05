
import Link from "next/link";
import {
  LucideIcon,
  Car,
  Dog,
  Gamepad,
  Home as HomeIcon,
  Laptop,
  Paintbrush,
  Search,
  Shirt,
  Utensils,
  Wrench,
  Laptop2,
  GraduationCap,
  Baby,
  Box,
  Scissors,
  Dumbbell,
  Sparkles,
  ShieldAlert,
  Smartphone,
  Book,
  Sofa,
  KeyRound,
  Cog,
} from "lucide-react";
import type { CategorySummary } from "@/lib/data";

const iconMap: { [key: string]: LucideIcon } = {
  Car,
  Dog,
  Gamepad,
  HomeIcon,
  Laptop,
  Paintbrush,
  Search,
  Shirt,
  Utensils,
  Wrench,
  Laptop2,
  GraduationCap,
  Baby,
  Box,
  Scissors,
  Dumbbell,
  Sparkles,
  ShieldAlert,
  Smartphone,
  Book,
  Sofa,
  KeyRound,
  Cog,
};

interface CategoryCardProps {
  category: CategorySummary;
  colorClassName: string;
}

export function CategoryCard({ category, colorClassName }: CategoryCardProps) {
  const Icon = iconMap[category.iconName];

  return (
    <Link href={`/explore/${category.slug}`} key={category.name} className="block">
      <div
        className={`${colorClassName} p-4 rounded-lg text-center cursor-pointer transition h-full flex flex-col justify-center items-center`}
      >
        {Icon && <Icon className="mx-auto h-6 w-6 mb-2" />}
        <p className="text-sm font-medium">{category.name}</p>
      </div>
    </Link>
  );
}
