export interface CreateJobInput {
  ttl: number;
  type: string;
  version: number;
  nextRunAt: Date;
}
