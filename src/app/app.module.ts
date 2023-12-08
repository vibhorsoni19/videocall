import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularAgoraRtcModule, AgoraConfig } from 'angular-agora-rtc';
import { FormsModule } from '@angular/forms';


const agoraConfig: AgoraConfig = {
  AppID: 'abcf4de8f19d4f84bf9bce2d0ae4b9cf',
};
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularAgoraRtcModule.forRoot(agoraConfig) ,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
