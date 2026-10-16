/**
 * Small internal id generator.
 *
 * Replaces the `uuid` dependency (uuid v9 had a security advisory and pulled a
 * runtime dependency into a library that only needs a unique string).
 * The ids are used for the dialog container element and for the internal
 * "which dialog is on top" bookkeeping only - they are never used for security
 * decisions, so `Math.random()` + a counter is enough.
 */
let counter = 0;

export function createId(): string {
    counter += 1;
    const random = Math.random().toString(36).slice(2, 10);
    return `bsr-m-dialog-${Date.now().toString(36)}-${counter.toString(36)}-${random}`;
}
