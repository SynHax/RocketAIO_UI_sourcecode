import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-mass-url-changer',
  templateUrl: './mass-url-changer.component.html',
  styleUrls: ['./mass-url-changer.component.css']
})
export class MassUrlChangerComponent implements OnInit {

  @Output() saveEvent = new EventEmitter<any>();

  public mucForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.mucForm = this.fb.group({
      'mucInput': ['', Validators.compose([Validators.required])]
    });
  }

  public save() {
    if (this.mucForm.valid) {
      this.saveEvent.emit(this.mucForm.value);
      this.activeModal.dismiss('Save Click');
    }
  }

  public reset() {
    this.mucForm.reset();
  }

  public isFormInvalid() {
    return this.mucForm.invalid ? '' : null;
  }

}



// WEBPACK FOOTER //
// ./src/app/mass-url-changer/mass-url-changer.component.ts