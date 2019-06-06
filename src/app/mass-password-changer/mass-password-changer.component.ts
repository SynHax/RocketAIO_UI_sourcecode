import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-mass-password-changer',
  templateUrl: './mass-password-changer.component.html',
  styleUrls: ['./mass-password-changer.component.css']
})
export class MassPasswordChangerComponent implements OnInit {

  @Output() saveEvent = new EventEmitter<any>();

  public mpcForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.mpcForm = this.fb.group({
      'mpcInput': ['', Validators.compose([Validators.required])]
    });
  }

  public save() {
    if (this.mpcForm.valid) {
      this.saveEvent.emit(this.mpcForm.value);
      this.activeModal.dismiss('Save Click');
    }
  }

  public reset() {
    this.mpcForm.reset();
  }
  public isFormInvalid() {
    return this.mpcForm.invalid ? '' : null;
  }

}



// WEBPACK FOOTER //
// ./src/app/mass-password-changer/mass-password-changer.component.ts