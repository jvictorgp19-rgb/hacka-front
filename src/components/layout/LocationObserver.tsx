'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
export default function LocationObserver() {
  const pathname=usePathname(); const params=useSearchParams();
  useEffect(()=>{window.dispatchEvent(new Event('raiziq:filters'));},[pathname,params]);
  return null;
}
