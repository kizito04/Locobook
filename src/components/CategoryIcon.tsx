import React from 'react';
import { 
  Utensils, 
  Car, 
  Zap, 
  Briefcase, 
  Film, 
  ShoppingBag, 
  HeartPulse, 
  Book, 
  CircleDollarSign 
} from 'lucide-react';

export const ICON_MAP: Record<string, any> = {
  Utensils,
  Car,
  Zap,
  Briefcase,
  Film,
  ShoppingBag,
  HeartPulse,
  Book,
  CircleDollarSign
};

export const CategoryIcon = ({ iconName, className = "w-5 h-5" }: { iconName: string, className?: string }) => {
  const Icon = ICON_MAP[iconName] || CircleDollarSign;
  return <Icon className={className} />;
};
