export class VolumeWorkletNode extends AudioWorkletNode {
    callback
    constructor(context: AudioContext, callback: (volume: number) => void) {
        super(context, "volume-worklet-processor");
        this.port.onmessage = this.handleMessage_.bind(this);
        this.callback = callback
        console.log("[Node:constructor] created.");
    }

    handleMessage_(event: any) {
        // console.log(`[Node:handleMessage_] `, event.data.volume);
        this.callback(event.data.volume)

    }
}