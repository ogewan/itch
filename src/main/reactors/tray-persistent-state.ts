import { IStore, IAction } from "common/types";
import { Tray } from "electron";
import { getImagePath } from "common/util/resources";
import * as os from "../os";
import env from "common/env";
import { actions } from "common/actions";

let tray: Electron.Tray;

// used to glue balloon click with notification callbacks
let lastNotificationAction: IAction<any>;

export function getTray(store: IStore): Electron.Tray {
  if (!tray) {
    // cf. https://github.com/itchio/itch/issues/462
    // windows still displays a 16x16, whereas
    // some linux DEs don't know what to do with a @x2, etc.
    let suffix = "";
    if (os.platform() !== "linux") {
      suffix = "-small";
    }

    let base = "white";
    if (os.platform() === "win32" && !/^10\./.test(os.release())) {
      // windows older than 10 get the old colorful tray icon
      base = env.appName;
    }

    const iconName = `${base}${suffix}.png`;
    const iconPath = getImagePath("tray/" + iconName);

    tray = new Tray(iconPath);
    tray.setToolTip(env.appName);
    tray.on("click", () => {
      store.dispatch(actions.focusWindow({ toggle: true }));
    });
    tray.on("double-click", () => {
      store.dispatch(actions.focusWindow({}));
    });
    tray.on("balloon-click", () => {
      if (lastNotificationAction) {
        store.dispatch(lastNotificationAction);
      }
    });
  }
  return tray;
}

export function rememberNotificationAction(action: IAction<any>) {
  lastNotificationAction = action;
}
