/** Request and response interface. */
export interface RequestResponse {
	/** Request attribute. */
	req: Record<string, unknown>;
	/** Response attribute. */
	res: Record<string, unknown>;
}
