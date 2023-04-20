import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// ngx-bootstrap
import { ChangePasswordModalService } from './change-password-modal.service';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss']
})

export class ChangePasswordModalComponent implements OnInit {

  form: FormGroup;
  loading: Boolean;

  constructor(
    private changePassWordModalService: ChangePasswordModalService,
    private pnotifyService: PNotifyService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setFormBuilder();
  }

  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      senha: ['', [Validators.required]],
      novaSenha: ['', [Validators.required]],
      confirmarNovaSenha: ['', [Validators.required]]
    });
  }

  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any): boolean {
    field = this.form.get(field);

    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(
    abstractControl: AbstractControl,
    abstractControlField?: string
  ): string {
    if (abstractControl.validator) {
      const validator = abstractControl.validator({} as AbstractControl);
      if (validator && validator.required) {
        return 'is-required';
      }
    }

    if (abstractControlField) {
      for (const controlName in abstractControl['controls']) {
        if (abstractControl['controls'][controlName]) {
          if (
            this.onFieldRequired(abstractControl['controls'][controlName]) &&
            controlName == abstractControlField
          ) {
            return 'is-required';
          }
        }
      }
    }

    return '';
  }

  onClose() {
    this.changePassWordModalService.hide()
  }

  onConfirm() {
    this.loading = true;
    this.changePassWordModalService.changePassword(this.form.getRawValue())
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status !== 200) {
            this.pnotifyService.error();
          } else {
            this.pnotifyService.success();
            this.onClose()
          }
        },
        (error: any) => {
          this.pnotifyService.error(error.error.message);
        }
      );
  }

}
