import { Component, OnInit } from '@angular/core';

import { CommonService } from '../services/common-service';
import { ApiManager } from '../services/api-manager';
import { ProfileHandlerService } from '../services/profile-handler.service';
import { SettingsHandlerService } from '../services/settings-handler.service';
import { LookupManagerService } from '../services/lookup-manager.service';
import { NotificationManagerService } from '../services/notification-manager.service';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.css']
})

export class SplashScreenComponent implements OnInit {

  private isProfileListLoaded = false;
  private isSettingListLoaded = false;
  private isStoreListLoaded = false;
  private isInitLabelsLoaded = false;
  private isInitStatusListLoaded = false;

  private currentMilli: number = new Date().getMilliseconds();

  constructor(
    public commonService: CommonService,
    private apiManager: ApiManager,
    private profileHandlerService: ProfileHandlerService,
    private settingsHandlerService: SettingsHandlerService,
    private lookupManager: LookupManagerService,
    private notificationManagerService: NotificationManagerService
  ) { }

  ngOnInit() {
    this.commonService.isSplashDataLoaded = false;
    this.fetchProfileList();
    this.fetchSettingList();
    this.initStoreList();
    this.initLookups();
    this.initStatusList();
  }

  private fetchProfileList() {
    this.apiManager.fetchData(
      'nodeServer',
      'fetchProfiles',
      { 'Content-Type': 'application/json' },
      ApiManager.requestName.GET,
      {},
      (res) => {
        console.log('API_CALL_SUCCESS: PROFILE_LOAD_SUCCESS');
        this.profileHandlerService.setProfileList(res);
        this.isProfileListLoaded = true;
        this.splashDataLoaded();
      }, (error) => {
        console.log('API_CALL_FAILURE: PROFILE_LOAD_FAILURE');
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'global', message: 'Corrupted Data Encountered: Try re-installing the application.', dismissible: true, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
        return error;
      }
    );
  }

  private fetchSettingList() {
    this.apiManager.fetchData(
      'nodeServer',
      'settings',
      { 'Content-Type': 'application/json' },
      ApiManager.requestName.GET,
      {},
      (res) => {
        console.log('API_CALL_SUCCESS: SETTINGS_LOAD_SUCCESS');
        this.settingsHandlerService.setSettings(res);
        this.isSettingListLoaded = true;
        this.splashDataLoaded();
      },
      (error) => {
        console.log('APT_CALL_FAILURE: SETTINGS_LOAD_FAILURE');
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'global', message: 'Corrupted Data Encountered: Try re-installing the application.', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
        return error;
      }
    );
  }

  private initStoreList() {
    this.apiManager.fetchData(
      'nodeServer',
      'storeListJson',
      {},
      ApiManager.requestName.JSON,
      undefined,
      (res) => {
        console.log('API_CALL_SUCCESS: STORE_LIST_LOAD_SUCCESS');
        if (res && res['lookups']) {
          this.lookupManager.setStoreList(res['lookups']['storeList']);
          this.isStoreListLoaded = true;
          this.splashDataLoaded();
        } else {
          console.log('ERROR: STORE_LIST_UNACCEPTABLE_FORMAT');
          this.lookupManager.setStoreList([]);
          this.isStoreListLoaded = true;
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'global', message: 'Corrupted Application Store Data Found: Application may run in broken mode.', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
          this.splashDataLoaded();
        }
      }, (error) => {
        console.log('API_CALL_FAILURE: STORE_LIST_LOAD_FAILURE');
        this.lookupManager.setStoreList([]);
        this.isStoreListLoaded = true;
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'global', message: 'Corrupted Application Store Data Found: Application may run in broken mode.', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        this.splashDataLoaded();
        return error;
      }
    );
  }

  private initLookups() {
    this.apiManager.fetchData(
      'nodeServer',
      'langJson',
      {},
      ApiManager.requestName.JSON,
      undefined,
      (res) => {
        console.log('API_CALL_SUCCESS: LANG_DATA_LOAD_SUCCESS');
        if (res && res['lookups']) {
          this.lookupManager.setLookupData(res['lookups']);
          this.isInitLabelsLoaded = true;
          this.splashDataLoaded();
        } else {
          console.log('ERROR: LANG_DATA_UNACCEPTABLE_FORMAT');
          this.lookupManager.setLookupData({});
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'global', message: 'Corrupted Application Language Data Found: Try re-installing the application.', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
        }
      }, (error) => {
        console.log('API_CALL_FAILURE: LANG_DATA_LOAD_FAILURE');
        this.lookupManager.setLookupData({});
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'global', message: 'Corrupted Application Language Data Found: Try re-installing the application.', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
        return error;
      }
    );
  }

  private initStatusList() {
    this.apiManager.fetchData(
      'nodeServer',
      'statusListJson',
      {},
      ApiManager.requestName.JSON,
      undefined,
      (res) => {
        this.lookupManager.setStatusCodes(res);
        this.isInitStatusListLoaded = true;
        this.splashDataLoaded();
      },
      (error) => {
        console.log('API_CALL_FAILURE: UNABLE_TO_FETCH_STATUS_CODES');
        this.lookupManager.setStatusCodes({});
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'global', message: 'Corrupted Application Data Encountered: Try re-installing the application.', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
        return error;
      }
    );
  }

  private splashDataLoaded() {
    const splashTime = 1000;
    if (
      this.isProfileListLoaded && this.isSettingListLoaded &&
      this.isInitLabelsLoaded && this.isInitStatusListLoaded &&
      this.isStoreListLoaded
    ) {
      if (this.currentMilli - splashTime >= 0) {
        this.commonService.isSplashDataLoaded = true;
      } else {
        setTimeout(() => {
          this.commonService.isSplashDataLoaded = true;
        }, splashTime - this.currentMilli);
      }
    }
  }

}



// WEBPACK FOOTER //
// ./src/app/splash-screen/splash-screen.component.ts