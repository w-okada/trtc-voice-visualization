import React, { useContext } from "react";
import { ReactNode } from "react";
import { DeviceManagerStateAndMethod, useDeviceManager } from "../002_hooks/001_useDeviceManager";


export const ApplicationMode = {
    "VoiceChanger": "VoiceChanger",
    "Trainer": "Trainer",
    "Recorder": "Recorder",
} as const
export type ApplicationMode = typeof ApplicationMode[keyof typeof ApplicationMode]

type Props = {
    children: ReactNode;
};

type AppSettingValue = {
    deviceManagerState: DeviceManagerStateAndMethod;
};

const AppSettingContext = React.createContext<AppSettingValue | null>(null);
export const useAppSetting = (): AppSettingValue => {
    const state = useContext(AppSettingContext);
    if (!state) {
        throw new Error("useAppSetting must be used within AppSettingProvider");
    }
    return state;
};

export const AppSettingProvider = ({ children }: Props) => {
    const deviceManagerState = useDeviceManager();


    const providerValue = {
        deviceManagerState,
    };

    return <AppSettingContext.Provider value={providerValue}> {children} </AppSettingContext.Provider>;
};
