/** Error type for server responses. */
export type ErrorType =
	| 'Invalid'
	| 'Success'
	| 'Fatal'
	| 'Forbidden'
	| 'Unauthorized';

/** Error object type for server responses. */
export type ErrorObject =
	| 'Client'
	| 'ID'
	| 'Hash'
	| 'CsrfCookie'
	| 'CsrfToken'
	| 'User'
	| 'File'
	| 'AWS'
	| 'Authentication'
	| 'Method'
	| 'FileName'
	| 'Notification'
	| 'Redis'
	| 'Email'
	| 'Hook'
	| 'Token'
	| 'Entity'
	| 'Signature'
	| 'Event'
	| 'Input'
	| 'Server';

/** Error action type for server responses. */
export type ErrorAction =
	| 'Submit'
	| 'Request'
	| 'Read'
	| 'Sent'
	| 'Implementation'
	| 'Upload'
	| 'Download'
	| 'Assign'
	| 'LogOut'
	| 'Access'
	| 'Authenticate';
