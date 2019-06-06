import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../services/common-service';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-no-update-modal',
  templateUrl: './no-update-modal.component.html',
  styleUrls: ['./no-update-modal.component.css']
})
export class NoUpdateModalComponent implements OnInit {
  public message = 'There are currently no updates available.';

  @Output() saveEvent = new EventEmitter<any>();

  constructor(
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
  }

  public proceed() {
     this.activeModal.dismiss('Save Click');
  }

}



// WEBPACK FOOTER //
// ./src/app/no-update-modal/no-update-modal.component.ts