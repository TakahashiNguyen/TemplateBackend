import {
	Body,
	Controller,
	HttpStatus,
	Inject,
	ParseFilePipeBuilder,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	forwardRef,
} from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AppService } from 'app/app.service';
import { Bloc } from 'app/auth/bloc/bloc.entity';
import { GetRequest, type IMetadata } from 'app/auth/guards';
import { LocalhostGuard } from 'app/auth/guards/localhost.guard';
import { RefreshGuard } from 'app/auth/guards/refresh.guard';
import { memoryStorage } from 'fastify-multer';
import type { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { UserReceiveDto } from 'utils/app/dto';
import { ServerException } from 'utils/error/classes';
import { serverException } from 'utils/error/functions';
import { FileInterceptor } from 'utils/file/functions';

import {
	RequestModifyingAuthenticationDto,
	UserLoginDto,
	UserSignupDto,
} from './user.dto';
import { User } from './user.entity';
import { UserRole } from './user.model';

/** User controller class. */
@Controller({ version: '1', path: 'user' })
export class UserController {
	/**
	 * Initiate controller.
	 *
	 * @param {AppService} svc - Server app service.
	 */
	constructor(
		@Inject(forwardRef(() => AppService)) protected svc: AppService,
	) {}

	/**
	 * Signup request.
	 *
	 * @example
	 *
	 * ```ts
	 * this.signup(userSignupDto, metadata, avatar);
	 * ```
	 *
	 * @param root0
	 * @param root0.authentication
	 * @param root0.email
	 * @param root0.name
	 * @param root0.urlVisit
	 * @param root0.urlManageNotifications
	 * @param {IMetadata} metadata - Client's metadata.
	 * @param {MulterFile} avatar - User's avatar.
	 * @param {string} hostname - Client request's hostname.
	 * @returns {Promise<UserReceiveDto>} An user receive class.
	 */
	@ApiSecurity('CsrfToken')
	@Post('signup')
	@UseGuards(LocalhostGuard)
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async signup(
		@Body()
		{
			authentication,
			email,
			name,
			urlVisit,
			urlManageNotifications,
		}: UserSignupDto,
		@GetRequest('metadata') metadata: IMetadata,
		@UploadedFile(AvatarFileUpload) avatar: MulterFile,
		@GetRequest('hostname') hostname: string,
	): Promise<UserReceiveDto> {
		const user = await this.svc.user.create({
			email,
			name,
			role: UserRole.guest,
			authentication,
		});

		if (avatar) {
			const { path } = await this.svc.file.create(avatar, user);

			await this.svc.user.update({ id: user.id }, { avatarPath: path });
		}

		await this.svc.mail.send(email, 'Welcome to our service', 'welcome', {
			userName: user.name,
			urlVisit,
			urlManageNotifications,
			urlHost: hostname,
		});

		return new UserReceiveDto({
			bloc: await this.svc.bloc.create({ metadata, owner: user }),
			message: serverException('Success', 'User', 'Assign'),
		});
	}

	/**
	 * Login request.
	 *
	 * @example
	 *
	 * ```ts
	 * this.login({ email, authentication }, metadata);
	 * ```
	 *
	 * @param {IMetadata} metadata - Client's metadata.
	 * @returns {Promise<UserReceiveDto>} An user receive class.
	 */
	@ApiSecurity('CsrfToken')
	@Post('login')
	@UseInterceptors(FileInterceptor())
	async login(
		@Body() { email, authentication }: UserLoginDto,
		@GetRequest('metadata') metadata: IMetadata,
	): Promise<UserReceiveDto> {
		const { type: authenticateType, ...authentications } = authentication;

		let user: User | undefined,
			isVerified = false;

		if (!(user = await this.svc.user.email(email)))
			throw new ServerException('Invalid', 'Email', 'Submit');

		switch (authenticateType) {
			case 'password':
				isVerified = user.authentication.password.authenticate(
					authentications.password.value,
				);
				break;

			default:
				break;
		}

		if (!isVerified)
			throw new ServerException('Invalid', 'Authentication', 'Submit');

		return new UserReceiveDto({
			bloc: await this.svc.bloc.create({ owner: user, metadata }),
			message: serverException('Success', 'User', 'Access'),
		});
	}

	/**
	 * Logout request.
	 *
	 * @example
	 *
	 * ```ts
	 * this.logout(bloc);
	 * ```
	 *
	 * @param {Bloc} bloc - Received bloc from postprocessing.
	 * @returns {Promise<UserReceiveDto>} An user receive class.
	 */
	@ApiSecurity('CsrfToken')
	@Post('logout')
	@UseGuards(RefreshGuard)
	async logout(@GetRequest('bloc') bloc: Bloc): Promise<UserReceiveDto> {
		if (!bloc) throw new ServerException('Invalid', 'Client', 'Request');

		await this.svc.bloc.removeTree({ id: bloc.id });

		return new UserReceiveDto({
			message: serverException('Success', 'User', 'LogOut'),
		});
	}

	/**
	 * Request to modifying authentication function.
	 *
	 * @example
	 *
	 * ```ts
	 * this.requestChangePassword(hostname, user, metadata);
	 * ```
	 *
	 * @param root0
	 * @param root0.email
	 * @param root0.urlModifyingAuthentication
	 * @param {IMetadata} metadata - Client's metadata.
	 * @returns {Promise<UserReceiveDto>} An user receive class.
	 */
	@Throttle({ requestModifyingAuthentication: { limit: 1, ttl: 300000 } })
	@ApiSecurity('CsrfToken')
	@Post('modify-authentication')
	protected async requestModifyingAuthentication(
		@Body()
		{ email, urlModifyingAuthentication }: RequestModifyingAuthenticationDto,
		@GetRequest('metadata') metadata: IMetadata,
	): Promise<UserReceiveDto> {
		return new UserReceiveDto({
			hook: await this.svc.hook.create(metadata, async (signature) => {
				const user = await this.svc.user.findOne({ email });

				if (!user) throw new ServerException('Invalid', 'Email', 'Submit');

				await this.svc.mail.send(
					email,
					'Authenticate modifying?',
					'modifyingAuthentication',
					{
						url: urlModifyingAuthentication + signature,
						userName: user.name,
					},
				);

				return user;
			}),
			message: serverException('Success', 'Client', 'Submit'),
		});
	}
}

/** Server global avatar file upload properties. */
export const AvatarFileUpload = new ParseFilePipeBuilder()
	.addFileTypeValidator({ fileType: '.(png|jpeg|jpg)' })
	.addMaxSizeValidator({ maxSize: (0.3).mb2b })
	.build({
		fileIsRequired: false,
		errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
	});
