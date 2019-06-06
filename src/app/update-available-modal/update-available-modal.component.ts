import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../services/common-service';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-update-available-modal',
  templateUrl: './update-available-modal.component.html',
  styleUrls: ['./update-available-modal.component.css']
})
export class UpdateAvailableModalComponent implements OnInit {
  public message = "ROCKET AIO is being installed in the background. We'll let you know when it's done.";
  @Output() saveEvent = new EventEmitter<any>();

  constructor(
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
  }
  public proceed() {
    this.activeModal.dismiss('Save Click');
  }

  public cancel() {
    this.activeModal.dismiss('Cancel Click');
  }
}



// WEBPACK FOOTER //
// ./src/app/update-available-modal/update-available-modal.component.ts