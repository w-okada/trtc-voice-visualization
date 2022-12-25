import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import TRTC, { Client, LocalStream } from "trtc-js-sdk"
import { EXPIRETIME, SDKAPPID, SECRETKEY } from "./const";
import "./index.css"
import { AppSettingProvider, useAppSetting } from "./003_provider/001_AppSettingProvider";
import { AppStateProvider, useAppState } from "./003_provider/002_AppStateProvider";

//@ts-ignore
import workerjs from "raw-loader!../worklet/dist/index.js";
import { VolumeWorkletNode } from "./VolumeWorkletNode";
import { RecognitionWord } from "./002_hooks/101_useSpeechRecognition";
import { loadFont } from "./utils";

type RecognitionWordWithVol = RecognitionWord & {
    volume: number
}

const App = () => {
    const { speechRecognitionState } = useAppState()

    const audioContextRef = useRef<AudioContext | null>(null)
    const volumeWorkletNodeRef = useRef<VolumeWorkletNode | null>(null)
    const volumeRef = useRef<number>(0)
    const volumesRef = useRef<number[]>([])
    const textsRef = useRef<RecognitionWordWithVol[]>([])

    useEffect(() => {
        loadFont()
    }, [])

    // const audioInputDeviceIdRef = useRef<string>("")
    // const [audioInputDeviceId, _setAudioInputDeviceId] = useState<string>(audioInputDeviceIdRef.current)
    // const setAudioInputDeviceId = (val: string) => {
    //     audioInputDeviceIdRef.current = val
    //     _setAudioInputDeviceId(audioInputDeviceIdRef.current)
    // }

    const renderingProcessIdRef = useRef<number>(0)

    const clientRef = useRef<Client | null>(null)
    const usernameRef = useRef<string>("")
    const localStreamRef = useRef<LocalStream | null>(null)

    useEffect(() => {
        // console.log("RECOGNITION:", speechRecognitionState.recognitionWord)
        if (speechRecognitionState.recognitionWord?.isFinal) {
            const averageVol = volumesRef.current.length == 0 ? 0 : volumesRef.current.reduce((prev, cur) => { return prev + cur }, 0) / volumesRef.current.length
            const newText: RecognitionWordWithVol = {
                ...speechRecognitionState.recognitionWord,
                volume: averageVol
            }
            textsRef.current.push(newText)
            volumesRef.current = []
        }
    }, [speechRecognitionState.recognitionWord])
    useEffect(() => {
        // console.log("RECOGNITION:", speechRecognitionState.recordingState)
    }, [speechRecognitionState.recordingState])

    const publishLocalStream = async () => {
        if (!clientRef.current) {
            return
        }
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext()
            const scriptUrl = URL.createObjectURL(new Blob([workerjs], { type: "text/javascript" }));
            await audioContextRef.current.audioWorklet.addModule(scriptUrl)
            volumeWorkletNodeRef.current = new VolumeWorkletNode(audioContextRef.current, (volume: number) => {
                volumeRef.current = volume
                if (volumeRef.current > 0.05) {
                    volumesRef.current.push(volume)
                }
                const div = document.getElementById("volume") as HTMLDivElement
                div.innerText = `${volumeRef.current.toFixed(4)}`
            });
        }

        // 既存のLocalStreamの終了処理
        if (localStreamRef.current) {
            await clientRef.current.unpublish(localStreamRef.current);
            localStreamRef.current.stop()
            localStreamRef.current.close()
            localStreamRef.current = null
        }

        if (!speechRecognitionState.isEnable) {
            speechRecognitionState.recognitionStart()
        }

        // 新規のLocalStreamの作成処理
        //// Video用のトラック作成処理
        const canvas = document.createElement("canvas")
        canvas.width = 640
        canvas.height = 480
        const processId = new Date().getTime()
        renderingProcessIdRef.current = processId

        const ScrollSpeed = 3 / 100
        const drawCanvas = () => {
            const currentTime = new Date().getTime()

            const ctx = canvas.getContext("2d")!
            ctx.fillStyle = `#40645c`
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            textsRef.current.forEach(x => {
                const elapsed = currentTime - x.time

                if (x.volume > 0.3) {
                    ctx.fillStyle = `rgba(255,0,0,1)`
                    ctx.font = "900 30px Chalk"
                } else if (x.volume > 0.2) {
                    ctx.fillStyle = `rgba(255,200,200,1)`
                    ctx.font = "700 25px Chalk"
                } else if (x.volume > 0.1) {
                    ctx.fillStyle = `rgba(255,255,255,1)`
                    ctx.font = "700 25px Chalk"
                } else if (x.volume > 0.07) {
                    ctx.fillStyle = `rgba(255,255,255,1)`
                    ctx.font = "500 20px Chalk"
                } else if (x.volume > 0.05) {
                    ctx.fillStyle = `rgba(255,255,255,1)`
                    ctx.font = "100 20px Chalk"
                } else {
                    ctx.fillStyle = `rgba(255,255,255,1)`
                    ctx.font = "100 18px Chalk"
                }

                const lineNum = Math.ceil((ctx.measureText(x.word).width) / (canvas.width * 0.8))
                const wordNum = Math.floor(x.word.length / lineNum)
                for (let i = 0; i < lineNum; i++) {
                    // ctx.fillText(`${x.word}[${x.volume.toFixed(2)}]`, 10, canvas.height - (elapsed * ScrollSpeed))
                    // const text = x.word.slice(i * wordNum, i * (wordNum + 1))
                    const text = x.word.slice(i * wordNum, i * wordNum + wordNum)
                    const h = canvas.height - 25 - (elapsed * ScrollSpeed) + 25 * i
                    if (h > 0) {
                        ctx.fillText(`${text}`, 10, h)
                    }
                }


            })
            if (processId == renderingProcessIdRef.current) {
                // console.log("requestAnimationFrame?", processId, renderingProcessIdRef.current)
                requestAnimationFrame(drawCanvas)
            }
        }
        drawCanvas()
        const canvasStream = canvas.captureStream(10);

        //// Audio用のトラック作成処理
        const audioMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        const srcNode = audioContextRef.current.createMediaStreamSource(audioMediaStream)
        srcNode.connect(volumeWorkletNodeRef.current!)
        const dstNode = audioContextRef.current.createMediaStreamDestination()
        volumeWorkletNodeRef.current!.connect(dstNode)

        localStreamRef.current = TRTC.createStream({ userId: usernameRef.current, audioSource: audioMediaStream.getAudioTracks()[0], videoSource: canvasStream.getVideoTracks()[0] });
        // localStreamRef.current = TRTC.createStream({ userId: usernameRef.current, audioSource: dstNode.stream.getAudioTracks()[0], videoSource: canvasStream.getVideoTracks()[0] });

        await localStreamRef.current.initialize()
        localStreamRef.current.play('local-video-container', { objectFit: "contain" });
        await clientRef.current.publish(localStreamRef.current);
    }

    const join = async () => {
        const usernameInput = document.getElementById("username") as HTMLInputElement
        usernameRef.current = usernameInput.value
        const roomIdInput = document.getElementById("room-id") as HTMLInputElement
        const roomId = Number(roomIdInput.value)

        const signer = new window.LibGenerateTestUserSig(SDKAPPID, SECRETKEY, EXPIRETIME)
        const sign = signer.genTestUserSig(usernameRef.current)

        clientRef.current = TRTC.createClient({
            sdkAppId: SDKAPPID,
            userId: usernameRef.current,
            userSig: sign,
            mode: 'rtc'
        });

        clientRef.current.on('stream-added', event => {
            if (!clientRef.current) {
                alert("client is not initialized.")
                return
            }
            const remoteStream = event.stream;
            clientRef.current.subscribe(remoteStream);
        });
        clientRef.current.on('stream-subscribed', event => {
            const remoteStream = event.stream;
            remoteStream.play(`remote-video-container`, { objectFit: "contain" });
        });

        await clientRef.current.join({ roomId: roomId });
        await publishLocalStream()
    }

    const leave = async () => {
        if (!clientRef.current) {
            alert("client is not initialized.")
            return
        }
        await clientRef.current.leave();
        clientRef.current.destroy();
        clientRef.current = null

        if (localStreamRef.current) {
            localStreamRef.current.stop()
            localStreamRef.current.close()
            localStreamRef.current = null
        }

        speechRecognitionState.recognitionStop()
    }

    return (
        <div className="root-div">
            <div className="header">
                <div className="header-item-container">
                    <div className="header-label">username</div>
                    <input type="text" id="username"></input>
                </div>
                <div className="header-item-container">
                    <div className="header-label">room id</div>
                    <input type="number" id="room-id"></input>
                </div>
                <div className="header-item-container">
                    <div className="header-button" onClick={join}>enter</div>
                </div>
                <div className="header-item-container">
                    <div className="header-button" onClick={leave}>leave</div>
                </div>
                <div className="header-item-container">
                    <div className="header-label">volume</div>
                    <div className="header-label" id="volume"></div>
                </div>


                {/* <div className="header-item-container">
                    <div className="header-label">Microphone</div>
                    <select onChange={(e) => { setAudioInputDeviceId(e.target.value) }}>
                        {deviceManagerState.audioInputDevices.map(x => {
                            return (<option value={x.deviceId} key={x.deviceId}>{x.label}</option>)
                        })}
                    </select>
                </div> */}
            </div>

            <div className="body" id="body">
                <div id="local-video-container" className="local-video-container"></div>
                <div id="remote-video-container" className="remote-video-container"></div>
            </div>
            <div className="hidden-resources">
                <img src="./pixabay_logo.png" id="logo" />
                <div className="virtual-background-image">
                    <img src="./bg_natural_sougen.jpg" id="virtual-background-image"></img>
                </div>
            </div>
        </div>
    )



}

const container = document.getElementById("app")!;
const root = createRoot(container);
root.render(
    <AppSettingProvider>
        <AppStateProvider>
            <App />
        </AppStateProvider>
    </AppSettingProvider>
);

