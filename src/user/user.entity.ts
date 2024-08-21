import { Field, ObjectType } from '@nestjs/graphql';
import { DeviceSession } from '@backend/device/device.entity';
import { InitClass, Str } from '@backend/utils';
import {
	BaseEntity,
	Column,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';

export enum Role {
	USER = 'USER',
	ADMIN = 'ADMIN',
	STAFF = 'STAFF',
}

@ObjectType()
@Entity()
export class User extends BaseEntity {
	constructor(payload: InitClass<User>) {
		super();
		Object.assign(this, payload);
	}

	// Sensitive infomation
	@PrimaryGeneratedColumn('uuid') id?: string;
	@Column('text', { nullable: false }) password?: string;
	@OneToMany(() => DeviceSession, (dvcSess: DeviceSession) => dvcSess.user)
	deviceSessions?: DeviceSession[];

	// Basic infomation
	@Field() @Column({ length: 15, nullable: false }) firstName!: string;
	@Field() @Column({ length: 15, nullable: false }) lastName!: string;
	@Field()
	@Column({ length: 128, nullable: false, unique: true })
	email!: string;
	@Field(() => [Role])
	@Column({ type: 'enum', enum: Role, array: true, default: [Role.USER] })
	roles!: Role[];

	get info() {
		return {
			firstName: this.firstName,
			lastName: this.lastName,
			email: this.email,
			roles: this.roles,
		};
	}

	static get test() {
		return new User({
			email: Str.random(),
			password: Str.random(),
			firstName: Str.random(),
			lastName: Str.random(),
			roles: [Role.USER],
		});
	}
}
