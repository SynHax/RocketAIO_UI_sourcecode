import { Component, OnInit } from '@angular/core';

import { CommonService } from '../services/common-service';
import { ApiManager } from '../services/api-manager';
import { NotificationManagerService } from '../services/notification-manager.service';

@Component({
  selector: 'app-activation-screen',
  templateUrl: './activation-screen.component.html',
  styleUrls: ['./activation-screen.component.css']
})

export class ActivationScreenComponent implements OnInit {

  public isActivating = false;

  constructor(
    public commonService: CommonService,
    private apiManager: ApiManager,
    private notificationManagerService: NotificationManagerService
  ) { }

  ngOnInit() {
    this.commonService.hideCaptchaWindow();
    this.apiManager.fetchData(
      'nodeServer',
      'deleteLicense',
      {},
      ApiManager.requestName.POST,
      {},
      (res) => {
        console.log('API_CALL_SUCCESS: LICENSE_DEACTIVATION_SUCCESS');
        if (res.deactivateSuccess) {
          this.apiManager.fetchData(
            'nodeServer',
            'resetState',
            {},
            ApiManager.requestName.GET,
            undefined,
            (res) => {
              console.log('API_CALL_FAILURE: RESET_APP_DATA_SUCCESS');
              this.commonService.productKey = '';
              this.commonService.firstName = '';
              this.commonService.lastName = '';
              this.commonService.activated = false;
              this.commonService.isSplashDataLoaded = false;
            },
            (error) => {
              console.log('API_CALL_FAILURE: LICENSE_DEACTIVATED_BUT_FAILED_TO_RESET_APP_DATA');
              this.commonService.productKey = '';
              this.commonService.firstName = '';
              this.commonService.lastName = '';
              this.commonService.activated = false;
              this.commonService.isSplashDataLoaded = false;
              return error;
            }
          );
        } else {
          console.log('UNEXPECTED_ERROR_OCCURED');
        }
      }, (error) => {
        console.log('API_CALL_FAILURE: LICENSE_DEACTIVATION_FAILURE');
        return error;
      }
    );
  }

  activate() {
    this.isActivating = true;
    if (this.commonService.productKey !== '') {
      this.apiManager.fetchData(
        'nodeServer',
        'license',
        { 'Content-Type': 'application/json' },
        ApiManager.requestName.POST,
        {
          'licenseKey': this.commonService.productKey
        },
        (res) => {
          console.log('API_CALL_SUCCESS: LICENSE_ACTIVATION_API_SUCCESS');
          this.isActivating = false;
          if (res.activated) {
            this.commonService.activated = res.activated;
            this.commonService.firstName = res.firstName;
            this.commonService.lastName = res.lastName;
          } else {
            this.commonService.activated = false;
            if (res && res.message) {
              this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'global', message: res.message, dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
            }
          }
        }, (error) => {
          console.log('API_CALL_FAILURE: LICENSE_ACTIVATION_API_ERROR');
          this.isActivating = false;
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

}



// WEBPACK FOOTER //
// ./src/app/activation-screen/activation-screen.component.ts