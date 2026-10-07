/**
 * Return an independent copy of the source HTTP/runtime/rejection examples.
 * @returns {{status: string, http: unknown[], runtime: unknown[], mustReject: unknown[]}} Source fixture groups.
 * Values are format examples, not simulated permissions or database outcomes; caller changes do not affect later reads.
 */
export declare function getFixtures(): { status: string; http: unknown[]; runtime: unknown[]; mustReject: unknown[] };
