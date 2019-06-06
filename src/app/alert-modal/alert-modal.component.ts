import { Component, OnInit, Input } from '@angular/core';

import { Alert } from './../model/alert';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.css']
})

export class AlertModalComponent implements OnInit {

  public alert: Alert;

  @Input()('alert')
  set _alert(data: Alert) {
    this.alert = data;
  }

  constructor(
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit() { }

}



// WEBPACK FOOTER //
// ./src/app/alert-modal/alert-modal.component.ts