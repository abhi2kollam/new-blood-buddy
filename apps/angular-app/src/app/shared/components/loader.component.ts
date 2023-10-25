import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-loader',
  template: `
    <div class="loader" *ngIf="showLoader">
      <div class="load"></div>
      <div class="load-text">Please wait...</div>
    </div>
  `,
  styles: [
    `
    .load-text{
        color:#fff;
        margin-top:50px;
    }
      .loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content:center;
        flex-direction:column;
      }

      .loader i {
        font-size: 50px;
        color: white;
        margin: 0 auto;
      }
    `,
  ],
})
export class LoaderComponent implements OnInit {
  showLoader = false;

  constructor(private loaderService: LoaderService) {}

  ngOnInit() {
    this.loaderService.loaderStatus$.subscribe((show: boolean) => {
      this.showLoader = show;
    });
  }
}
