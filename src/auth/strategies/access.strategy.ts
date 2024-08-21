import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '@backend/user/user.service';
import { PayLoad } from '../auth.service';

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'access') {
	constructor(
		cfgSvc: ConfigService,
		private usrSvc: UserService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: cfgSvc.get('ACCESS_SECRET'),
			ignoreExpiration: false,
		});
	}

	async validate(payload: PayLoad) {
		const user = await this.usrSvc.findOne({ id: payload.id });
		if (user) return user;
		throw new UnauthorizedException('Login first to access this endpoint.');
	}
}
