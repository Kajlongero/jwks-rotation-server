export class JobsVault {
  static instance: JobsVault;

  private constructor() {
    if (JobsVault.instance) return JobsVault.instance;

    return this;
  }

  static getInstance() {
    if (!JobsVault.instance) JobsVault.instance = new JobsVault();

    return JobsVault.instance;
  }

  async schedule() {}

  async start() {
    while (true) {}
  }
}
