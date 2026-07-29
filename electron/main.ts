import { app, BrowserWindow, shell } from "electron";
import path from "node:path";

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);

function createWindow() {
  const window = new BrowserWindow({
    width: 1180,
    height: 820,
    // Same floor as the original desktop demo (Main.desktop.kt: 300x600), so the
    // window can be sized down to the official 420x840 phone shape for 1:1
    // comparison — below 840px wide the app switches to the bottom NavigationBar
    // and bottom-attached dialogs, exactly like the Compose demo.
    minWidth: 300,
    minHeight: 600,
    title: "Miuix React",
    backgroundColor: "#f7f7f7",
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#f7f7f7",
      symbolColor: "#303030",
      height: 38,
    },
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    void window.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    void window.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
