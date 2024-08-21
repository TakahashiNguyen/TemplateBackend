import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@backend/auth/auth.module';
import { DeviceSession } from './device.entity';
import { DeviceResolver } from './device.resolver';
import { DeviceService } from './device.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([DeviceSession]),
		forwardRef(() => AuthModule),
	],
	providers: [DeviceResolver, DeviceService],
	exports: [DeviceService],
})
export class DeviceModule {}
