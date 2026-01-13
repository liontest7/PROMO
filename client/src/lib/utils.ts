import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSEOConfig(pageTitle?: string) {
  const baseTitle = "Dropy - Solana Crypto Marketing Platform";
  const title = pageTitle ? `${pageTitle} | Dropy` : baseTitle;
  const description = "Dropy is a pay-per-action marketing platform built for the Solana ecosystem. Earn tokens by completing engagement tasks.";
  
  return {
    title,
    description,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://dropy.io',
      siteName: 'Dropy',
      title,
      description,
    }
  };
}
