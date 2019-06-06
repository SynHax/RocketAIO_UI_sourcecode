import { Component, OnInit, EventEmitter, OnDestroy } from '@angular/core';

import { ElectronService } from 'ngx-electron';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from './../services/common-service';
import { ApiManager } from './../services/api-manager';
import { TaskHandlerService } from '../services/task-handler.service';
import { ConfirmDeactivateBotComponent } from '../confirm-deactivate-bot/confirm-deactivate-bot.component';
import { ConfirmExitBotComponent } from '../confirm-exit-bot/confirm-exit-bot.component';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  constructor(
    private _electronService: ElectronService,
    public commonService: CommonService,
    private modalService: NgbModal

  ) { }


  ngOnInit() {

  }
  public deactivate() {


    const modalRef = this.modalService.open(ConfirmDeactivateBotComponent, {
      backdrop: 'static',
      backdropClass: 'modal-backdrop--custom light-gray-backdrop',
      centered: true,
      keyboard: false,
      windowClass: 'modal-window--custom'
    });
  }


  public powerOff() {
    const modalRef = this.modalService.open(ConfirmExitBotComponent, {
      backdrop: 'static',
      backdropClass: 'modal-backdrop--custom light-gray-backdrop',
      centered: true,
      keyboard: false,
      windowClass: 'modal-window--custom'
    });
  }
  public minimize() {
    this._electronService.ipcRenderer.send('minimize');
  }
}



// WEBPACK FOOTER //
// ./src/app/header/header.component.ts