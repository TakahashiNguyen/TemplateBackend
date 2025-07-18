/** Interfaces for GraphQL cache control options. */
export interface CacheControlOptions {
	/** The maximum age in seconds for the cache. */
	maxAge?: number;

	/** The scope of the cache, either 'PRIVATE' or 'PUBLIC'. */
	scope?: 'PRIVATE' | 'PUBLIC';

	/**
	 * Whether to inherit the max age from parent fields. If true, the max age
	 * will be inherited from the parent field's cache control settings. If false,
	 * the max age will be set explicitly for this field.
	 */
	inheritMaxAge?: boolean;
}
