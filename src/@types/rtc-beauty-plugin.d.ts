declare module "rtc-beauty-plugin";

declare class RTCBeautyPluginClass {
    generateBeautyStream: (localStream: LocalStream) => LocalStream
    generateVirtualStream: (localStream: LocalStream) => Promise<LocalStream>
    loadResources: () => Promise<void>
    destroy: () => void
}
