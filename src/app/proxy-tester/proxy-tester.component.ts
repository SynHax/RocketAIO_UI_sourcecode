import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import { ApiManager } from './../services/api-manager';
import { CommunicationService } from './../services/communication-service';
import { CommonService } from '../services/common-service';
import { LookupManagerService } from './../services/lookup-manager.service';
import { SettingsHandlerService } from './../services/settings-handler.service';

@Component({
  selector: 'app-proxy-tester',
  templateUrl: './proxy-tester.component.html',
  styleUrls: ['./proxy-tester.component.css']
})

export class ProxyTesterComponent implements OnInit, OnDestroy {

  private subscriber;
  public proxyList: any;
  private proxyStatusLookups: any;
  public proxySiteUrl : FormGroup;
  public isProxyStatusSubscriptorActive = false;
  public isProxyTimeSubscriptorActive = false;
  public proxyStatusSubscriptorCount = 0;
  public proxyTimeSubscriptorCount = 0;

  constructor(
    private cds: ChangeDetectorRef,
    private fb: FormBuilder,
    private apiManager: ApiManager,
    public commonService: CommonService,
    private commService: CommunicationService,
    private lookupManager: LookupManagerService,
    private settingsHandlerService: SettingsHandlerService
  ) { }

  ngOnInit() {
    this.getProxyList();
    this.isProxyStatusSubscriptorActive = this.commonService.isProxyStatusSubscriptorActive || false;
    this.isProxyTimeSubscriptorActive = this.commonService.isProxyTimeSubscriptorActive || false;
    this.proxyStatusSubscriptorCount = this.commonService.proxyStatusSubscriptorCount || 0;
    this.proxyTimeSubscriptorCount = this.commonService.proxyTimeSubscriptorCount || 0;
    this.initLabels();
    this.initAddUrl();
    this.subscriber = this.commService.messages.subscribe((msg) => {
      if (msg['room'] === 'proxy') {
        this.updateProxyStatus(msg['data']);
      }
      if (msg['room'] === 'proxyTime') {
        console.log(msg['data'])
        this.updateProxyTime(msg['data']);
      }
    });
  }

  ngOnDestroy() {
  }

  private initLabels() {
    const lookups = this.lookupManager.getLookupData();
    this.proxyStatusLookups = lookups['proxyStatus'];
  }
  private initAddUrl(){
    this.proxySiteUrl = this.fb.group({
      'url' : ['',Validators.compose([Validators.required])]
    });
  }
  private updateProxyStatus(_proxyRoomMessage) {
    if (_proxyRoomMessage.split(',').length === 2) {
      const proxyId = _proxyRoomMessage.split(',')[1];
      const proxyIndex = this.getIndexWithProxyID(proxyId);
      if (this.proxyList[proxyIndex]) {
        this.commonService.proxyStatusSubscriptorCount = ++ this.proxyStatusSubscriptorCount;
        if (this.proxyStatusSubscriptorCount === this.proxyList.length) {
          this.isProxyStatusSubscriptorActive = false;
          this.proxyStatusSubscriptorCount = 0;
          this.commonService.isProxyStatusSubscriptorActive = this.isProxyStatusSubscriptorActive;
          this.commonService.proxyStatusSubscriptorCount = this.proxyStatusSubscriptorCount;
        }
        this.proxyList[proxyIndex].proxyStatus = _proxyRoomMessage.split(',')[0];
      }
    }
    this.cds.markForCheck();
  }
  private updateProxyTime(_proxyRoomMessage) {
    if (_proxyRoomMessage.split(',').length === 2) {
      const proxyId = _proxyRoomMessage.split(',')[1];
      const proxyIndex = this.getIndexWithProxyID(proxyId);
      if (this.proxyList[proxyIndex]) {
        //console.log(_proxyRoomMessage.split(',')[0]);
        this.commonService.proxyTimeSubscriptorCount = ++ this.proxyTimeSubscriptorCount;
        if (this.proxyTimeSubscriptorCount === this.proxyList.length) {
          this.isProxyTimeSubscriptorActive = false;
          this.proxyTimeSubscriptorCount = 0;
          this.commonService.isProxyTimeSubscriptorActive = this.isProxyTimeSubscriptorActive;
          this.commonService.proxyTimeSubscriptorCount = this.proxyTimeSubscriptorCount;
        }
        this.proxyList[proxyIndex].proxyTime = _proxyRoomMessage.split(',')[0];
      }
    }
    this.cds.markForCheck();
  }
  private getIndexWithProxyID(proxyID) {
    for (let i = 0; i < this.proxyList.length; i++) {
      if (this.proxyList[i].proxyId === proxyID) {
        return i;
      }
    }
    return undefined;
  }

  private getProxyList() {
    this.proxyList = this.settingsHandlerService.getProxyList();
  }

  public getStatusMessageWithCode(statusCode: any) {
    for (let i = 0; i < this.proxyStatusLookups.length; i++) {
      if (this.proxyStatusLookups[i]['statusCode'] === statusCode) {
        return this.proxyStatusLookups[i]['statusMessage'];
       }
    }
    return '';
  }

  public checkProxies() {
    this.isProxyStatusSubscriptorActive = true;
    this.isProxyTimeSubscriptorActive = true;
    this.proxyStatusSubscriptorCount = 0;
    this.commonService.isProxyStatusSubscriptorActive = this.isProxyStatusSubscriptorActive;
    this.commonService.isProxyTimeSubscriptorActive = this.isProxyTimeSubscriptorActive;
    this.commonService.proxyStatusSubscriptorCount = this.proxyStatusSubscriptorCount;
    this.commService.sendMessage({ 'room': 'room', 'msg': 'proxyStatus' });
    this.commService.sendMessage({ 'room': 'room', 'msg': 'proxyTime' });
    this.settingsHandlerService.resetProxyStatus();
    this.apiManager.fetchData(
      'nodeServer',
      'checkProxy',
      { 'Content-Type': 'application/json' },
      ApiManager.requestName.POST,
      {  'siteUrl' : this.proxySiteUrl.value,
         'proxyList': this.proxyList },
      (res) => {
        console.log('API_CALL_SUCCESS: PROXY_STATUS_REFRESHED');

      },
      (error) => {
        console.log('API_CALL_FAILURE: PROXY_STATUS_REFRESH_ERROR');
        return error;
      }
    );
  }

}



// WEBPACK FOOTER //
// ./src/app/proxy-tester/proxy-tester.component.ts