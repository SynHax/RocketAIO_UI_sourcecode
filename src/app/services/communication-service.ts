import { Injectable } from '@angular/core';

import * as Rx from 'rxjs/Rx';
import { Observable, Subject } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';
import * as io from 'socket.io-client';

import { ApiManager } from './api-manager';

@Injectable()
export class CommunicationService {

  private socket;

  public messages: Subject<any>;

  constructor() {
    this.messages = <Subject<any>>this.connect().map((response: any): any => {
      return response;
    });
  }

  private connect(): Rx.Subject<MessageEvent> {
    this.socket = io(ApiManager['nodeServer']);
    let observable = new Observable(observer => {
      this.socket.on('message', (data) => {
        console.log('(TASK) WEBSOCKET_SERVICE_MESSAGE_RECEIVE_SUCCESS');
        const _message = {
          'room': 'task',
          'data': data
        };
        observer.next(_message);
      });
      this.socket.on('proxy', (data) => {
        console.log('(PROXY) WEBSOCKET_SERVICE_MESSAGE_RECEIVE_SUCCESS');
        const _message = {
          'room': 'proxy',
          'data': data
        };
        observer.next(_message);
      });
      this.socket.on('proxyTime', (data) => {
        console.log('(PROXY) WEBSOCKET_SERVICE_MESSAGE_RECEIVE_SUCCESS');
        const _message = {
          'room': 'proxyTime',
          'data': data
        };
        observer.next(_message);
      });
      this.socket.on('session', (data) => {
        console.log('(SESSION) WEBSOCKET_SERVICE_MESSAGE_RECEIVE_SUCCESS');
        const _message = {
          'room': 'session',
          'data': data
        };
        observer.next(_message);
      });
      this.socket.on('notify', (data) => {
        console.log('(NOTIFY) WEBSOCKET_SERVICE_MESSAGE_RECEIVE_SUCCESS');
        const _message = {
          'room': 'notify',
          'data': data
        };
        observer.next(_message);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    let observer = {
      next: (data: any) => {
        this.socket.emit(data.room, data.msg);
      },
    };
    return Rx.Subject.create(observer, observable);
  }

  public sendMessage(msg) {
    this.messages.next(msg);
  }

}



// WEBPACK FOOTER //
// ./src/app/services/communication-service.ts