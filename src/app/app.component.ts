import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/do';

import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';

import { CommonService } from './services/common-service';
import { ApiManager } from './services/api-manager';
import { NotificationManagerService } from './services/notification-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  public hasLicenseResponse = false;

  constructor(
    private config: NgbTooltipConfig,
    public commonService: CommonService,
    private apiManager: ApiManager,
    private notificationManagerService: NotificationManagerService
  ) {
    config.placement = 'right';
    config.triggers = 'hover';
  }

  ngOnInit() {
    this.apiManager.fetchData(
      'nodeServer',
      'license',
      { 'Content-Type': 'application/json' },
      ApiManager.requestName.GET,
      undefined,
      (res) => {
        console.log('API_CALL_SUCCESS: PROFILE_FETCH_SUCCESS');
        this.hasLicenseResponse = true;
        if (res && res.activated) {
          this.commonService.firstName = res.firstName;
          this.commonService.lastName = res.lastName;
          this.commonService.activated = res.activated;
        } else {
          this.commonService.activated = false;
          if (res && res['message']) {
            this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'global', message: res['message'], dismissible: true, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
          }
        }
      }, (error) => {
        console.log('API_CALL_FAILURE: UNABLE_TO_FETCH_PROFILE');
        this.hasLicenseResponse = true;
        this.commonService.activated = false;
        if (error && error['error'] && error['error']['message']) {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'global', message: error['error']['message'], dismissible: true, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
        } else if (error && error['message']) {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'global', message: error['message'], dismissible: true, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
        } else {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'global', message: 'Unexpected Error Occured.', dismissible: true, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
        }
        return error;
      }
    );
  }

}



// WEBPACK FOOTER //
// ./src/app/app.component.ts