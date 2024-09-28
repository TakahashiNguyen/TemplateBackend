"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matching = exports.tstStr = exports.logMethodCall = exports.InterfaceCasting = void 0;
exports.allImplement = allImplement;
exports.methodDecorator = methodDecorator;
if (!navigator.userAgent.includes('Node.js'))
    window.global = window;
class InterfaceCasting {
    constructor(input, get) {
        get.forEach((_) => (this[String(_)] = input[_]));
    }
    static quick(input, get) {
        return new InterfaceCasting(input, get);
    }
}
exports.InterfaceCasting = InterfaceCasting;
const tstStr = () => (12).alpha, matching = (input, required) => required.every((i) => input.some((j) => i === j));
exports.logMethodCall = methodDecorator({
    prerun: (target, propertyKey, args) => {
        console.log(`Calling ${target.constructor.name}.${propertyKey.name} with arguments:`, args);
    },
    postrun: (target, propertyKey, result) => {
        console.log(`Result of ${target.constructor.name}.${propertyKey.name}:`, result);
    },
}), exports.tstStr = tstStr, exports.matching = matching;
// Decorators
/**
 * A class decorator that get all functions in class and implement them a function declared in argument
 * @param {MethodDecorator} decorator - the function will implement to all functions in class
 */
function allImplement(decorator) {
    return function (target) {
        for (const propertyName of Object.getOwnPropertyNames(target.prototype)) {
            if (typeof target.prototype[propertyName] === 'function') {
                const descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
                Object.defineProperty(target.prototype, propertyName, decorator(target, propertyName, descriptor));
            }
        }
    };
}
/**
 * A function decorator that implements prerun and postrun functions
 * @param {Object} functions - A two-element array that contains prerun and postrun functions
 */
function methodDecorator(functions) {
    const { prerun = () => 0, postrun = () => 0 } = functions || {};
    return (_target, _propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            prerun(this, originalMethod, args);
            const result = originalMethod.apply(this, args);
            postrun(this, originalMethod, result);
            return result;
        };
        return descriptor;
    };
}
// Defines
const alphaChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', numChars = '0123456789';
// Global functions
global.curFile = (file, cut = 2) => file
    .split(/\/|\\/)
    .lastElement.split('.')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .slice(0, cut)
    .join('');
global.array = (length, initValue = '') => Array(length)
    .join()
    .split(',')
    .map(() => initValue);
// String.prototype
Object.defineProperty(String.prototype, 'randomChar', {
    get: function () {
        return this.charAt(this.length.random);
    },
    enumerable: true,
    configurable: true,
});
// Array.prototype
Array.prototype.get = function (subString) {
    return this.filter((i) => i.includes(subString));
};
Object.defineProperty(Array.prototype, 'randomElement', {
    get: function () {
        return this[this.length.random];
    },
    enumerable: true,
    configurable: true,
});
Object.defineProperty(Array.prototype, 'lastElement', {
    get: function () {
        return this[this.length - 1];
    },
    enumerable: true,
    configurable: true,
});
// Number.prototype
Number.prototype.ra = async function (input) {
    await Array.from({ length: Number(this) }, (_, i) => i).reduce(async (i) => {
        await i;
        return input();
    }, Promise.resolve());
};
Object.defineProperty(Number.prototype, 'random', {
    get: function () {
        return Math.floor(Math.random() * this);
    },
    enumerable: true,
    configurable: true,
});
Object.defineProperty(Number.prototype, 'alpha', {
    get: function () {
        return array(this)
            .map(() => alphaChars.randomChar)
            .join('');
    },
    enumerable: true,
    configurable: true,
});
Object.defineProperty(Number.prototype, 'string', {
    get: function () {
        return array(this)
            .map(() => (alphaChars + numChars).randomChar)
            .join('');
    },
    enumerable: true,
    configurable: true,
});
Object.defineProperty(Number.prototype, 'numeric', {
    get: function () {
        return array(this)
            .map(() => numChars.randomChar)
            .join('');
    },
    enumerable: true,
    configurable: true,
});
Object.defineProperty(Number.prototype, 'floor', {
    get: function () {
        return Math.floor(this);
    },
    enumerable: true,
    configurable: true,
});
Object.defineProperty(Number.prototype, 'round', {
    get: function () {
        return Math.round(this);
    },
    enumerable: true,
    configurable: true,
});
Object.defineProperty(Number.prototype, 'abs', {
    get: function () {
        return Math.abs(this);
    },
    enumerable: true,
    configurable: true,
});
Object.defineProperty(Number.prototype, 'mb', {
    get: function () {
        return this * 1024 * 1024;
    },
    enumerable: true,
    configurable: true,
});
