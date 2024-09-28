import { IUser } from 'types';
export interface IFile {
    path: string;
    createdBy: IUser;
    forEveryone: boolean;
}
