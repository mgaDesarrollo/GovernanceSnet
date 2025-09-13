import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { config } from "./config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatToDollar = (value: number) => {
  const formatToDollar = value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  return formatToDollar;
}

export function getAgixFromDollars(dollarValue: number) {
  const agixPrice = config.agix.price;
  if (agixPrice === 0) {
    return 0;
  }
  return (dollarValue / agixPrice).toFixed(2);
}