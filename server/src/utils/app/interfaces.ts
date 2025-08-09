/** Request and response interface. */
export interface RequestResponse {
	/** Request attribute. */
	req: Record<string, unknown>;
	/** Response attribute. */
	res: Record<string, unknown>;
}

/**
 * Paginate result interface.
 *
 * @template T
 */
export interface IPaginateResult<T> {
	/** Found entities. */
	entities: T[];
	/** Number of entities found. */
	total: number;
	/** Current page index. */
	currentPage: number;
	/** Total pages number. */
	totalPages: number;
	/** Page size number. */
	pageSize: number;
	/** If it has next page. */
	hasNext: boolean;
	/** If it has previous page. */
	hasPrevious: boolean;
}

/** Files form interface. */
export interface IFilesForm {
	[k: string]: {
		/** File field. */ fieldName: string;
		/** File content. */ content: string;
	};
}
