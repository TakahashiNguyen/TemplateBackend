import { forwardRef, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DeviceModule } from '@backend/device/device.module';
import { UserModule } from '@backend/user/user.module';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { AuthService } from './auth.service';
import { AccessStrategy } from './strategies/access.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';

@Module({
	imports: [
		// Authencation
		PassportModule.register({ session: true }),
		JwtModule.registerAsync({
			global: true,
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (cfgSvc: ConfigService) => {
				return {
					secret: cfgSvc.get('ACCESS_SECRET'),
					signOptions: {
						expiresIn: cfgSvc.get('ACCESS_EXPIRES'),
					},
				};
			},
		}),
		// Foreign modules
		forwardRef(() => DeviceModule),
		forwardRef(() => UserModule),
	],
	providers: [
		AuthService,
		// Strategies
		AccessStrategy,
		RefreshStrategy,
	],
	controllers: [AuthController],
	exports: [AuthService],
})
export class AuthModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes(AuthController);
	}
}
