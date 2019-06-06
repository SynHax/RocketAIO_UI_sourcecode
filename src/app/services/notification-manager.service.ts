import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { Notification } from './../model/notification';

@Injectable()
export class NotificationManagerService {

  private notificationList: Map<string, Array<Notification>>;
  private readonly notificationTimeOut: number = 2000;

  constructor(
    private router: Router
  ) {
    this.notificationList = new Map<string, Array<Notification>>();
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.resetLocalNotificationData();
      }
    });
  }

  public notificationGenerator(notification: Notification, timer ?: number) {
    notification.id = this.pushNotification(notification);
    if (timer) {
      const _notification = notification;
      setTimeout(() => {
        this.popNotification(_notification);
        notification = new Notification();
      }, timer);
    }
    return notification.id;
  }

  public pushNotification(notification: Notification) {
    if (!this.notificationList[notification.mode]) {
      this.notificationList[notification.mode] = new Array<Notification>();
    }
    if (notification.id !== undefined) {
      for (let _i = 0; _i < this.notificationList[notification.mode].length; _i++) {
        if (notification.id === this.notificationList[notification.mode][_i].id) {
          this.notificationList[notification.mode].splice(_i, 1);
          notification.id = this.notificationList[notification.mode].length;
          this.notificationList[notification.mode].push(notification);
          break;
        }
      }
    } else {
      notification.id = this.notificationList[notification.mode].length;
      this.notificationList[notification.mode].push(notification);
    }
    return notification.id;
  }

  public popNotification(notification: Notification) {
    if (
      this.notificationList &&
      this.notificationList[notification.mode] &&
      this.notificationList[notification.mode].length
    ) {
      for (let _i = 0; _i < this.notificationList[notification.mode].length; _i++) {
        if (notification.id === this.notificationList[notification.mode][_i].id) {
          this.notificationList[notification.mode].splice(_i, 1);
          // TO_DO: HANDLE_SUCCESS
          return;
        }
      }
    }
    // TO_DO: HANDLE_ERROR
    return;
  }

  public getNotificationList() {
    return this.notificationList;
  }

  public resetLocalNotificationData() {
    this.notificationList['local'] = new Array<Notification>();
  }

  public getNotificationTimeOut() {
    return this.notificationTimeOut;
  }

}



// WEBPACK FOOTER //
// ./src/app/services/notification-manager.service.ts