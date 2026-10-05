import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Loading {
  private readonly _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  private activeRequests = 0;

  show() {
    this.activeRequests++;
    this._isLoading.set(true);
  }

  hide() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) {
      this._isLoading.set(false);
    }
  }

  reset() {
    this.activeRequests = 0;
    this._isLoading.set(false);
  }
}
