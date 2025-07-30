import gql from 'graphql-tag';

export const GetUsers = gql`
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
export const Me = gql`
	query me {
		me {
			role
		}
	}
`;
