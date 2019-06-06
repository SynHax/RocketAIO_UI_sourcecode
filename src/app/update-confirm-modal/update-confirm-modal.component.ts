import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../services/common-service';
import { ElectronService } from 'ngx-electron';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-update-confirm-modal',
  templateUrl: './update-confirm-modal.component.html',
  styleUrls: ['./update-confirm-modal.component.css']
})
export class UpdateConfirmModalComponent implements OnInit {

  public message = 'Would you like to check for updates? Please do not close the application during update.';

  @Output() saveEvent = new EventEmitter<any>();

  constructor(
    public activeModal: NgbActiveModal,
    public commonService: CommonService,
    public modalService: NgbModal
  ) { }

  ngOnInit() {
  }

  public proceed() {
    this.activeModal.dismiss('Save Click');
    this.commonService.checkUpdate(this.modalService);
  }

  public cancel() {
    this.activeModal.dismiss('Cancel Click');
  }

}



// WEBPACK FOOTER //
// ./src/app/update-confirm-modal/update-confirm-modal.component.ts