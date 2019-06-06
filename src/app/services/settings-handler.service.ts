import { Injectable } from '@angular/core';

import { Settings } from './../model/settings';
import { Proxy } from './../model/proxy';

@Injectable()
export class SettingsHandlerService {

  private settings: Settings;

  constructor() {
    this.settings = new Settings();
    this.settings.proxyList = new Array<Proxy>();
  }

  public getSettings() {
    return this.settings;
  }

  public setSettings(settings) {
    this.settings = settings;
    return this.settings;
  }

  public getMonitorDelay() {
    return this.settings.monitorDelay;
  }

  public setMonitorDelay(monitorDelay) {
    this.settings.monitorDelay = monitorDelay;
    return this.settings.monitorDelay;
  }

  public getErrorDelay() {
    return this.settings.errorDelay;
  }

  public setErrorDelay(errorDelay) {
    this.settings.errorDelay = errorDelay;
    return this.settings.errorDelay;
  }

  public getUseProxy(){
    return this.settings.useProxy;
  }

  public setUseProxy(useProxy){
    this.settings.useProxy = useProxy;
    return this.settings.useProxy;
  }

  public getProxyList() {
    return this.settings.proxyList;
  }

  public setProxyList(proxyList) {
    this.settings.proxyList = proxyList;
    return this.settings.proxyList;
  }

  public resetProxyStatus() {
    for (let proxy of this.settings.proxyList) {
      proxy['proxyStatus'] = undefined;
      proxy['proxyTime'] = undefined;
    }
  }

}



// WEBPACK FOOTER //
// ./src/app/services/settings-handler.service.ts