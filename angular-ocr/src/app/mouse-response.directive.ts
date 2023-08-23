import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appMouseResponse]'
})
export class MouseResponseDirective {

  constructor(private el: ElementRef) {
    
 }
  @HostListener('mousedown') onMousedown() {
    this.highlight('grabbing');
  }
  
  @HostListener('mouseup') onMouseUp() {
    this.highlight('default');
  }
  
  private highlight(cursor: string) {
    this.el.nativeElement.style.cursor = cursor;
  }
}
