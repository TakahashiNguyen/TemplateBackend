import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService, PayLoad, UserMetadata } from '@backend/auth/auth.service';
import { Str } from '@backend/utils';
import {
	DeepPartial,
	FindManyOptions,
	FindOneOptions,
	FindOptionsWhere,
	Repository,
	SaveOptions,
} from 'typeorm';
import { DeviceSession } from './device.entity';

export class UserRecieve {
	constructor(acsTkn: string, rfsTkn: string) {
		this.accessToken = acsTkn;
		this.refreshToken = rfsTkn;
	}

	accessToken: string;
	refreshToken: string;

	static get test() {
		return new UserRecieve(Str.random(), Str.random());
	}
}

@Injectable()
export class DeviceService {
	constructor(
		@InjectRepository(DeviceSession) private repo: Repository<DeviceSession>,
		private jwtSvc: JwtService,
		private cfgSvc: ConfigService,
		@Inject(forwardRef(() => AuthService))
		private authSvc: AuthService,
	) {}
	// session secret
	private readonly scr = this.cfgSvc.get('REFRESH_SECRET');
	private readonly exp = this.cfgSvc.get('REFRESH_EXPIRE');
	private readonly use = this.cfgSvc.get('REFRESH_USE');

	refreshTokenSign(payload: PayLoad) {
		return this.jwtSvc.sign(payload, {
			secret: this.scr,
			expiresIn: this.exp,
		});
	}

	async getTokens(usrId: string, mtdt: UserMetadata) {
		const session = await this.save({
				userId: usrId,
				hashedUserAgent: this.authSvc.hash(mtdt.toString()),
				useTimeLeft: this.use,
			}),
			rfsTkn = this.refreshTokenSign(new PayLoad(session.id).toPlainObj()),
			acsTkn = this.jwtSvc.sign(new PayLoad(usrId).toPlainObj());

		return new UserRecieve(acsTkn, rfsTkn);
	}

	find(options?: FindManyOptions<DeviceSession>): Promise<DeviceSession[]> {
		return this.repo.find(options);
	}

	findOne(options?: FindOneOptions<DeviceSession>) {
		return this.repo.findOne(options);
	}

	save(
		entities: DeepPartial<DeviceSession>,
		options?: SaveOptions & { reload: false },
	) {
		return this.repo.save(entities, options);
	}

	delete(criteria: FindOptionsWhere<DeviceSession>) {
		return this.repo.delete(criteria);
	}
}
