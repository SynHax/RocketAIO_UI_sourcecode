import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons, NgbTimeStruct, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-task-scheduler',
  templateUrl: './task-scheduler.component.html',
  styleUrls: ['./task-scheduler.component.css']
})

export class TaskSchedulerComponent implements OnInit {

  scheduledAt: any;

  @Input()('scheduledAt')
  set _scheduledAt(data: any) {
    this.scheduledAt = data;
  }

  @Output() saveEvent = new EventEmitter<any>();
  @Output() resetEvent = new EventEmitter<any>();

  public taskSchedularForm: FormGroup;
  private _defaultDate = '';
  private _defaultTime: NgbTimeStruct = {
    hour: 0,
    minute: 0,
    second: 0
  };
  public readonly timePickerConfig = {
    spinners: true,
    meridian: false,
    seconds: true
  };

  public minDate: any;
  public maxDate: any;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
    const now = new Date();
    this.minDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    this.maxDate = { year: now.getFullYear() + 1, month: 12, day: 31 };
    this.initForm({
      date: (this.scheduledAt && this.scheduledAt['date']) ? this.scheduledAt['date'] : this._defaultDate,
      time: (this.scheduledAt && this.scheduledAt['time']) ? this.scheduledAt['time'] : this._defaultTime
    });
  }

  private initForm(formData) {
    this.taskSchedularForm = this.fb.group({
      'date': [formData['date'], Validators.compose([Validators.required])],
      'time': [formData['time'], Validators.compose([Validators.required])]
    });
  }

  public save() {
    if (this.taskSchedularForm.valid) {
      this.saveEvent.emit(this.taskSchedularForm.value);
      this.activeModal.dismiss('Save Click');
    }
  }

  public reset() {
    this.taskSchedularForm['controls']['date'].setValue('');
    this.taskSchedularForm['controls']['time'].setValue('');
    this.resetEvent.emit(this.taskSchedularForm.value);
    this.activeModal.dismiss('Reset Click');
  }

}



// WEBPACK FOOTER //
// ./src/app/task-scheduler/task-scheduler.component.ts