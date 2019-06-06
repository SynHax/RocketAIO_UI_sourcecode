import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ApiManager {

  public static readonly requestName = {
    GET: 1,
    POST: 2,
    JSON: 3
  };

  public static readonly nodeServer = 'http://localhost:8081';

  public static readonly addTask = '/addTask';
  public static readonly editTask = '/editTask';
  public static readonly removeTask = '/removeTask';
  public static readonly stopTask = '/stopTask';
  public static readonly updateTaskState = '/updateTaskState';
  public static readonly addProfile = '/addProfile';
  public static readonly editProfile = '/editProfile';
  public static readonly fetchProfiles = '/fetchProfiles';
  public static readonly deleteProfileById = '/deleteProfileById';
  public static readonly settings = '/settings';
  public static readonly proxy = '/proxy';
  public static readonly checkProxy = '/checkProxy';
  public static readonly deleteProxy = '/deleteProxy';
  public static readonly license = '/license';
  public static readonly deleteLicense = '/deleteLicense';
  public static readonly resetState = '/resetState';
  public static readonly getTaskSize = '/getTaskSize';
  // Assets Data
  public static readonly langJson = './assets/data/en.json';
  public static readonly storeListJson = './assets/data/storeList.json';
  public static readonly statusListJson = './assets/data/statusList.json';

  constructor(private http: Http) { }

  fetchData(
    baseUrl: string,
    url: string,
    options: any,
    requestType: number,
    body: any,
    successCallback?: any,
    failureCallback?: any,
    queryParams?: Map<any, any>,
  ) {
    let result: Observable<Response>;
    let finalUrl = ApiManager[baseUrl] + ApiManager[url];
    if (queryParams) {
      finalUrl = this.setQueryParams(finalUrl, queryParams);
    }
    const headers = this.getHeaders(options);
    if (requestType === ApiManager.requestName.GET) {
      result = this.http.get(
        finalUrl,
        new RequestOptions({ withCredentials: false, headers: headers })
      );
    } else if (requestType === ApiManager.requestName.POST) {
      result = this.http.post(
        finalUrl,
        body, new RequestOptions({ withCredentials: false, headers: headers })
      );
    } else if (requestType === ApiManager.requestName.JSON) {
      result = this.http.get(
        ApiManager[url],
        new RequestOptions({ withCredentials: false, headers: headers })
      );
    }
    return result.map((res: Response) => {
      return res.json();
    }).subscribe((res) => {
      console.log('API_INTERCEPTOR: SUCCESS');
      successCallback(res);
    }, (error) => {
      console.log('API_INTERCEPTOR: FAILURE');
      failureCallback(error);
      return error;
    });
  }

  getHeaders(options) {
    const headers: Headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Cache-Control', 'no-cache');
    return headers;
  }

  setQueryParams(finalUrl: any, queryParams: Map<any, any>): any {
    let index = 0;
    queryParams.forEach((value, key) => {
      if (index === 0) {
        finalUrl += '?' + key + '=' + value;
      } else {
        finalUrl += '&' + key + '=' + value;
      }
      index++;
    });
    return finalUrl;
  }

}



// WEBPACK FOOTER //
// ./src/app/services/api-manager.ts