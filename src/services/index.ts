import type { AppGateway } from './gateway';
import { createHttpGateway } from './http/client';
let instance: AppGateway | undefined;
export async function getGateway(): Promise<AppGateway> {
  if (!instance) instance = createHttpGateway(process.env.NEXT_PUBLIC_API_URL || '');
  return instance;
}
