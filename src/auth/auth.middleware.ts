import { forwardRef, Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compareSync } from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import uaParserJs from 'ua-parser-js';
import { AuthService } from './auth.service';

export function generateFingerprint() {
	return {
		userAgent: uaParserJs.UAParser(),
	};
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(
		@Inject(forwardRef(() => AuthService))
		private authSvc: AuthService,
		private cfgSvc: ConfigService,
	) {}
	private readonly rfsgrd = /\/(auth){1}\/(logout|refreshtoken){1}/gi;
	private readonly ckiPfx = this.cfgSvc.get('SERVER_COOKIE_PREFIX');
	private readonly rfsKey = this.cfgSvc.get('REFRESH_KEY');
	private readonly acsKey = this.cfgSvc.get('ACCESS_KEY');

	use(req: Request, res: Response, next: NextFunction) {
		req['fingerprint'] = generateFingerprint();
		const isRefresh = req.url.match(this.rfsgrd);

		let acsTkn: string, rfsTkn: string;
		for (const cki in req.cookies)
			if (compareSync(this.rfsKey, cki.substring(this.ckiPfx.length)))
				rfsTkn = req.cookies[cki];
			else if (compareSync(this.acsKey, cki.substring(this.ckiPfx.length)))
				acsTkn = req.cookies[cki];

		const tknPld = this.authSvc.decrypt(acsTkn);
		req.headers.authorization = `Bearer ${
			isRefresh ? this.authSvc.decrypt(rfsTkn, tknPld.split('.')[2]) : tknPld
		}`;

		next();
	}
}
