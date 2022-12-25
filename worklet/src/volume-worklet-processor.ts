class VolumeWorkletProcessor extends AudioWorkletProcessor {
    initialized = false;
    volume = 0
    /**
     * @constructor
     */
    constructor() {
        super();
        this.initialized = true;
        this.port.onmessage = this.handleMessage.bind(this);
    }

    handleMessage(_event: any) {
        // noop
        console.warn("[worklet] onmessage is not defined...")
    }

    process(inputs: Float32Array[][], outputs: Float32Array[][], _parameters: Record<string, Float32Array>) {
        if (!this.initialized) {
            console.warn("[worklet] worklet_process not ready");
            return true;
        }
        if (inputs.length != 1) {
            console.warn("[worklet] inputs.length is not one", inputs.length);
            return true
        }
        const input = inputs[0];
        if (input.length != 1) {
            // console.warn("[worklet] input.length is not one", input.length);
        }
        const vols = input.map(x => {
            const sum = x.reduce((prev, cur) => {
                return prev + cur * cur
            }, 0)
            const rms = Math.sqrt(sum / x.length)
            return rms
        })
        this.volume = Math.max(...vols, this.volume * 0.95)
        this.port.postMessage({ volume: this.volume });

        input.forEach((_x, index) => {
            outputs[0][index].set(inputs[0][index])
        })

        return true;
    }
}

registerProcessor("volume-worklet-processor", VolumeWorkletProcessor);
