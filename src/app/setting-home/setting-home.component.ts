import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as os from 'os';

import { Proxy } from '../model/proxy';

import { ApiManager } from './../services/api-manager';
import { CommonService } from './../services/common-service';
import { NotificationManagerService } from './../services/notification-manager.service';
import { LookupManagerService } from '../services/lookup-manager.service';
import { SettingsHandlerService } from './../services/settings-handler.service';

@Component({
  selector: 'app-setting-home',
  templateUrl: './setting-home.component.html',
  styleUrls: ['./setting-home.component.css']
})

export class SettingHomeComponent implements OnInit {

  public settingsForm: FormGroup;
  public addProxiesForm: FormGroup;
  public proxyList: Array<Proxy>;
  public readonly buyProxyUrl = 'https://www.google.com';
  public readonly proxyPlaceholder = 'IP:PORT:USER:PASS';
  public helpTextMessages = {};

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private apiManager: ApiManager,
    private settingsHandlerService: SettingsHandlerService,
    public commonService: CommonService,
    private lookupManager: LookupManagerService,
    private notificationManagerService: NotificationManagerService
  ) { }

  ngOnInit() {
    this.initLabels();
    this.initSettings();
    this.initAddProxies();
    this.getProxyList();
  }

  private initLabels() {
    const _lookups = this.lookupManager.getLookupData();
    this.helpTextMessages = _lookups['helpTextMessages'];
  }

  private initSettings() {
    this.settingsForm = this.fb.group({
      'monitorDelay': [this.settingsHandlerService.getMonitorDelay() || '', Validators.compose([Validators.required])],
      'errorDelay': [this.settingsHandlerService.getErrorDelay() || '', Validators.compose([Validators.required])],
      'useProxy' : [(this.settingsHandlerService.getUseProxy() === false || this.settingsHandlerService.getUseProxy() === true) ? this.settingsHandlerService.getUseProxy() : true]
    });
  }

  private initAddProxies() {
    this.addProxiesForm = this.fb.group({
      'proxyList': ['', Validators.compose([Validators.required])]
    });
  }

  private getProxyList() {
    this.proxyList = this.settingsHandlerService.getProxyList();
  }

  public saveSettings() {
    if (this.settingsForm.invalid) {
      console.log('ERROR: SETTINGS_DATA_IS_INVALID');
      this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['invalid-form-error-message'], dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
    } else {
      this.apiManager.fetchData(
        'nodeServer',
        'settings',
        { 'Content-Type': 'application/json' },
        ApiManager.requestName.POST,
        this.settingsForm.value,
        (res) => {
          console.log('API_CALL_SUCCESS: SETTINGS_SAVED');
          this.settingsHandlerService.setMonitorDelay(res.monitorDelay);
          this.settingsHandlerService.setErrorDelay(res.errorDelay);
          this.settingsHandlerService.setUseProxy(res.useProxy);
          this.initSettings();
        },
        (error) => {
          console.log('API_CALL_FAILURE: UNABLE_TO_SAVE_SETTINGS');
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Unable to update Settings.', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
          return error;
        }
      );
    }
  }

  public addProxy() {
    if (this.addProxiesForm.invalid) {
      console.log('ERROR: PROXY_INPUT_IS_INVALID');
      this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['invalid-form-error-message'], dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
    } else {
      let _proxyList = this.addProxiesForm.value.proxyList.split(/\r\n|\n/g);
      let proxyList = new Array();
      for (let _i = 0; _i < _proxyList.length; _i++) {
        _proxyList[_i] = _proxyList[_i].replace(/^\s+|\s+$/g, '');
        if (_proxyList[_i] !== '') {
          var formattedProxy = this.getFormattedProxy(_proxyList[_i]);
          if (formattedProxy) {
            proxyList.push({
              'proxyUrl': formattedProxy
            });
          }
        }
      }
      if (proxyList && proxyList.length) {
        this.apiManager.fetchData(
          'nodeServer',
          'proxy',
          { 'Content-Type': 'application/json' },
          ApiManager.requestName.POST,
          proxyList,
          (res) => {
            console.log('API_CALL_SUCCESS: PROXY_ADDED');
            this.initAddProxies();
            this.settingsHandlerService.setProxyList(res.proxyList);
            this.getProxyList();
          },
          (error) => {
            console.log('API_CALL_FAILURE: UNABLE_TO_ADD_PROXY');
            this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Failed to add Proxy(ies).', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
            return error;
          }
        );
      } else {
        console.log('ERROR: PROXY_INPUT_IS_INVALID');
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['invalid-form-error-message'], dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
      }
    }
  }

  public removeProxy(proxyId?) {
    let queryParams: Map<string, string> = new Map();
    if (proxyId) {
      queryParams.set('filterType', 'deleteById');
      queryParams.set('filterValue', proxyId);
    } else {
      queryParams.set('filterType', 'deleteAll');
      queryParams.set('filterValue', undefined);
    }
    this.apiManager.fetchData(
      'nodeServer',
      'deleteProxy',
      { 'Content-Type': 'application/json' },
      ApiManager.requestName.GET,
      {},
      (res) => {
        console.log('API_CALL_SUCCESS: PROXY_REMOVED');
        this.settingsHandlerService.setProxyList(res.proxyList);
        this.getProxyList();
      },
      (error) => {
        console.log('API_CALL_FAILURE: UNABLE_TO_REMOVE_PROXY');
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Failed to delete selected Proxy.', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
        return error;
      },
      queryParams
    );
  }

  public export() {
    const proxyList = this.settingsHandlerService.getProxyList();
    let _proxyList = '';
    for (const _proxy of proxyList) {
      _proxyList += _proxy['proxyUrl'] + os.EOL;
    }
    this.commonService.saveFile(_proxyList, this.modalService);
  }

  public getFormattedProxy(proxy) {
    if(proxy){
      var proxyArray = proxy.split(':');
      var object = {};
      object['ip'] = proxyArray[0];
      object['port'] = proxyArray[1];
      object['user'] = proxyArray[2];
      object['pass'] = proxyArray[3];
      switch(proxyArray.length){
        case 2:
        return 'http://' + object['ip'] + ':' + object['port'];
        case 4:
        return 'http://' + object['user'] + ':' + object['pass'] + '@' + object['ip'] + ':' + object['port'];
        default:
        return undefined;
      }
    }
    return undefined;
  }
}



// WEBPACK FOOTER //
// ./src/app/setting-home/setting-home.component.ts