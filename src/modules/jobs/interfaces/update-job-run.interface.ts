export interface UpdateJobRunInput {
  id: string;
  counter: number;
  version: number;
  nextRunAt: Date;
}
