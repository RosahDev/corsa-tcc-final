import { DeletionBlockedError } from "@/lib/errors/deletion";

export type DeleteActionState = { error?: string };

export function toDeleteActionState(error: unknown): DeleteActionState {
  if (error instanceof DeletionBlockedError) {
    return { error: error.message };
  }
  throw error;
}
