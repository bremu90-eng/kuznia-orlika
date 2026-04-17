import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency', currency: 'PLN',
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'd MMMM yyyy', { locale: pl })
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'd MMMM yyyy, HH:mm', { locale: pl })
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm', { locale: pl })
}

export function formatDayOfWeek(date: string | Date): string {
  return format(new Date(date), 'EEEE, d MMMM', { locale: pl })
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: pl })
}

export function calculateDepositAmount(price: number, policy: 'full_100' | 'partial_25'): number {
  return policy === 'full_100' ? price : Math.ceil(price * 0.25 * 100) / 100
}

export function hoursUntilDate(date: string | Date): number {
  return (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60)
}
