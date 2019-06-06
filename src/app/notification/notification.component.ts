import { Component, OnInit, Input } from '@angular/core';

import { NotificationManagerService } from './../services/notification-manager.service';

import { Notification } from './../model/notification';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})

export class NotificationComponent implements OnInit {

  mode: string;

  @Input('mode')
  set _mode(data: string) {
    this.mode = data;
  }

  public notificationList: Map<string, Array<Notification>>;

  constructor(
    private notificationManagerService: NotificationManagerService
  ) { }

  ngOnInit() {
    this.notificationList = this.notificationManagerService.getNotificationList();
  }

}



// WEBPACK FOOTER //
// ./src/app/notification/notification.component.ts