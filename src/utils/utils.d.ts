export declare class InterfaceCasting<T, K extends keyof T> {
    [key: string]: any;
    constructor(input: T, get: readonly K[]);
    static quick<T, K extends keyof T>(input: T, get: readonly K[]): InterfaceCasting<T, K>;
}
export declare const logMethodCall: MethodDecorator, tstStr: () => string, matching: <T>(input: T[], required: T[]) => boolean;
type MethodDecorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
type MethodPrerun = (target: any, propertyKey: Function, args: any) => void;
type MethodPostrun = (target: any, propertyKey: Function, result: any) => void;
/**
 * A class decorator that get all functions in class and implement them a function declared in argument
 * @param {MethodDecorator} decorator - the function will implement to all functions in class
 */
export declare function allImplement(decorator: MethodDecorator): (target: Function) => void;
/**
 * A function decorator that implements prerun and postrun functions
 * @param {Object} functions - A two-element array that contains prerun and postrun functions
 */
export declare function methodDecorator(functions: {
    prerun?: MethodPrerun;
    postrun?: MethodPostrun;
}): MethodDecorator;
declare global {
    interface Array<T> {
        readonly randomElement: T;
        get(subString: string): Array<T>;
        readonly lastElement: T;
    }
    interface Number {
        readonly floor: number;
        readonly round: number;
        readonly abs: number;
        readonly alpha: string;
        readonly numeric: string;
        readonly string: string;
        readonly mb: number;
        readonly random: number;
        ra(input: () => Promise<any>): Promise<void>;
    }
    interface String {
        readonly randomChar: string;
    }
    /**
     * Return the formatted name of current file
     * @param {string} file - the current file's name (must be __filename)
     * @param {number} cut - How many chunk should get (default: 2)
     * @return {string} formatted file's name
     */
    function curFile(file: string, cut?: number): string;
    /**
     * Return an array with length
     * @param {number} length - the length of the array
     * @param {any} initValue - the initial value for each element in array
     * @return {any[]} the output array with length
     */
    function array(length: number, initValue?: any): any[];
}
export {};
