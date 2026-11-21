import { ImageResponse } from 'next/og';
import { Mark } from '@/components/site/mark';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(<Mark size={180} padding={0.18} />, size);
}
