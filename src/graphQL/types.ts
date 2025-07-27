import gql from 'graphql-tag';

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

export const GetUsers_gql = gql`
	query getUsers($input: UserFind!, $page: Paging) {
		getUsers(input: $input, page: $page) {
			currentPage
			entities {
				role
			}
			hasNext
			hasPrevious
			pageSize
			total
			totalPages
		}
	}
`;
export const Me_gql = gql`
	query me {
		me {
			role
		}
	}
`;
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

export type CacheControlScope_gql = 'PRIVATE' | 'PUBLIC';

export type PaginateClass_gql = {
	__typename?: 'PaginateClass';
	currentPage: Scalars['Float']['output'];
	entities: Array<User_gql>;
	hasNext: Scalars['Boolean']['output'];
	hasPrevious: Scalars['Boolean']['output'];
	pageSize: Scalars['Float']['output'];
	total: Scalars['Float']['output'];
	totalPages: Scalars['Float']['output'];
};

export type Paging_gql = {
	index?: Scalars['Float']['input'];
	take?: Scalars['Float']['input'];
};

export type Query_gql = {
	__typename?: 'Query';
	getUsers: PaginateClass_gql;
	me: User_gql;
};

export type QueryGetUsersArgs_gql = {
	input: UserFind_gql;
	page?: InputMaybe<Paging_gql>;
};

export type User_gql = {
	__typename?: 'User';
	role: UserRole_gql;
};

export type UserFind_gql = {
	avatarPath?: InputMaybe<Scalars['String']['input']>;
	email?: InputMaybe<Scalars['String']['input']>;
	id?: InputMaybe<Scalars['String']['input']>;
	name?: InputMaybe<Scalars['String']['input']>;
	phone?: InputMaybe<Scalars['String']['input']>;
	role?: InputMaybe<Scalars['String']['input']>;
};

export type UserRole_gql = 'admin' | 'guest' | 'undefined';

export type GetUsersQueryVariables_gql = Exact<{
	input: UserFind_gql;
	page?: InputMaybe<Paging_gql>;
}>;

export type GetUsersQuery_gql = {
	__typename?: 'Query';
	getUsers: {
		__typename?: 'PaginateClass';
		currentPage: number;
		hasNext: boolean;
		hasPrevious: boolean;
		pageSize: number;
		total: number;
		totalPages: number;
		entities: Array<{ __typename?: 'User'; role: UserRole_gql }>;
	};
};

export type MeQueryVariables_gql = Exact<{ [key: string]: never }>;

export type MeQuery_gql = {
	__typename?: 'Query';
	me: { __typename?: 'User'; role: UserRole_gql };
};
