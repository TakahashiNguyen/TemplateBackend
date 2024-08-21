import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { compareSync } from 'bcrypt';
import { CookieOptions, Request as Rqt, Response as Rsp } from 'express';
import { DeviceService, UserRecieve } from '@backend/device/device.service';
import { LogInDto, SignUpDto } from './auth.dto';
import { AuthService, UserMetadata as UsrMtdt } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(
		private authSvc: AuthService,
		private dvcSvc: DeviceService,
		private cfgSvc: ConfigService,
	) {}

	private readonly ckiOpt: CookieOptions = {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
	};
	private readonly ckiPfx = this.cfgSvc.get('SERVER_COOKIE_PREFIX');
	private readonly rfsKey = this.cfgSvc.get('REFRESH_KEY');
	private readonly acsKey = this.cfgSvc.get('ACCESS_KEY');

	clearCookies(req: Rqt, res: Rsp, acs = true, rfs = true) {
		for (const cki in req.cookies)
			if (
				(compareSync(this.acsKey, cki.substring(this.ckiPfx.length)) && acs) ||
				(compareSync(this.rfsKey, cki.substring(this.ckiPfx.length)) && rfs)
			)
				res.clearCookie(cki, this.ckiOpt);
	}

	sendBack(req: Rqt, res: Rsp, usrRcv: UserRecieve) {
		this.clearCookies(req, res);
		res
			.cookie(
				this.ckiPfx + this.authSvc.hash(this.acsKey),
				this.authSvc.encrypt(usrRcv.accessToken),
				this.ckiOpt,
			)
			.cookie(
				this.ckiPfx + this.authSvc.hash(this.rfsKey),
				this.authSvc.encrypt(
					usrRcv.refreshToken,
					usrRcv.accessToken.split('.')[2],
				),
				this.ckiOpt,
			)
			.send({ success: true });
	}

	@Post('login')
	async login(
		@Req() req: Rqt,
		@Body() dto: LogInDto,
		@Res({ passthrough: true }) res: Rsp,
	) {
		this.sendBack(req, res, await this.authSvc.login(dto, new UsrMtdt(req)));
	}

	@Post('signup')
	async signup(
		@Req() req: Rqt,
		@Body() dto: SignUpDto,
		@Res({ passthrough: true }) res: Rsp,
	) {
		this.sendBack(req, res, await this.authSvc.signup(dto, new UsrMtdt(req)));
	}

	@Post('logout')
	@UseGuards(AuthGuard('refresh'))
	async logout(@Req() req: Rqt, @Res({ passthrough: true }) res: Rsp) {
		this.clearCookies(req, res);
		await this.dvcSvc.delete({ id: req.user['id'] });
	}

	@Post('refreshToken')
	@UseGuards(AuthGuard('refresh'))
	async refresh(@Req() req: Rqt, @Res({ passthrough: true }) res: Rsp) {
		const sendBack = (usrRcv: UserRecieve) => this.sendBack(req, res, usrRcv);
		if (
			req.user['success'] &&
			compareSync(new UsrMtdt(req).toString(), req.user['ua'])
		) {
			sendBack(new UserRecieve(req.user['acsTkn'], req.user['rfsTkn']));
		} else
			sendBack(
				await this.dvcSvc.getTokens(req.user['userId'], new UsrMtdt(req)),
			);
	}
}
