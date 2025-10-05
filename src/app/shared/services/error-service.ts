import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  errors = signal<ErrorObject[]>([]);
  
  addError(message: string) {
    const newError = new ErrorObject(message);
    this.errors.set([...this.errors(), newError]);
  }

  clearError(index: number) {
    const currentErrors = this.errors();
    if (index >= 0 && index < currentErrors.length) {
      currentErrors.splice(index, 1);
      this.errors.set([...currentErrors]);
    }
  }

  clearErrors() {
    this.errors.set([]);
  }

}

export class ErrorObject {

  public message: string;
  public timestamp: Date;

  constructor(message: string, timestamp: Date = new Date()) {
    this.message = message;
    this.timestamp = timestamp;
  }
}
