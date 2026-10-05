export class DeletionBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeletionBlockedError";
  }
}
