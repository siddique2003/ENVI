'use client'

import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface NavButtonProps {
  href: string;
  icon: LucideIcon;
  label: string;
  className?: string;
  showLabelOnMobile?: boolean;
}

export function NavButton({ 
  href, 
  icon: Icon, 
  label, 
  className = "",
  showLabelOnMobile = false 
}: NavButtonProps) {
  return (
    <Link href={href}>
      <Button 
        variant="outline" 
        className={`bg-white/80 dark:bg-black/80 backdrop-blur-sm border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-800 dark:text-white transition-colors ${className}`}
      >
        <Icon className="w-4 h-4" />
        <span className={`ml-2 ${!showLabelOnMobile ? 'hidden sm:inline' : ''}`}>
          {label}
        </span>
      </Button>
    </Link>
  );
}