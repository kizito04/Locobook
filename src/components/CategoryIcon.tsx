import React from 'react';
import { 
  Utensils, Car, Zap, Briefcase, Film, ShoppingBag, HeartPulse, Book, CircleDollarSign,
  Receipt, ShoppingCart, Shapes, Home, Dumbbell, Plane, MoreHorizontal,
  Coffee, Music, Globe, Heart, Monitor, Phone, Camera, Gift, 
  MapPin, Anchor, Award, Activity, Box, Compass, Cpu, 
  CreditCard, Droplet, Feather, Flag, Gamepad2, GraduationCap, 
  Headphones, Key, Laptop, Lightbulb, Map, Mic, Moon, 
  Package, PenTool, PieChart, Printer, Radio, Scissors, 
  Shield, Smartphone, Star, Sun, Target, Ticket, Trash2, 
  TrendingUp, Truck, Tv, Umbrella, Video, Watch, Wifi,
  Smile, Frown, Meh, Eye, User, Users, Baby, Hand, 
  ThumbsUp, ThumbsDown, HeartCrack, Info, AlertCircle, 
  CheckCircle, XCircle, HelpCircle, Bell, Calendar, Clock, 
  Cloud, CloudRain, CloudSnow, Wind, Battery, BatteryCharging, 
  Bluetooth, Cast, Crosshair, Database, Hash, Image as ImageIcon, 
  Link, Lock, Unlock, Mail, MessageSquare, MessageCircle, 
  Navigation, Paperclip, Send, Share, Share2, Tag, 
  Terminal, UserPlus, UserMinus, VideoOff, Volume2, VolumeX, 
  ZoomIn, ZoomOut
} from 'lucide-react';

export const ICON_MAP: Record<string, any> = {
  Utensils, Car, Zap, Briefcase, Film, ShoppingBag, HeartPulse, Book, CircleDollarSign,
  Receipt, ShoppingCart, Shapes, Home, Dumbbell, Plane, MoreHorizontal,
  Coffee, Music, Globe, Heart, Monitor, Phone, Camera, Gift, 
  MapPin, Anchor, Award, Activity, Box, Compass, Cpu, 
  CreditCard, Droplet, Feather, Flag, Gamepad2, GraduationCap, 
  Headphones, Key, Laptop, Lightbulb, Map, Mic, Moon, 
  Package, PenTool, PieChart, Printer, Radio, Scissors, 
  Shield, Smartphone, Star, Sun, Target, Ticket, Trash2, 
  TrendingUp, Truck, Tv, Umbrella, Video, Watch, Wifi,
  Smile, Frown, Meh, Eye, User, Users, Baby, Hand, 
  ThumbsUp, ThumbsDown, HeartCrack, Info, AlertCircle, 
  CheckCircle, XCircle, HelpCircle, Bell, Calendar, Clock, 
  Cloud, CloudRain, CloudSnow, Wind, Battery, BatteryCharging, 
  Bluetooth, Cast, Crosshair, Database, Hash, ImageIcon, 
  Link, Lock, Unlock, Mail, MessageSquare, MessageCircle, 
  Navigation, Paperclip, Send, Share, Share2, Tag, 
  Terminal, UserPlus, UserMinus, VideoOff, Volume2, VolumeX, 
  ZoomIn, ZoomOut
};

export const CategoryIcon = ({ iconName, className = "w-5 h-5" }: { iconName: string, className?: string }) => {
  const Icon = ICON_MAP[iconName] || CircleDollarSign;
  return <Icon className={className} />;
};
