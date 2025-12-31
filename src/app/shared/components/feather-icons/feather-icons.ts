import { Component, Input, AfterViewInit, OnChanges } from '@angular/core';
declare var feather: any;

@Component({
  selector: 'app-feather-icons',
  standalone: true,
  template: `
    <i [attr.data-feather]="icon" [style.width.px]="size" [style.height.px]="size"></i>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `],
})
export class FeatherIcons implements AfterViewInit, OnChanges {
  @Input() icon: string = '';
  @Input() size: number = 24;

  ngAfterViewInit() {
    this.render();
  }

  ngOnChanges() {
    this.render();
  }

  private render() {
    if (typeof feather !== 'undefined') {
      setTimeout(() => {
        feather.replace();
      });
    }
  }
}
