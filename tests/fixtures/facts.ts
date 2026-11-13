import { factSchema } from '@/contracts/models';
import evidence from './evidence.json';

// Evidências curadas (sintéticas) usadas só nos testes.
export const facts = evidence.map((f) => factSchema.parse(f));
