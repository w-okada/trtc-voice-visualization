import React, { useContext } from "react";
import { ReactNode } from "react";
import { SpeechRecognitionStateAndMethod, useSpeechRecognition } from "../002_hooks/101_useSpeechRecognition";

type Props = {
    children: ReactNode;
};

interface AppStateValue {
    speechRecognitionState: SpeechRecognitionStateAndMethod
}

const AppStateContext = React.createContext<AppStateValue | null>(null);
export const useAppState = (): AppStateValue => {
    const state = useContext(AppStateContext);
    if (!state) {
        throw new Error("useAppState must be used within AppStateProvider");
    }
    return state;
};

export const AppStateProvider = ({ children }: Props) => {
    const speechRecognitionState = useSpeechRecognition()

    const providerValue = {
        speechRecognitionState
    };

    return <AppStateContext.Provider value={providerValue}>{children}</AppStateContext.Provider>;
};
