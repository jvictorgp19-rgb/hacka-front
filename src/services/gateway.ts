import type { SimulationRules } from '@/contracts/simulation';
import type {
  AccessRequest,
  AnalysisContext,
  Answer,
  Deadline,
  DocumentVersion,
  Fact,
  Feedback,
  Finding,
  Identity,
  SavedRecord,
  UploadItem,
} from '@/contracts/models';
export interface AppGateway {
  readonly mode: 'demo' | 'api';
  reset(): void;
  simulationRules(signal?: AbortSignal): Promise<SimulationRules>;
  documents(signal?: AbortSignal): Promise<DocumentVersion[]>;
  facts(signal?: AbortSignal): Promise<Fact[]>;
  messages(persona: string, signal?: AbortSignal): Promise<Answer[]>;
  ask(query: string, context: AnalysisContext, signal?: AbortSignal): Promise<Answer>;
  deadlines(signal?: AbortSignal): Promise<Deadline[]>;
  findings(signal?: AbortSignal): Promise<Finding[]>;
  identity(signal?: AbortSignal): Promise<Identity>;
  requests(persona: string, signal?: AbortSignal): Promise<AccessRequest[]>;
  createRequest(reason: string, persona: string, owner?: string): Promise<AccessRequest>;
  decideRequest(
    id: string,
    status: 'curated' | 'denied' | 'granted',
    response: string,
    persona: string,
  ): Promise<AccessRequest>;
  records(persona: string, signal?: AbortSignal): Promise<SavedRecord[]>;
  saveRecord(record: SavedRecord): Promise<SavedRecord>;
  feedback(persona: string, signal?: AbortSignal): Promise<Feedback[]>;
  saveFeedback(item: Feedback): Promise<Feedback>;
  uploadStatus(id: string, signal?: AbortSignal): Promise<UploadItem>;
  uploads(offset?: number, signal?: AbortSignal): Promise<UploadItem[]>;
  decideUpload(id: string, status: 'aprovado' | 'recusado', response?: string): Promise<UploadItem>;
  downloadUpload(id: string): Promise<Blob>;
  upload(files: File[], signal?: AbortSignal): Promise<UploadItem[]>;
}
