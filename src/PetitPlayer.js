import PetitAudio from './PetitAudio.js'  	
import Petit from './Petit.js'

function isNumeric(str) {
	if (typeof str != "string") return false 
	return !isNaN(str) && !isNaN(parseFloat(str))
}


export class PetitPlayer extends HTMLElement{
	constructor() {
		super();


	}
	connectedCallback() {	
		console.log("connectedCallback", this);
		const templateString = `
			<style>

				p:not(.unsupported).support {
				  display: none;
				}

				input[type="range"] {
				  width: 100%;
				  padding: 0;
				  margin: 0;
				}

				#petit-controls {
					 display: flex;
					 flex-wrap: wrap;
					 justify-content: space-between;
					 align-items: center;
					 margin: 5px 0;
					 padding: 0;
				}
				#petit-controls li {
					 display: block;
					 padding: 15px 5px;
				}
				.scrubbar {
					flex:1;
				}
			</style>
			<p class="support">Requires native Web Animation Support (latest Firefox, Chrome, Opera)</p>
			<slot></slot>
			<ul id="petit-controls">
				<li><button class="playb">&#62;</button></li>
				<li class="scrubbar"><input type="range" value="0" min="0" step="1" class="scrub" /></li>
				<li><button class="muted">&#x1f507;</button></li>
				<li><button class="debug">?</button></li>
			</ul>
			<slot name="aftercontrols"></slot>
		`;
		const template = document.createElement('template');
		template.innerHTML = templateString;
		const shadowRoot = this.attachShadow({mode: 'open'});
		shadowRoot.appendChild(template.content.cloneNode(true));
		const userStyle = this.querySelector("style");
		const shadowStyle = document.createElement('style');
		shadowStyle.innerHTML = userStyle.innerHTML;
		shadowRoot.appendChild(shadowStyle);

		this.version=0.1;			

		let src = this.getAttribute("src");		
		
		async function fetchPetitJSON() {
		  const response = await fetch(src);
		  const petit = await response.json();
		  return petit;
		}
		
		fetchPetitJSON().then(petit => {
			const pa = new PetitAudio(this, Math.round( 1000/petit.fr ));
			this.myPetit =  new Petit(this, petit);
			
			this.timer = null;

			this.playButton = this.shadowRoot.querySelector(".playb");
			this.scrub = this.shadowRoot.querySelector(".scrub");
			this.scrub.value=0;
			this.scrub.max = petit.op * this.myPetit.normalSpeed
			this.playButton.addEventListener("mouseup", (e) => {
				if(this.myPetit.isPlaying) {
					this.myPetit.pauseAll();
				}
				else {
					this.play()
				}
			});
			this.shadowRoot.querySelector(".debug").addEventListener("mouseup", (e) => {
				prompt('Petit Player \nplease report bugs with your petit file and the following info :', 'Petit version :'+this.myPetit.version+'\nPlayer version :'+this.version+'\nBrowser'+navigator.userAgent);
			});
			this.muted= this.getAttribute("muted");
			this.mutedButton = this.shadowRoot.querySelector(".muted");
			this.mutedButton.addEventListener("mouseup", (e) => {
				if(this.muted){
					this.unmute();
				}
				else {
					this.mute();
				}
			});
			if(this.muted!=null){
					this.mute()
			}
			this.addEventListener("play", ()=>{
				this.playButton.innerHTML = "II";
			});	
			this.addEventListener("pause", ()=>{
				this.playButton.innerHTML = ">";
			});
			this.addEventListener("finished", ()=>{
				this.playButton.innerHTML = ">";
			});
			
			console.log("TODO replace myPetit");		
					
			//Check for support... You can the polyfill so this won't actually be triggered
			if (!document.body.animate) {
			  this.shadowRoot.querySelector(".support").classList.add("unsupported");
			}

			//when the input range ("scrubber") is adjusted, pause the animations and change the `currentTime` property
			this.scrub.addEventListener('input', e => {
				console.log('input', e.currentTarget.value);
				var time = e.currentTarget.value;
				
				this.myPetit.animations.forEach(animation => {
					animation.currentTime = time;
				});
				if(!this.myPetit.isPlaying) {
					this.myPetit.pauseAll();
				}
			});
			//When the user finalizes the value for input range ("scrubber")... 
			this.scrub.addEventListener("change", (e) => {
				console.log("change", e.currentTarget.value);
				if (this.myPetit.animations[0].currentTime >= e.currentTarget.getAttribute("max")) {
					this.myPetit.finishAll();
					return false;
				}
				this.dispatchEvent(
					new CustomEvent("rebase")
				);	
				this.dispatchEvent(
					new CustomEvent("changescrub", {detail:  parseInt(this.scrub.value) })
				);		
				this.adjustScrubber();
				if (this.myPetit.isPlaying) {
					this.myPetit.playAll();
				}
			});
			if(this.getAttribute("autoplay")!=null){
				this.play();
			}
			if(this.getAttribute("controls")!=null && this.getAttribute("controls")=="false"){
				this.shadowRoot.querySelector("#petit-controls").style.display = 'none';
			}
			
			if(this.getAttribute("loop")!=null){
				this.addEventListener("finished", (e) => {
					this.play();
				});
			}
			this.poster = this.getAttribute("poster");
			if(this.poster!=null && isNumeric(this.poster)){
				this.myPetit.animations.forEach(animation => {
					animation.currentTime = +this.poster*this.myPetit.normalSpeed;
				});
			}
			



		});
	}
	play(){
		if(this.poster!=null && isNumeric(this.poster)){
			this.myPetit.animations.forEach(animation => {
				animation.currentTime =0;
			});
		}
		this.myPetit.isPlaying = true;
		this.myPetit.playAll();
		this.adjustScrubber();
	}
	pause(){
		this.myPetit.pauseAll();
	}
	
	mute(){
		this.muted=true;
		this.mutedButton.innerHTML = "&#x1f50a;";
	  	this.dispatchEvent(
			new CustomEvent("mute")
		);
	}
   unmute(){
		this.muted=false;
		this.mutedButton.innerHTML = "&#x1f507;";			  	
	  	this.dispatchEvent(
			new CustomEvent("unmute")
		);
	}
    
	adjustScrubber() {
		let ct = this.myPetit.animations[0].currentTime;
		this.scrub.value = (ct ? ct : 0) ;
		cancelAnimationFrame(this.timer);	
		if (this.myPetit.isPlaying) {
			this.dispatchEvent(
				new CustomEvent("seek", {detail:{time : parseInt(this.scrub.value)}})
			);
			this.timer = requestAnimationFrame(() => this.adjustScrubber());
			//this.myPetit.oldT = parseInt(this.scrub.value);
		}
	}
	
	/*
autoplay	autoplay	Specifies that the petit will start playing as soon as it is ready
controls	if controls="false"	Specifies that petit controls should be displayed (such as a play/pause button etc).
loop	loop	Specifies that the petit will start over again, every time it is finished
muted	muted	Specifies that the audio output of the petit should be muted
src	URL	Specifies the URL of the petit file
poster	int	Specifies an frame to be shown until the user hits the play button	
TODO make the attributes dynamic :
	*/
	
	static get observedAttributes() { return ['src', 'muted', 'autoplay', 'controls', 'loop', 'poster']; }	
	
	attributeChangedCallback(name, oldValue, newValue) {
		console.log('Custom square element attributes changed.', name);
		//updateStyle(this);
	}
}
window.customElements.define('petit-player', PetitPlayer);  
