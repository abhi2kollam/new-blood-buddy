import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialogElement: any;

  constructor() {
    this.dialogElement = document.createElement('dialog');
    document.body.appendChild(this.dialogElement);
  }

  openConfirmation(message: string): Promise<boolean> {
    this.dialogElement.innerHTML = `
      <h2>Confirmation</h2>
      <p>${message}</p>
      <div class="mt-3 d-flex justify-content-evenly">
        <button class="confirm-button btn btn-primary">Confirm</button>
        <button class="cancel-button btn btn-secondary">Cancel</button>
      </div>
    `;

    this.dialogElement.showModal();

    return new Promise<boolean>((resolve) => {
      const confirmButton = this.dialogElement.querySelector('.confirm-button');
      const cancelButton = this.dialogElement.querySelector('.cancel-button');

      confirmButton?.addEventListener('click', () => {
        (this.dialogElement as any).close();

        resolve(true);
      });

      cancelButton?.addEventListener('click', () => {
        (this.dialogElement as any).close();

        resolve(false);
      });
    });
  }
}
