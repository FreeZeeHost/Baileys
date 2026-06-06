import { UserFacingSocketConfig, WASocket } from '../index'

export declare const makeFreeZeeSocket: (config?: UserFacingSocketConfig & { phoneNumber?: string, usePairingCode?: boolean }) => WASocket
