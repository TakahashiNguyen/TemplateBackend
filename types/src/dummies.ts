function dummyDecorator() {
	return () => undefined;
}

function dummyFunction() {}

class dummyClass {}

export const Field = dummyDecorator,
	ObjectType = dummyDecorator,
	InputType = dummyDecorator,
	Directive = dummyDecorator,
	HttpException = dummyClass,
	PassportStrategy = () => dummyClass,
	hashSync = dummyFunction,
	verifySync = dummyFunction;
