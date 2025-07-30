export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
	[K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
	T extends { [key: string]: unknown },
	K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
	| T
	| {
			[P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
	  };
/** All built-in and custom scalars, mapped to their actual values. */
export type Scalars = {
	ID: { input: string; output: string };
	String: { input: string; output: string };
	Boolean: { input: boolean; output: boolean };
	Int: { input: number; output: number };
	Float: { input: number; output: number };
	/** DateTime custom scalar type. */
	DateTime: { input: any; output: any };
};

export type gqlCacheControlScope = 'PRIVATE' | 'PUBLIC';

export type gqlPaginatedUser = {
	__typename?: 'PaginatedUser';
	currentPage: Scalars['Float']['output'];
	entities: Array<gqlUser>;
	hasNext: Scalars['Boolean']['output'];
	hasPrevious: Scalars['Boolean']['output'];
	pageSize: Scalars['Float']['output'];
	total: Scalars['Float']['output'];
	totalPages: Scalars['Float']['output'];
};

export type gqlPaging = {
	index?: Scalars['Float']['input'];
	take?: Scalars['Float']['input'];
};

export type gqlQuery = {
	__typename?: 'Query';
	getUsers: gqlPaginatedUser;
	me: gqlUser;
};

export type gqlQueryGetUsersArgs = {
	input: gqlUserFind;
	page?: InputMaybe<gqlPaging>;
};

export type gqlUser = {
	__typename?: 'User';
	role: gqlUserRole;
};

export type gqlUserFind = {
	avatarPath?: InputMaybe<Scalars['String']['input']>;
	email?: InputMaybe<Scalars['String']['input']>;
	id?: InputMaybe<Scalars['String']['input']>;
	name?: InputMaybe<Scalars['String']['input']>;
	phone?: InputMaybe<Scalars['String']['input']>;
	role?: InputMaybe<Scalars['String']['input']>;
};

export type gqlUserRole = 'admin' | 'guest' | 'undefined';

export type gqlGetUsersQueryVariables = Exact<{
	input: gqlUserFind;
	page?: InputMaybe<gqlPaging>;
}>;

export type gqlGetUsersQuery = {
	__typename?: 'Query';
	getUsers: {
		__typename?: 'PaginatedUser';
		currentPage: number;
		hasNext: boolean;
		hasPrevious: boolean;
		pageSize: number;
		total: number;
		totalPages: number;
		entities: Array<{ __typename?: 'User'; role: gqlUserRole }>;
	};
};

export type gqlMeQueryVariables = Exact<{ [key: string]: never }>;

export type gqlMeQuery = {
	__typename?: 'Query';
	me: { __typename?: 'User'; role: gqlUserRole };
};
