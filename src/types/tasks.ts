
import Game from "../db/models/game";
import Cave from "../db/models/cave";

import {
  IUploadRecord,
  IUpgradePathItem,
  IManifestAction,
  IEnvironment,
} from ".";

import {Logger} from "../logger";

export type DownloadReason = "install" | "reinstall" | "update" | "revert" | "heal";

export type InstallReason = "install" | "reinstall" | "heal";

export interface IQueueDownloadOpts {
  /** reason for starting this download */
  reason: DownloadReason;

  /**
   * game record at the time the download started - in case we're downloading
   * something that's not cached locally.
   */
  game: Game;

  /**    
   * identifier of the cave this download was started for
   */
  caveId?: string;

  /** upload we're downloading */
  upload: IUploadRecord;

  /** total size of download (size of archive or sum of patch sizes) */
  totalSize?: number;

  /** true if wharf-enabled update via butler */
  incremental?: boolean;

  /** patch entries to upgrade to latest via butler */
  upgradePath?: IUpgradePathItem[];

  /** if true, user disambiguated from list of uploads */
  handPicked?: boolean;
}

export interface IDownloadResult {
  /** where on disk the file was downloaded to */
  archivePath: string | null;
}

export type TaskName = "install" | "uninstall" | "configure" | "launch";

export interface IStartTaskOpts {
  /** id of the game this task is for */
  gameId: number;

  /** the name of the task we're running */
  name: TaskName;
}

export interface IQueueInstallOpts {
  reason: InstallReason;

  /** the game we're installing */
  game: Game;

  /** set if we're reinstalling */
  caveId: string;

  /** which upload we're installing */
  upload: IUploadRecord;

  /** true if the upload was hand-picked amongst several options */
  handPicked: boolean;

  /** file to install from */
  archivePath: string;

  /** id of install location to install in */
  installLocation: string;
}

export interface IQueueUninstallOpts {
  /** which cave we're uninstalling */
  caveId: string;
}

export interface IQueueLaunchOpts {
  /** which cave we're launching */
  caveId: string;
}

export interface ILaunchOpts {
  hasManifest: boolean;
  manifestAction?: IManifestAction;

  env: IEnvironment;
  args: string[];
  logger: Logger;
  cave: Cave;
  game: Game;
}
