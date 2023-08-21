
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as Tesseract from 'tesseract.js';
@Component({
  selector: 'app-text-recognition',
  templateUrl: './text-recognition.component.html',
  styleUrls: ['./text-recognition.component.css']
})
export class TextRecognitionComponent {
  shortLink: string = "";
  loading: boolean = false; // Flag variable
  image?: File | null; // Variable to store file
  imagePath: string = '';
  lines: string[] = [];
  tempText: string[] = [];
  recognizedText: { text: string, bbox: any, words: any}[] = [];
  @ViewChild('imgElement') imgElement: ElementRef<HTMLImageElement> | undefined;
  @ViewChild('canvasElement') canvasElement: ElementRef<HTMLCanvasElement> | undefined;
  canvasContext: CanvasRenderingContext2D | undefined;
  currentSize:number = 0;
  xIndexStore: Record<string, number> = {};

  resizing: boolean = false;
  lastMousePosition: { x: number, y: number } | null = null;
  resizeTargetIndex: number | null = null;
lastMouseX: number | null = null;
lastMouseY: number | null = null;
  ngOnInit(): void {
  }
   // On file Select
   onChange(event:any) {
    this.image = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.imagePath = e.target.result;
    };
    if(this.image){
      reader.readAsDataURL(this.image);
    }
    this.getText();

}

  getText(){
    if(this.image){
      Tesseract.recognize(this.image).then((res:any) =>{
        console.log(res);
        this.tempText = res.data.text.split('\n');
        const totalLines = this.tempText.length;
        this.lines = Array(totalLines - 1).fill('');
        this.recognizedText = res.data.lines.map((line: { text: any; bbox: any; words:any}) => ({

          text: line.text,
          bbox: line.bbox,
          words: line.words
      }));
      console.log(this.recognizedText);
      }).catch(console.error);
    }
  }
  trackByFn(index: number): number {
    return index; // return a unique identifier for each item, in this case, the index itself
}
onImageLoad(event: any) {
  if(!this.canvasElement){
    return;
  }

  const canvas = this.canvasElement.nativeElement;
  canvas.width = event.target.width;
  canvas.height = event.target.height;
  this.canvasContext = canvas.getContext('2d') ?? undefined;
}
highlightText(index: number) {
  this.clearCanvas();

  if (!this.canvasContext) {
      return;
  }
  if (!this.canvasElement) {
      return;
  }
  for (let i = 0; i < this.lines.length; i++) {

      const inputText = this.lines[i];

      const recognizedLine = this.recognizedText[i]?.text;

      if (recognizedLine && inputText && recognizedLine.includes(inputText)) {
          this.canvasContext.strokeStyle = 'red';
          this.canvasContext.lineWidth = 3;
          const words = this.recognizedText[i].words;
          let elemenst:any[] = [];

          words.forEach((element:any) => {
            if(inputText.includes(element['text'])){

              let obj = {
                text: element['text'],
                bbox: element['bbox']
              }
               elemenst.push(obj);
            }
          });
          let fontSize = words[0].font_size;
          const bbox = this.recognizedText[i].bbox ;
          // Check if staticX0 exists for this line. If it does, use it.
          if(!elemenst[0]){
            return;
          }
          let x0 =  elemenst[0].bbox.x0;

          const y0 = bbox.y0;

          const x1 = elemenst[elemenst.length -1].bbox.x1 - x0;
          bbox.x1 = x1;
          const y1 = bbox.y1;
          this.canvasContext.font = words[0].font_size;
          this.canvasContext.strokeRect(x0, y0, x1 , y1 - y0);
      }

    }
}
resizeBorderHandler(index: number) {
  this.clearCanvas();

  if (!this.canvasContext) {
      return;
  }
  if (!this.canvasElement) {
      return;
  }
  for (let i = 0; i < this.lines.length; i++) {

    const inputText = this.lines[i];

    const recognizedLine = this.recognizedText[i]?.text;

    if (recognizedLine && inputText && recognizedLine.includes(inputText)) {
        this.canvasContext.strokeStyle = 'red';
        this.canvasContext.lineWidth = 3;
        const words = this.recognizedText[i].words;
        let elemenst:any[] = [];
        words.forEach((element:any) => {
          if(inputText.includes(element['text'])){

            let obj = {
              text: element['text'],
              bbox: element['bbox'],
              symbols: element['symbols']
            }
             elemenst.push(obj);
          }
        });

        const bbox = this.recognizedText[i].bbox;
        // Check if staticX0 exists for this line. If it does, use it.
        let x0 =  elemenst[0].bbox.x0;

        const y0 = bbox.y0;
        const x1 = bbox.x1;
        const y1 = bbox.y1;
        this.canvasContext.font = words[0].font_size;
        this.canvasContext.strokeRect(x0, y0, x1 , y1 - y0);
      }

    }
}






clearCanvas() {
  if(!this.canvasContext){
    return;
  }
  if(!this.canvasElement){
    return;
  }
  this.canvasContext.clearRect(0, 0, this.canvasElement.nativeElement.width, this.canvasElement.nativeElement.height);
}
  createInputs(res:any){

  }

  onMouseDown(event: MouseEvent) {
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    for (let i = 0; i < this.recognizedText.length; i++) {
        const bbox = this.recognizedText[i].bbox;

        if (mouseX >= bbox.x0 && mouseX <= bbox.x1 && mouseY >= bbox.y0 && mouseY <= bbox.y1) {
            this.resizing = true;
            this.resizeTargetIndex = i;
            this.lastMousePosition = { x: mouseX, y: mouseY };
            break;
        }
    }
  }
 onMouseMove(event: MouseEvent) {
    if (!this.resizing || !this.lastMousePosition || this.resizeTargetIndex === null) return;

    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    const dx = mouseX - this.lastMousePosition.x;
    const dy = mouseY - this.lastMousePosition.y;
    // Adjust the bbox using dx only (keep y the same)
    const bbox = this.recognizedText[this.resizeTargetIndex].bbox;

    // Store old bbox values for clearing purposes
    const oldX1 = bbox.x1;

    bbox.x1 += dx;

    this.lastMousePosition = { x: mouseX, y: mouseY };

    // Request the browser to perform an animation update
    requestAnimationFrame(() => {
        if (this.canvasContext) {
            // Clear the previously drawn region
            this.canvasContext.clearRect(oldX1 - 1, bbox.y0 - 1, (bbox.x1 - oldX1) + 2, bbox.y1 - bbox.y0 + 2);
            // Draw the updated region
            this.resizeBorderHandler(this.resizeTargetIndex!);
        }
    });
}

onMouseUp(event: MouseEvent) {
  this.resizing = false;
  this.resizeTargetIndex = null;
  this.lastMousePosition = null;
}

onMouseLeave(event: MouseEvent) {
  this.resizing = false;
  this.resizeTargetIndex = null;
  this.lastMousePosition = null;
}

}
