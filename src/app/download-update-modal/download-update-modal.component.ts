import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-download-update-modal',
  templateUrl: './download-update-modal.component.html',
  styleUrls: ['./download-update-modal.component.css']
})
export class DownloadUpdateModalComponent implements OnInit {
  public message = 'Please restart Rocket Aio to apply the latest update and export all your data before restarting the aplication.';
  @Output() saveEvent = new EventEmitter<any>();

  constructor(
    public activeModal: NgbActiveModal,
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
// ./src/app/download-update-modal/download-update-modal.component.ts