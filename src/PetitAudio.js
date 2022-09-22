export default class PetitAudio {
	constructor(petitPlayer, normalSpeed){
   	this.audioArray = [];
   	this.normalSpeed = normalSpeed;
   	this.state = "paused";
   	this.previousTime = -1;
   	
   	//TODO check duplicate event?
   	petitPlayer.addEventListener("rebase", ()=>{
			this.rebaseAll();
		});			
		petitPlayer.addEventListener("ended", ()=>{
			this.rebaseAll();
		  	this.state = "paused";
			//console.log("audio finished");
		});
		petitPlayer.addEventListener("pause", ()=>{
			this.pauseAll();
		});
		petitPlayer.addEventListener("play", ()=>{
			this.playAll();
		});		
		petitPlayer.addEventListener("seek", (event)=>{
				//console.log(event,event.detail);
				this.seek(event.detail.time);
		});		
		petitPlayer.addEventListener("added", (event)=>{
			//console.log(event,event.detail);
			if(event.detail.animation.effect.target.tagName.toLowerCase()=='audio'){
				//console.log("audio",event.detail.sequence);
				this.add(event.detail.animation.effect.target, event.detail.sequence);
			}
		});	
   	petitPlayer.addEventListener("changescrub", (event)=>{
			this.changeScrub(event.detail.time);
		});	
		petitPlayer.addEventListener("mute", ()=>{
			this.muteAll(true);
		});		
   	petitPlayer.addEventListener("unmute", ()=>{
			this.muteAll(false);
		});		
  		petitPlayer.addEventListener("canplay", ()=>{
  			console.log('canplay', petitPlayer.muted );
	  		if (petitPlayer.muted != null) {
				this.muteAll(true);
		   }
		});	
		
	}
	muteAll(bool){
		console.log('muteAll', bool);
		this.audioArray.forEach((audio) => {
			audio.el.muted = bool;
			console.log(audio.el.id, audio.el.muted);
  		});
	}
	rebaseAll() { 
   	this.previousTime = -1;
		this.audioArray.forEach((audio) => {
			audio.el.pause();
			audio.el.currentTime = 0;
  		});
	}
	add(el, sequence){
		sequence.forEach( (kf, index) => {
			let start = kf.kft * this.normalSpeed;

			if(isNaN(el.duration)) {
				el.onloadeddata = (e)=> {
				  //console.log("Browser has loaded the audio", e);
				  this.audioArray.forEach(function (a, i) {
				  		if(a.el==e.target) {
							//console.log("found ", a);
							a.duration = e.target.duration
				  		}
				  });
				};						
			}
			this.audioArray.push({el:el, start:start, duration:el.duration});	
		});
	}
	playAll() {
		//console.log(this.audioArray);
		this.state = "playing";
	  	this.audioArray.forEach((audio) => {
	  		if(audio.el.currentTime>0) {
	  			//console.log(audio.el.id, audio.el.currentTime);
				setTimeout(function() {audio.el.play();}, 0);
	  		}
	  	});
	}
	pauseAll() {
		this.state = "paused";
		this.audioArray.forEach((audio) => {
			audio.el.pause();
  		});
	}
	seek (currentTime) {
		this.audioArray.forEach((audio) => {
			//console.log( audio.el.id , audio.start, currentTime );
			if( this.previousTime < audio.start &&  audio.start <= currentTime) {
				audio.el.pause();
				audio.el.currentTime = (currentTime - audio.start)/1000;
				setTimeout(function() {audio.el.play();}, 0);
			}	  		
  		});	
  		this.previousTime = currentTime
	}
	changeScrub(val) {
		this.audioArray.forEach((audio) => {
			//console.log('audio : id, val, audio.start, audio.start + audio.duration', audio.el.id, val, audio.start, audio.start + audio.duration*1000, );
			if(val > audio.start &&  val <=  audio.start + ( audio.duration*1000) ) {
				audio.el.pause();
				audio.el.currentTime = (val - audio.start)/1000;
				if ( this.state == "playing") {
					setTimeout(function() {audio.el.play();}, 0);
				}
			}	 
			else {
				audio.el.pause();
				audio.el.currentTime = 0;
			} 		
  		});	
	}
}
/*

		var video = document.createElement("video");
		video.setAttribute("id", "vidt");
		video.setAttribute("controls", "true");
		video.setAttribute("src", "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAottZGF0AAACVgYF//9S3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1NSByMjkxNyAwYTg0ZDk4IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxOCAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTAgcmVmPTEgZGVibG9jaz0wOi0zOi0zIGFuYWx5c2U9MDowIG1lPWRpYSBzdWJtZT0wIHBzeT0xIHBzeV9yZD0yLjAwOjAuNzAgbWl4ZWRfcmVmPTAgbWVfcmFuZ2U9MTYgY2hyb21hX21lPTEgdHJlbGxpcz0xIDh4OGRjdD0wIGNxbT0wIGRlYWR6b25lPTIxLDExIGZhc3RfcHNraXA9MSBjaHJvbWFfcXBfb2Zmc2V0PS0yIHRocmVhZHM9MSBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgY29uc3RyYWluZWRfaW50cmE9MCBiZnJhbWVzPTAgd2VpZ2h0cD0wIGtleWludD0yNTAga2V5aW50X21pbj0xIHNjZW5lY3V0PTAgaW50cmFfcmVmcmVzaD0wIHJjPWNyZiBtYnRyZWU9MCBjcmY9MjMuMCBxY29tcD0wLjYwIHFwbWluPTAgcXBtYXg9NjkgcXBzdGVwPTQgaXBfcmF0aW89MS40MCBhcT0wAIAAAAAKZYiEOiYoAAkoYAAAAAVBmiAUpQAAAAVBmkAVpQAAAAVBmmAVpQAAAyBtb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAD0JAAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACSnRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAD0JAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAgAAAAIAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQA9CQAAAAAAAAEAAAAAAcJtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAAEAAA+gAAFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAFtbWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAABLXN0YmwAAAClc3RzZAAAAAAAAAABAAAAlWF2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAgACAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAAvYXZjQwFCwAr/4QAXZ0LACtp+IiMBbIAAAfQAAAMAAQeJE1ABAAVozg8sgAAAABBwYXNwAAAAAQAAAAEAAAAYc3R0cwAAAAAAAAABAAAABAD6AAAAAAAUc3RzcwAAAAAAAAABAAAAAQAAABxzdHNjAAAAAAAAAAEAAAABAAAABAAAAAEAAAAkc3RzegAAAAAAAAAAAAAABAAAAmgAAAAJAAAACQAAAAkAAAAUc3RjbwAAAAAAAAABAAAAMAAAAGJ1ZHRhAAAAWm1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAALWlsc3QAAAAlqXRvbwAAAB1kYXRhAAAAAQAAAABMYXZmNTguMjkuMTAw");
		document.body.appendChild(video);

		//let video = document.querySelector('#vidt');
		let track = video.addTextTrack("captions", "Captions", "en");
		track.mode = "showing";
		let tcue =  new VTTCue(0, 0.9, 'Hildy!');
		//console.log(tcue);
		tcue.onenter = event => { console.log('ok');}
		track.addCue(tcue );
		
		
		track.addCue(new VTTCue(0, 0.5, 'oooo!'));
		track.addCue(new VTTCue(1, 1.4, 'How are you?'));
		track.addCue(new VTTCue(1.5, 2.9, 'Tell me, is the lord of the universe in?'));
		track.addCue(new VTTCue(3, 4.2, 'Yes, he\'s in - in a bad humor'));
		track.addCue(new VTTCue(4.3, 6, 'Somebody must\'ve stolen the crown jewels'));
		//console.log(track.cues);
		
		track.addEventListener('cuechange', function () {
  			let cues = track.activeCues;  // array of current cues
  			console.log(cues);
  		});
		//ffmpeg -r 0.01 -loop 1 -i 1px.jpg -c:v libx264 -tune stillimage -preset  ultrafast -ss 00:00:00 -t 3600  -shortest out.mp4
*/

