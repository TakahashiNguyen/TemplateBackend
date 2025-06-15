/**
 * Error type for server responses
 */
export type ErrorType =
	| 'Invalid'
	| 'Success'
	| 'Fatal'
	| 'Forbidden'
	| 'Unauthorized';

/**
 * Error object type for server responses
 */
export type ErrorObject =
	| 'Client'
	| 'ID'
	| 'Hash'
	| 'CsrfCookie'
	| 'CsrfToken'
	| 'User'
	| 'File'
	| 'AWS'
	| 'UserType'
	| 'Method'
	| 'FileName'
	| 'Notification'
	| 'Redis'
	| 'Email'
	| 'Hook'
	| 'Token'
	| 'Entity'
	| 'Signature'
	| 'Enterprise'
	| 'Event'
	| 'Password'
	| 'Input';

/**
 * Error action type for server responses
 */
export type ErrorAction =
	| ''
	| 'Request'
	| 'Read'
	| 'Sent'
	| 'Implementation'
	| 'Upload'
	| 'Download'
	| 'SignUp'
	| 'Assign'
	| 'LogOut'
	| 'Access';
