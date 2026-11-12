import type { AccessRequest, AnalysisContext, Answer, Deadline, DocumentVersion, Fact, Feedback, Finding, Identity, SavedRecord, UploadItem } from '@/contracts/models';
export interface AppGateway {
  readonly mode: 'demo' | 'api';
  documents(signal?: AbortSignal): Promise<DocumentVersion[]>;
  facts(signal?: AbortSignal): Promise<Fact[]>;
  ask(query: string, context: AnalysisContext, signal?: AbortSignal): Promise<Answer>;
  deadlines(signal?: AbortSignal): Promise<Deadline[]>;
  findings(signal?: AbortSignal): Promise<Finding[]>;
  identity(signal?: AbortSignal): Promise<Identity>;
  requests(persona: string, signal?: AbortSignal): Promise<AccessRequest[]>;
  createRequest(reason: string, persona: string): Promise<AccessRequest>;
  decideRequest(id: string, status: 'curated' | 'denied' | 'granted', response: string, persona: string): Promise<AccessRequest>;
  records(persona: string, signal?: AbortSignal): Promise<SavedRecord[]>;
  saveRecord(record: SavedRecord): Promise<SavedRecord>;
  feedback(persona: string, signal?: AbortSignal): Promise<Feedback[]>;
  saveFeedback(item: Feedback): Promise<Feedback>;
  upload(files: File[], signal?: AbortSignal): Promise<UploadItem[]>;
  reset(): void;
}
