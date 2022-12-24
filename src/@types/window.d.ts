export interface LibGenerateTestUserSig {
    constructor(SDKAPPID: string, SECRETKEY: string, EXPIRETIME: number)
    genTestUserSig(userId: string)
}

declare global {

    interface Window {
        LibGenerateTestUserSig: new (SDKAPPID: number, SECRETKEY: string, EXPIRETIME: number) => LibGenerateTestUserSig
    }
}