import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Base } from '@backend/utils';

@InputType()
export class SignUpDto extends Base<SignUpDto> {
	@IsString() @Field({ nullable: false }) firstName!: string;
	@IsString() @Field({ nullable: false }) lastName!: string;
	@IsEmail() @Field({ nullable: false }) email!: string;
	@IsNotEmpty() @Field({ nullable: false }) password!: string;
}

@InputType()
export class LogInDto extends Base<LogInDto> {
	@IsEmail() @Field({ nullable: false }) email!: string;
	@IsNotEmpty() @Field({ nullable: false }) password!: string;
}
