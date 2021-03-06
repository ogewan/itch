import { Package, PackageLike } from "./package";
import { join } from "path";

import { IStore } from "common/types";
import { app } from "electron";
import { actions } from "common/actions";
import { SelfPackage } from "./self-package";
import env from "common/env";

const regularPackageNames = ["butler", "itch-setup"];
const packageNames = [env.appName, ...regularPackageNames];

export class Manager {
  private pkgs: PackageLike[] = [];
  private prefix: string;

  constructor(store: IStore) {
    this.prefix = join(app.getPath("userData"), "broth");

    store.dispatch(actions.packagesListed({ packageNames }));
    this.pkgs.push(new SelfPackage(store, env.appName));
    for (const name of regularPackageNames) {
      this.pkgs.push(new Package(store, this.prefix, name));
    }
  }

  async ensure() {
    for (const pkg of this.pkgs) {
      await pkg.ensure();
    }
  }

  async upgrade() {
    for (const pkg of this.pkgs) {
      await pkg.upgrade();
    }
  }
}
