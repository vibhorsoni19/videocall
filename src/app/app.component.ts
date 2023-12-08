import { Component } from '@angular/core';
import { AngularAgoraRtcService, Stream } from 'angular-agora-rtc';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AgoraDemo';
  localStream: Stream |any
  remoteCalls: any = []; // Add
  channelName:string =""

  constructor(
    private agoraService: AngularAgoraRtcService
  ) {
    this.agoraService.createClient();
  }

  startCall() {
    this.joinChannel('1000')
  }
  joinChannel(uid: string) {
    this.agoraService.client.join(null, uid, null, (joinedUid: string) => {
      this.localStream = this.agoraService.createStream(joinedUid, true, "", "", true, false);
      this.localStream.setVideoProfile('720p_3');
      this.subscribeToStreams();
    });
  }

  private subscribeToStreams() {
    this.localStream.on("accessAllowed", () => {
      console.log("accessAllowed");
    });
    // The user has denied access to the camera and mic.
    this.localStream.on("accessDenied", () => {
      console.log("accessDenied");
    });

    this.localStream.init(() => {
      console.log("getUserMedia successfully");
      this.localStream.play('agora_local');
      this.agoraService.client.publish(this.localStream, function (err:any) {
        console.log("Publish local stream error: " + err);
      });
      this.agoraService.client.on('stream-published', function (evt:any) {
        console.log("Publish local stream successfully");
      });
    }, function (err:any) {
      console.log("getUserMedia failed", err);
    });

    // Add
    this.agoraService.client.on('error', (err:any) => {
      console.log("Got error msg:", err.reason);
      if (err.reason === 'DYNAMIC_KEY_TIMEOUT') {
        this.agoraService.client.renewChannelKey("", () => {
          console.log("Renew channel key successfully");
        }, (err:any) => {
          console.log("Renew channel key failed: ", err);
        });
      }
    });

    // Add
    this.agoraService.client.on('stream-added', (evt:any) => {
      const stream = evt.stream;
      this.agoraService.client.subscribe(stream, (err:any) => {
        console.log("Subscribe stream failed", err);
      });
    });

    // Add
    this.agoraService.client.on('stream-subscribed', (evt:any) => {
      const stream = evt.stream;
      if (!this.remoteCalls.includes(`agora_remote${stream.getId()}`)) this.remoteCalls.push(`agora_remote${stream.getId()}`);
      setTimeout(() => stream.play(`agora_remote${stream.getId()}`), 2000);
    });

    // Add
    this.agoraService.client.on('stream-removed', (evt:any) => {
      const stream = evt.stream;
      stream.stop();
      this.remoteCalls = this.remoteCalls.filter((call:any) => call !== `#agora_remote${stream.getId()}`);
      console.log(`Remote stream is removed ${stream.getId()}`);
    });

    // Add
    this.agoraService.client.on('peer-leave', (evt:any) => {
      const stream = evt.stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = this.remoteCalls.filter((call:any) => call === `#agora_remote${stream.getId()}`);
        console.log(`${evt.uid} left from this channel`);
      }
    });
  }

  //screensharing

  startScreenSharing() {
    this.agoraService.client.unpublish(this.localStream);
    this.localStream.close();
  
    const screenStream = this.agoraService.createStream(
      this.localStream.getId(),
      true,
      "",
      "",
      true,
      false
    );
    screenStream.setScreenProfile('720p_2');
    screenStream.init(
      () => {
        screenStream.play('agora_local');
        this.agoraService.client.publish(screenStream, (err: any) => {
          console.log('Publish screen stream error: ' + err);
        });
      },
      (err: any) => {
        console.log('getUserMedia failed for screen sharing', err);
      }
    );
  }
joinChannelByUrl() {
    if (this.channelName.trim() !== '') {
      this.joinChannel(this.channelName);
    }
  }


}
  
