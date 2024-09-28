import { IDevice } from 'device/device.model';
export interface ISession {
    device: IDevice;
    useTimeLeft: number;
    child: string;
    parrent: string;
}
