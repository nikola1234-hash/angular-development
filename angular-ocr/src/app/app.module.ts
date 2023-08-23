import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app.component';
import { TextRecognitionComponent } from './text-recognition/text-recognition.component';
import { FormsModule } from '@angular/forms';
import { MouseResponseDirective } from './mouse-response.directive';
@NgModule({
  declarations: [
    AppComponent,
    TextRecognitionComponent,
    MouseResponseDirective
  ],
  imports: [
    BrowserModule,
    NgbModule,
    FormsModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
