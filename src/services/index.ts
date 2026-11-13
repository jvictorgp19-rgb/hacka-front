import { ApiError } from '@/contracts/models';
import type { AppGateway } from './gateway';
import { createHttpGateway } from './http/client';
let instance: AppGateway | undefined;
export async function getGateway(): Promise<AppGateway> {
  if (instance) return instance;
  const mode = process.env.NEXT_PUBLIC_DATA_MODE || 'demo';
  if (mode === 'demo') instance = (await import('./demo/provider')).createDemoGateway();
  else if (mode === 'api') instance = createHttpGateway(process.env.NEXT_PUBLIC_API_URL || '');
  else throw new ApiError('CONFIG', 'Modo de dados inválido. Use demo ou api.');
  return instance;
}
