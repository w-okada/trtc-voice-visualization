import { useEffect, useMemo, useRef, useState } from "react";
import { useAppSetting } from "../003_provider/001_AppSettingProvider";
export const RecordingState = {
    STOP: "STOP",
    LISTENING: "LISTENING",
    SPEAKING: "SPEAKING",
} as const;

export type RecordingState = typeof RecordingState[keyof typeof RecordingState];

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;



export type SpeechRecognitionState = {
    languageKey: string,
    recordingState: RecordingState
    isEnable: boolean
    recognitionWord: RecognitionWord | null
}
export type SpeechRecognitionStateAndMethod = SpeechRecognitionState & {
    recognitionStartSync: () => Promise<RecognitionWord | null>
    setLanguageKey: (val: SpeechRecognitionLanguagesKeys) => void
    recognitionStart: () => void
    recognitionStop: () => void

}

export type SpeechRecognitionLanguagesKeys = keyof typeof SpeechRecognitionLanguages | "default"
export type RecognitionWord = {
    word: string,
    isFinal: boolean,
    time: number
}
const ExpireTime = 1000 * 5 // 5sec
export const useSpeechRecognition = (): SpeechRecognitionStateAndMethod => {
    const [languageKey, setLanguageKey] = useState<SpeechRecognitionLanguagesKeys>("日本語(ja-JP)")

    const [recordingState, setRecordingState] = useState<RecordingState>("STOP")
    const recognitionWordRef = useRef<RecognitionWord | null>(null)
    const [recognitionWord, setRecognitionWord] = useState<RecognitionWord | null>(recognitionWordRef.current)

    const isEnableRef = useRef<boolean>(false)
    const [isEnable, setIsEnable] = useState<boolean>(isEnableRef.current)
    const resolverRef = useRef<((value: RecognitionWord | null) => void) | null>(null)

    const recognition = useMemo(() => {
        const recognition = new SpeechRecognition();
        recognition.interimResults = true;

        recognition.onresult = (event: { results: { transcript: string }[][] }) => {
            setRecordingState("SPEAKING")
            // console.log("res;", event.results[0][0].transcript, event.results);
            const recognitionWord = {
                word: event.results[0][0].transcript as string,
                // @ts-ignore
                isFinal: event.results[0].isFinal,
                time: new Date().getTime()
            }
            recognitionWordRef.current = recognitionWord
            setRecognitionWord(recognitionWordRef.current)

            // 一定時間同じものが登録されていたら削除
            setTimeout(() => {
                if (recognitionWordRef.current === recognitionWord) {
                    setRecognitionWord(null)
                }
            }, ExpireTime)
        };

        recognition.onstart = (_event: any) => {
            setRecordingState("LISTENING")
        };
        // recognition.onaudioend = (event: any) => {
        //     // console.log("onaudioend:", event);
        // };
        // recognition.onaudiostart = (event: any) => {
        //     // console.log("onaudiostart:", event);
        // };
        recognition.onend = (_event: any) => {
            // console.log("onend:", event);
            if (resolverRef.current) {
                resolverRef.current(recognitionWordRef.current)
                resolverRef.current = null
                setRecordingState("STOP")
            } else {
                setRecordingState("STOP")
                recognition.start();
            }
        };
        // recognition.onerror = (event: any) => {
        //     // console.log("onerror:", event);
        // };
        // recognition.onnomatch = (event: any) => {
        //     // console.log("onnomatch:", event);
        // };
        // recognition.onsoundend = (event: any) => {
        //     // console.log("onsoundend:", event);
        // };
        // recognition.onsoundstart = (event: any) => {
        //     // console.log("onsoundstart:", event);
        // };
        // recognition.onspeechend = (event: any) => {
        //     // console.log("onspeechend:", event);
        // };
        // recognition.onspeechstart = (event: any) => {
        //     // console.log("onspeechstart:", event);
        // };

        return recognition
    }, [])

    useEffect(() => {
        if (languageKey === "default") {
            console.log(`default language ${navigator.language}`);
            recognition.lang = navigator.language;
        } else {
            recognition.lang = SpeechRecognitionLanguages[languageKey];
        }
    }, [languageKey])

    const recognitionStartSync = async () => {
        const words = await new Promise<RecognitionWord | null>((resolve) => {
            resolverRef.current = resolve
            recognition.start();
        })
        return words
    }
    const recognitionStart = () => {
        isEnableRef.current = true
        recognition.start()
        setIsEnable(isEnableRef.current)
    }
    const recognitionStop = () => {
        isEnableRef.current = false
        setIsEnable(isEnableRef.current)
    }

    return {
        languageKey,
        recordingState,
        recognitionWord,
        isEnable,
        recognitionStartSync,
        setLanguageKey,
        recognitionStart,
        recognitionStop
    }
}



export const SpeechRecognitionLanguages = {
    "Afrikaans(af-ZA)": "af-ZA",
    "አማርኛ(am-ET)": "am-ET",
    "Azərbaycanca(az-AZ)": "az-AZ",
    "বাংলা বাংলাদেশ(bn-BD)": "bn-BD",
    "বাংলা ভারত(bn-IN)": "bn-IN",
    "Bahasa Indonesia(id-ID)": "id-ID",
    "Bahasa Melayu(ms-MY)": "ms-MY",
    "Català(ca-ES)": "ca-ES",
    "Čeština(cs-CZ)": "cs-CZ",
    "Dansk(da-DK)": "da-DK",
    "Deutsch(de-DE)": "de-DE",
    "English Australia(en-AU)": "en-AU",
    "English Canada(en-CA)": "en-CA",
    "English India(en-IN)": "en-IN",
    "English Kenya(en-KE)": "en-KE",
    "English Tanzania(en-TZ)": "en-TZ",
    "English Ghana(en-GH)": "en-GH",
    "English New Zealand(en-NZ)": "en-NZ",
    "English Nigeria(en-NG)": "en-NG",
    "English South Africa(en-ZA)": "en-ZA",
    "English Philippines(en-PH)": "en-PH",
    "English United Kingdom(en-GB)": "en-GB",
    "English United States(en-US)": "en-US",
    "Español Argentina(es-AR)": "es-AR",
    "Español Bolivia(es-BO)": "es-BO",
    "Español Chile(es-CL)": "es-CL",
    "Español Colombia(es-CO)": "es-CO",
    "Español Costa Rica(es-CR)": "es-CR",
    "Español Ecuador(es-EC)": "es-EC",
    "Español El Salvador(es-SV)": "es-SV",
    "Español España(es-ES)": "es-ES",
    "Español Estados Unidos(es-US)": "es-US",
    "Español Guatemala(es-GT)": "es-GT",
    "Español Honduras(es-HN)": "es-HN",
    "Español México(es-MX)": "es-MX",
    "Español Nicaragua(es-NI)": "es-NI",
    "Español Panamá(es-PA)": "es-PA",
    "Español Paraguay(es-PY)": "es-PY",
    "Español Perú(es-PE)": "es-PE",
    "Español Puerto Rico(es-PR)": "es-PR",
    "Español República Dominicana(es-DO)": "es-DO",
    "Español Uruguay(es-UY)": "es-UY",
    "Español Venezuela(es-VE)": "es-VE",
    "Euskara(eu-ES)": "eu-ES",
    "Filipino(fil-PH)": "fil-PH",
    "Français(fr-FR)": "fr-FR",
    "Basa Jawa(jv-ID)": "jv-ID",
    "Galego(gl-ES)": "gl-ES",
    "ગુજરાતી(gu-IN)": "gu-IN",
    "Hrvatski(hr-HR)": "hr-HR",
    "IsiZulu(zu-ZA)": "zu-ZA",
    "Íslenska(is-IS)": "is-IS",
    "Italiano Italia(it-IT)": "it-IT",
    "Italiano Svizzera(it-CH)": "it-CH",
    "ಕನ್ನಡ(kn-IN)": "kn-IN",
    "ភាសាខ្មែរ(km-KH)": "km-KH",
    "Latviešu(lv-LV)": "lv-LV",
    "Lietuvių(lt-LT)": "lt-LT",
    "മലയാളം(ml-IN)": "ml-IN",
    "मराठी(mr-IN)": "mr-IN",
    "Magyar(hu-HU)": "hu-HU",
    "ລາວ(lo-LA)": "lo-LA",
    "Nederlands(nl-NL)": "nl-NL",
    "नेपाली भाषा(ne-NP)": "ne-NP",
    "Norsk bokmål(nb-NO)": "nb-NO",
    "Polski(pl-PL)": "pl-PL",
    "Português Brasil(pt-BR)": "pt-BR",
    "Português Portugal(pt-PT)": "pt-PT",
    "Română(ro-RO)": "ro-RO",
    "සිංහල(si-LK)": "si-LK",
    "Slovenščina(sl-SI)": "sl-SI",
    "Basa Sunda(su-ID)": "su-ID",
    "Slovenčina(sk-SK)": "sk-SK",
    "Suomi(fi-FI)": "fi-FI",
    "Svenska(sv-SE)": "sv-SE",
    "Kiswahili Tanzania(sw-TZ)": "sw-TZ",
    "Kiswahili Kenya(sw-KE)": "sw-KE",
    "ქართული(ka-GE)": "ka-GE",
    "Հայերեն(hy-AM)": "hy-AM",
    "தமிழ் இந்தியா(ta-IN)": "ta-IN",
    "தமிழ் சிங்கப்பூர்(ta-SG)": "ta-SG",
    "தமிழ் இலங்கை(ta-LK)": "ta-LK",
    "தமிழ் மலேசியா(ta-MY)": "ta-MY",
    "తెలుగు(te-IN)": "te-IN",
    "Tiếng Việt(vi-VN)": "vi-VN",
    "Türkçe(tr-TR)": "tr-TR",
    "اُردُو پاکستان(ur-PK)": "ur-PK",
    "اُردُو بھارت(ur-IN)": "ur-IN",
    "Ελληνικά(el-GR)": "el-GR",
    "български(bg-BG)": "bg-BG",
    "Pусский(ru-RU)": "ru-RU",
    "Српски(sr-RS)": "sr-RS",
    "Українська(uk-UA)": "uk-UA",
    "한국어(ko-KR)": "ko-KR",
    "中文 普通话 (中国大陆)(cmn-Hans-CN)": "cmn-Hans-CN",
    "中文 普通话 (香港)(cmn-Hans-HK)": "cmn-Hans-HK",
    "中文 中文 (台灣)(cmn-Hant-TW)": "cmn-Hant-TW",
    "中文 粵語 (香港)(yue-Hant-HK)": "yue-Hant-HK",
    "日本語(ja-JP)": "ja-JP",
    "हिन्दी(hi-IN)": "hi-IN",
    "ภาษาไทย(th-TH)": "th-TH",

} as const
export type SpeechRecognitionLanguages = typeof SpeechRecognitionLanguages[keyof typeof SpeechRecognitionLanguages];
