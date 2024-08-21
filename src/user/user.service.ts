import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
	DeepPartial,
	FindOptionsWhere,
	Repository,
	SaveOptions,
} from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private repo: Repository<User>) {}

	find(options?: FindOptionsWhere<User>): Promise<User[]> {
		return this.repo.find({ where: options, relations: ['deviceSessions'] });
	}

	findOne(options?: FindOptionsWhere<User>) {
		return this.repo.findOne({ where: options, relations: ['deviceSessions'] });
	}

	save(
		entities: DeepPartial<User>,
		options?: SaveOptions & { reload: false },
	): Promise<DeepPartial<User>> {
		return this.repo.save(entities, options);
	}

	delete(criteria: FindOptionsWhere<User>) {
		return this.repo.delete(criteria);
	}
}
