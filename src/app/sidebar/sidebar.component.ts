import { Component, OnInit } from '@angular/core';

import { ElectronService } from 'ngx-electron';

import { NotificationManagerService } from '../services/notification-manager.service';
import { CommonService } from '../services/common-service';
import { CommunicationService } from '../services/communication-service';
import { LookupManagerService } from '../services/lookup-manager.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})

export class SideBarComponent implements OnInit {

  private subscriber;
  private windowManager: any;

  private proxyTesterURL: any;
  private youtubeURL: any;

  private proxyTesterTitle: any = 'ROCKETAIO: Proxy Tester';
  private youtubeTitle: any = 'ROCKETAIO: YouTube';

  private resetSessionStatusMessages;

  constructor(
    private _electronservice: ElectronService,
    private notificationManagerService: NotificationManagerService,
    private commonService: CommonService,
    private commService: CommunicationService,
    private lookupManager: LookupManagerService
  ) { }

  ngOnInit() {
    this.initLabels();

    this.windowManager = this._electronservice.remote.require('electron-window-manager');
    this.windowManager.templates.set('smallWindow', {
      'height': 600,
      'width': 1024,
      'min-width': 600,
      'resizable': true,
      'frame': true,
      'title': 'ROCKETAIO',
      'webPreferences': {
        'devTools': false
      },
      'onLoadFailure': function () {
        console.log('WIN_LOAD_FAILURE_ERROR');
      },
      'showDevTools': false,
      'menu': null,
    });

    const basepath = this._electronservice.remote.app.getAppPath();
    this.proxyTesterURL = 'file://' + basepath + '/dist/index.html#/proxyTester';
    this.youtubeURL = 'https://www.youtube.com';

    this.subscriber = this.commService.messages.subscribe((msg) => {
      if (msg['room'] === 'session') {
        this.updateSessionStatus(msg['data']);
      }
    });
  }

  private initLabels() {
    const lookups = this.lookupManager.getLookupData();
    this.resetSessionStatusMessages = lookups['resetSessionStatus'];
  }

  private updateSessionStatus(_sessionRoomMessage) {
    if (typeof (_sessionRoomMessage) === 'string' && _sessionRoomMessage.match(/RESET_SESSION/)) {
      const _messageType = _sessionRoomMessage.toLowerCase().includes('success');
      this.showNotification(
        _messageType ? this.resetSessionStatusMessages[1]['statusMessage'] : this.resetSessionStatusMessages[0]['statusMessage'],
        _messageType ? 'success' : 'warning'
      );
    }
  }

  private showNotification(_message, _messageType) {
    this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'global', message: _message, dismissible: true, type: _messageType }, this.notificationManagerService.getNotificationTimeOut());
  }

  public proxyTesterBtn() {
    const proxyTestWindow = this.windowManager.createNew('proxyTester', this.proxyTesterTitle, this.proxyTesterURL, 'smallWindow');
    proxyTestWindow.open();
  }

  public ytWindowBtn() {
    const youtubeWindow = this.windowManager.createNew('youtube', this.youtubeTitle, this.youtubeURL, 'smallWindow');
    youtubeWindow.open();
  }

  public captchaWindowBtn() {
    this.commonService.showCaptchaWindow();
  }
  // public captchaBank(){
  //   this.commonService.showCaptchaBankWindow();
  // }
  public resetSession() {
    this.commService.sendMessage({ 'room': 'reset', 'msg': 'RESET_SESSION' });
  }

}



// WEBPACK FOOTER //
// ./src/app/sidebar/sidebar.component.ts