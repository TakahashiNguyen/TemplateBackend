import { Field, InputType } from '@nestjs/graphql';
import { Bloc } from 'app/auth/bloc/bloc.entity';
import { Hook } from 'app/auth/hook/hook.entity';

import { ApplyPartial, AttributesOnly } from './types';

/** User receive information. */
export class UserReceiveDto {
	/**
	 * Quick user receive initiation.
	 *
	 * @param {ApplyPartial<
	 * 	AttributesOnly<UserReceiveDto>,
	 * 	'bloc' | 'hook' | 'token'
	 * >} object
	 *   - User receive information.
	 */
	constructor(
		object: ApplyPartial<
			AttributesOnly<UserReceiveDto>,
			'bloc' | 'hook' | 'token'
		>,
	) {
		// @ts-expect-error nullable field
		this.hook = object.hook;
		// @ts-expect-error nullable field
		this.bloc = object.bloc;
		// @ts-expect-error nullable field
		this.token = object.token;
		this.message = object.message;
	}

	/** Hook entity. */
	hook: Hook;

	/** Bloc entity. */
	bloc: Bloc;

	/** Server's message. */
	message: string;

	/** Token. */
	token: string;
}

/** Paging class. */
@InputType()
export class Paging {
	/** Page index. */
	@Field() index: number = 0;
	/** Number of entities taken. */
	@Field() take: number = 10e100;
}
