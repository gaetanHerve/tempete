import { Component, effect, inject } from '@angular/core';
import { ErrorObject, ErrorService } from '../../services/error-service';

@Component({
  selector: 'app-error',
  imports: [],
  templateUrl: './error-component.html',
  styleUrl: './error-component.scss'
})
export class ErrorComponent {

  private readonly errorService = inject(ErrorService);

  protected errors: ErrorObject[] = [];
  protected errorsToDisplay: ErrorObject[] = [];

  constructor() {
    effect(() => {
      this.errors = this.errorService.errors();
      if (this.errors.length > 0) {
        this.errorsToDisplay = [this.errors[this.errors.length-1]]; // displays only last error;
      }
    });
  }

  protected dismissError() {
    this.errorsToDisplay = [];
    this.errorService.clearErrors();
  }

}
