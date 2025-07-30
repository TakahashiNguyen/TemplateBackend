import { TestingModule } from '@nestjs/testing';
import { AppService } from 'app/app.service';
import {
	InjectOptions,
	LightMyRequestChain,
	LightMyRequestResponse,
} from 'fastify';

/** The return of jest initialization function. */
export interface JestInitializationReturns {
	/** Collection of server modules. */
	module: TestingModule;

	/** Server's app service. */
	appService: AppService;

	/** Server's testing requester function. */
	requester(): LightMyRequestChain;
	/** Server's testing requester function. */
	requester(opt: InjectOptions): Promise<LightMyRequestResponse>;
}

/**
 * Test's expectations.
 *
 * @template T
 * @template K
 */
export interface Expectation<T, K extends keyof jest.Matchers<T>> {
	/** Expectation's type. */
	type: K;

	/** Expectation's parameters. */
	parameters: Parameters<jest.Matchers<T>[K]>;

	/** Is not? */
	not?: boolean;
}
