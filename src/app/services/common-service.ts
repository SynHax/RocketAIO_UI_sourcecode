import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ElectronService } from 'ngx-electron';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';

import { NoUpdateModalComponent } from '../no-update-modal/no-update-modal.component';
import { DownloadUpdateModalComponent } from '../download-update-modal/download-update-modal.component';
@Injectable()
export class CommonService {

  public appDetails = {
    appVersion: new ElectronService().remote.app.getVersion()
  };

  public alertVar = new ElectronService().remote.dialog;
  public remote = new ElectronService().remote;
  public autoUpdater = this.remote.autoUpdater;
  private updateDev = 'http://localhost:3000/update';
  private updateProd = 'https://rocketaio.io/download';
  private updateURl = this.updateProd;

  public activated: boolean = null;
  public isSplashDataLoaded: boolean = null;
  public productKey = '';
  public firstName = '';
  public lastName = '';

  private headerlistener = new Subject<any>();
  private taskHomeListener = new Subject<any>();

  public isProxyStatusSubscriptorActive = false;
  public proxyStatusSubscriptorCount = 0;
  public isProxyTimeSubscriptorActive = false;
  public proxyTimeSubscriptorCount = 0;

  public listen(listenerType): Observable<any> {
    if (listenerType === 'header') {
      return this.headerlistener.asObservable();
    } else if (listenerType === 'taskHome') {
      return this.taskHomeListener.asObservable();
    }
  }

  public filter(listenerType, filterData) {
    if (listenerType === 'header') {
      this.headerlistener.next(filterData);
    } else if (listenerType === 'taskHome') {
      this.taskHomeListener.next(filterData);
    }
  }

  public openFile(callback, modalService) {
    let fs = this.remote.require('fs');
    this.alertVar.showOpenDialog(
      null,
      {
        title: 'ROCKETAIO: Import',
        defaultPath: '~\Desktop',
        filters: [
          { name: 'Json', extensions: ['json'] }
        ],
        properties: ['openFile']
      }, function (fileNames) {
        if (fileNames === undefined) {
          const modalRef = modalService.open(AlertModalComponent, {
            backdrop: 'static',
            backdropClass: 'modal-backdrop--custom light-gray-backdrop',
            centered: true,
            keyboard: false,
            windowClass: 'modal-window--custom'
          });
          modalRef.componentInstance.alert = {
            title: 'ROCKETAIO: IMPORT',
            message: 'No File Selected.',
            class: 'alert-warning ',
            isDismissible: true,
            hasCloseButton: true
          };
          return;
        }
        const fileName = fileNames[0];
        fs.readFile(fileName, 'utf-8', function (error, data) {
          if (error) {
            console.log('FILE_READ_FAILURE');
          } else {
            console.log('FILE_READ_SUCCESS');
            callback(data);
          }
        });
      }
    );
  }

  public saveFile(body, modalService, callback?) {
    let remoteF = new ElectronService().remote;
    let fs = remoteF.require('fs');
    this.alertVar.showSaveDialog(
      null,
      {
        title: 'ROCKETAIO: Export',
        defaultPath: remoteF.app.getPath('desktop'),
        filters: [
          { name: 'Json', extensions: ['json'] }
        ],
      }, function (fileName) {
        if (fileName === undefined) {
          const modalRef = modalService.open(AlertModalComponent, {
            backdrop: 'static',
            backdropClass: 'modal-backdrop--custom light-gray-backdrop',
            centered: true,
            keyboard: false,
            windowClass: 'modal-window--custom'
          });
          modalRef.componentInstance.alert = {
            title: 'ROCKETAIO: EXPORT',
            message: 'File was not saved successfully.',
            class: 'alert-warning ',
            isDismissible: true,
            hasCloseButton: true
          };
          return;
        }
        fs.writeFile(fileName, body, function (error) {
          if (error) {
            console.log('FILE_WRITE_FAILURE');
          } else {
            console.log('FILE_WRITE_SUCCESS');
            if (callback) {
              callback();
            }
          }
        });
      }
    );
  }

  public openExternal(url: string) {
    new ElectronService().shell.openExternal(url);
  }

  public windowSizeHandler() {
    new ElectronService().ipcRenderer.send('windowSizeToggle');
  }

  public showCaptchaWindow() {
    new ElectronService().ipcRenderer.send('showCaptchaWindow');
  }
  public showCaptchaBankWindow() {
    new ElectronService().ipcRenderer.send('showCaptchaBankWindow');
  }
  public hideCaptchaWindow() {
    new ElectronService().ipcRenderer.send('hideAndRemoveCaptcha');
  }

  public removeCaptcha() {
    new ElectronService().ipcRenderer.send('removeCaptcha');
  }

  public installUpdate(){
    this.autoUpdater.quitAndInstall();
  }
  public checkUpdate(modalService) {
    this.autoUpdater.setFeedURL(this.updateURl);
    this.autoUpdater.checkForUpdates();

    this.autoUpdater.once('update-not-available', (event, arg) => {
      console.log("no update available")
      const modalRef = modalService.open(NoUpdateModalComponent, {
        backdrop: 'static',
        backdropClass: 'modal-backdrop--custom light-gray-backdrop',
        centered: true,
        keyboard: false,
        windowClass: 'modal-window--custom'
      });
    });

    this.autoUpdater.once('update-available', (event, arg) => {
      console.log("Update available")
      // const modalRef = modalService.open(UpdateAvailableModalComponent, {
      //   backdrop: 'static',
      //   backdropClass: 'modal-backdrop--custom light-gray-backdrop',
      //   centered: true,
      //   keyboard: false,
      //   windowClass: 'modal-window--custom'
      // });
    });

    this.autoUpdater.once('update-downloaded', (event, arg) => {
      console.log("update downloaded")
      const modalRef = modalService.open(DownloadUpdateModalComponent, {
        backdrop: 'static',
        backdropClass: 'modal-backdrop--custom light-gray-backdrop',
        centered: true,
        keyboard: false,
        windowClass: 'modal-window--custom'
      });
    });

    this.autoUpdater.once('error', (error) => {
      console.log("Error While Updating")
    });

  }

}



// WEBPACK FOOTER //
// ./src/app/services/common-service.ts