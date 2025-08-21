import React from 'react';
import { Facebook, Youtube, Instagram, Linkedin, Image, Palette, Zap, Video, FileText, Mic, Baby, Package, Film } from 'lucide-react';

const iconMap = {
  facebook: Facebook,
  youtube: Youtube,
  instagram: Instagram,
  linkedin: Linkedin,
  pinterest: Image,
  palette: Palette,
  zap: Zap,
  video: Video,
  filetext: FileText,
  mic: Mic,
  baby: Baby,
  package: Package,
  default: Film,
};

export const getIconComponent = (iconName, className = "") => {
  const name = typeof iconName === 'string' ? iconName.toLowerCase() : 'default';
  const IconComponent = iconMap[name] || iconMap.default;
  return <IconComponent className={className} />;
};