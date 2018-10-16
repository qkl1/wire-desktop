/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import {Menu, Tray, app, nativeImage} from 'electron';
import * as path from 'path';

import * as locale from '../../locale/locale';
import * as config from '../config';
import * as lifecycle from '../lifecycle';
import * as windowManager from '../window-manager';

function buildTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    {
      click: () => windowManager.showPrimaryWindow(),
      label: locale.getText('trayOpen'),
    },
    {
      click: async () => lifecycle.quit(),
      label: locale.getText('trayQuit'),
    },
  ]);

  this.trayIcon.on('click', () => windowManager.showPrimaryWindow());
  this.trayIcon.setContextMenu(contextMenu);
  this.trayIcon.setToolTip(config.NAME);
}

function flashApplicationWindow(win, count) {
  if (win.isFocused() || !count) {
    win.flashFrame(false);
  } else if (count > this.lastUnreadCount) {
    win.flashFrame(true);
  }
}

function updateBadgeCount(count) {
  app.setBadgeCount(count);
  this.lastUnreadCount = count;
}

function updateIcons(win, count) {
  if (this.icons) {
    const trayImage = count ? this.icons.trayWithBadge : this.icons.tray;
    this.trayIcon.setImage(trayImage);

    const overlayImage = count ? this.icons.badge : null;
    win.setOverlayIcon(overlayImage, locale.getText('unreadMessages'));
  }
}

class TrayHandler {
  lastUnreadCount: number;
  trayIcon?: Tray;
  icons: {
    badge: nativeImage;
    tray: nativeImage;
    trayWithBadge: nativeImage;
  };

  constructor() {
    this.lastUnreadCount = 0;
  }

  initTray(trayIcon = new Tray(nativeImage.createEmpty())) {
    const IMAGE_ROOT = path.join(app.getAppPath(), 'img');

    const iconPaths = {
      badge: path.join(IMAGE_ROOT, 'taskbar.overlay.png'),
      tray: path.join(IMAGE_ROOT, 'tray-icon', 'tray', 'tray.png'),
      trayWithBadge: path.join(IMAGE_ROOT, 'tray-icon', 'tray-with-badge', 'tray.badge.png'),
    };

    this.icons = {
      badge: nativeImage.createFromPath(iconPaths.badge),
      tray: nativeImage.createFromPath(iconPaths.tray),
      trayWithBadge: nativeImage.createFromPath(iconPaths.trayWithBadge),
    };

    this.trayIcon = trayIcon;
    this.trayIcon.setImage(this.icons.tray);

    buildTrayMenu.call(this);
  }

  showUnreadCount(win, count) {
    updateIcons.call(this, win, count);
    flashApplicationWindow.call(this, win, count);
    updateBadgeCount.call(this, count);
  }
}

export {TrayHandler};