import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("miuixElectron", {
  platform: process.platform,
});
