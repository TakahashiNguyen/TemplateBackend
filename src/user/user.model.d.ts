import { IDevice } from 'device/device.model';
import { IFile } from 'file/file.model';
export interface IUserAuthentication {
    email: string;
    password: string;
}
export interface IUserInfo {
    firstName: string;
    lastName: string;
    description: string;
    roles?: Role[];
    email: string;
    avatarFilePath?: string;
}
export interface IUser extends IUserAuthentication, IUserInfo {
    devices?: IDevice[];
    uploadFiles?: IFile[];
}
export interface IUserRecieve {
    accessToken: string;
    refreshToken: string;
}
export interface ILogin extends IUserAuthentication {
}
export interface ISignUp extends IUserAuthentication, IUserInfo {
}
export declare enum Role {
    USER = "USER",
    ADMIN = "ADMIN",
    STAFF = "STAFF"
}
