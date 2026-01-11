import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSEOConfig(pageTitle?: string) {
  const baseTitle = "MemeDrop - Solana Crypto Marketing Platform";
  const title = pageTitle ? `${pageTitle} | MemeDrop` : baseTitle;
  const description = "MemeDrop is a pay-per-action marketing platform built for the Solana ecosystem. Earn tokens by completing engagement tasks.";
  
  return {
    title,
    description,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://memedrop.io',
      siteName: 'MemeDrop',
      title,
      description,
    }
  };
}
