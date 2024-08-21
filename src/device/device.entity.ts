import { User } from '@backend/user/user.entity';
import { InitClass } from '@backend/utils';
import {
	BaseEntity,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class DeviceSession extends BaseEntity {
	constructor(payload: InitClass<DeviceSession>) {
		super();
		Object.assign(this, payload);
	}

	@PrimaryGeneratedColumn('uuid') id: string;
	@ManyToOne(() => User, (user: User) => user.deviceSessions)
	@JoinColumn({ name: 'userId' })
	user: User;
	@Column() userId: string;
	@Column() hashedUserAgent: string;
	@Column() useTimeLeft: number;
}
