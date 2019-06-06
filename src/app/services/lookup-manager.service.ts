import { Injectable } from '@angular/core';

@Injectable()
export class LookupManagerService {

  private lookupData;
  private statusCodes;
  private storeList;

  constructor() { }

  public setLookupData(lookupData) {
    this.lookupData = lookupData;
    return this.lookupData;
  }

  public getLookupData() {
    return this.lookupData;
  }

  public setStatusCodes(statusCodes) {
    this.statusCodes = statusCodes;
    return this.statusCodes;
  }

  public getStatusCodes() {
    return this.statusCodes;
  }

  public setStoreList(storeList) {
    this.storeList = storeList;
    return this.storeList;
  }

  public getStoreList() {
    return this.storeList;
  }

}



// WEBPACK FOOTER //
// ./src/app/services/lookup-manager.service.ts