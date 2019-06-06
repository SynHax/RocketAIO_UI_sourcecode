import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-mass-keyword-changer',
  templateUrl: './mass-keyword-changer.component.html',
  styleUrls: ['./mass-keyword-changer.component.css']
})
export class MassKeywordChangerComponent implements OnInit {

  @Output() saveEvent = new EventEmitter<any>();

  public mkcForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.mkcForm = this.fb.group({
      'mkcInput': ['', Validators.compose([Validators.required])]
    });
  }

  public save() {
    if (this.mkcForm.valid) {
      this.saveEvent.emit(this.mkcForm.value);
      this.activeModal.dismiss('Save Click');
    }
  }

  public reset() {
    this.mkcForm.reset();
  }

}



// WEBPACK FOOTER //
// ./src/app/mass-keyword-changer/mass-keyword-changer.component.ts