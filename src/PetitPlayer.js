import PetitAudio from './PetitAudio.js'  	
import Petit from 'petitjs'
import {version as playerversion}  from '../package.json';

/*function isNumeric(str) {
	if (typeof str != "string") return false 
	return !isNaN(str) && !isNaN(parseFloat(str))
}*/

//TODO allow any html element https://www.geeksforgeeks.org/what-are-custom-attributes-in-html5/

export class PetitPlayer extends HTMLElement{
	constructor() {
		super();
		this.connected = false;


	}
	connectedCallback() {	
	//TODO move constrols as slot default
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
				#petit-controls button {
					background: var(--playerbutton, white);
      			color: var(--playerbuttontext, black);
					border-radius: 4px;
				}
				.scrubbar {
					flex:1;
				}
			</style>
			<slot name="uppercontrols"></slot>
			<p class="support">Requires native Web Animation Support (latest Firefox, Chrome, Opera)</p>
			<slot></slot>

			<slot id="slot-petit-controls" name="lowercontrols">
				<ul id="petit-controls">
					<li><button class="playb">&#62;</button></li>
					<li class="scrubbar"><input type="range" value="0" min="0" step="1" class="scrub" /></li>
					<li><button class="muted">&#x1f507;</button></li>
					<li><button class="debug">?</button></li>
				</ul>
			</slot>
		`;
		const template = document.createElement('template');
		template.innerHTML = templateString;
		const shadowRoot = this.attachShadow({mode: 'open'});
		shadowRoot.appendChild(template.content.cloneNode(true));
		
		/*
		TODO DOC
		:root {
				  --playerbutton: black;
				  --playerbuttontext: white;
				}
		*/
		//this.version="0.0.6";	
		this.version=playerversion;	
	
		this.playButton = this.querySelector(".playb") || this.shadowRoot.querySelector(".playb");
		this.scrub = this.querySelector(".scrub") || this.shadowRoot.querySelector(".scrub"); 
		this.scrub.value=0;
		this.muted= this.getAttribute("muted");
		
		this.getSrc();		//get the json
		
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

		this.mutedButton =  this.querySelector(".muted") || this.shadowRoot.querySelector(".muted");
		this.mutedButton.addEventListener("mouseup", (e) => {
			if(this.muted){
				this.unmute();
				//this.setAttribute("muted", false);
			}
			else {
				this.mute();
				//this.setAttribute("muted", true);
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
		this.addEventListener("ended", ()=>{
			this.playButton.innerHTML = ">";
		});
				
		//Check for support... You can use the polyfill so this won't actually be triggered
		if (!document.body.animate) {
		  this.shadowRoot.querySelector(".support").classList.add("unsupported");
		}

		//when the input range ("scrubber") is adjusted, pause the animations and change the `currentTime` property
		this.scrub.addEventListener('input', e => {
			//console.log('input', e.currentTarget.value);
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
			//console.log("change", e.currentTarget.value);
			if (this.myPetit.animations[0].currentTime >= e.currentTarget.getAttribute("max")) {
				this.myPetit.finishAll();
				return false;
			}
			this.dispatchEvent(
				new CustomEvent("rebase")
			);	
			this.dispatchEvent(
				new CustomEvent("changescrub", {detail:{time : parseInt(this.scrub.value)}})
			);		
			this.adjustScrubber();
			if (this.myPetit.isPlaying) {
				this.myPetit.playAll();
			}
		});
		if(this.getAttribute("controls")!=null && this.getAttribute("controls")=="false"){
			//this.shadowRoot.querySelector("#petit-controls").style.display = 'none';
			this.showControls();
		}
		

		if(this.getAttribute("loop")!=null){
			this.addEventListener("ended",  this.play);
		}

		
		
		
	}
	getSrc() {
		let src = this.getAttribute("src");	
		//this.fetchPetitJSON(src);	
		
		fetch(src).then((response) => {
			if (response.ok) {
				return response.json();
			}
			console.log(response);
			this.displayError("Error petit source : " + response.statusText + " for : "+ src);
			throw new Error('Sorry cannot play animation');
		}).then((petit) => {
		
		
		
		/*
			*/		
			// Do something with the response
			
			const pa = new PetitAudio(this, 1000/petit.fr ); 
			this.myPetit =  new Petit(this, petit);
			
			this.timer = null;
			this.scrub.max = petit.op * this.myPetit.normalSpeed
			

			if(this.getAttribute("poster")!=null){
				this.myPetit.setPoster(this.getAttribute("poster"))
			}
			if(this.getAttribute("autoplay")!=null){
			this.play();
		}

			
		}).catch((error) => {
			console.log(error);
			this.displayError("Error petit source : " + error.message + " for : "+ src);
		});
		
		this.connected = true;
		
	}
/*	async fetchPetitJSON(src) {
		  await fetch(src).then( response => {
		  		return (async () => {
					const petit = await response.json();
		  			this.initialyse (petit);
				})();
    		}).catch(error => {
    			console.log(error);
        		alert("error json not found : " + error.message + " \n for : \n"+ src);
    		});;



	}
	initialize (petit) {



	}*/
	displayError(message) {

			const shadowError = document.createElement('div');
			shadowError.classList.add('foo');
			shadowError.textContent = message;
			this.shadowRoot.appendChild (shadowError);
	}
	//TODO backward forward
	play(){
		/*if(this.poster!=null && isNumeric(this.poster) && this.scrub.value==0){
			this.myPetit.animations.forEach(animation => {
				animation.currentTime =0;
			});
		}*/
		this.myPetit.isPlaying = true;
		this.myPetit.playAll();
		this.adjustScrubber();
	}
	pause(){
		this.myPetit.pauseAll();
		this.adjustScrubber();
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
/*   setPoster(kf){
		this.myPetit.animations.forEach(animation => {
			animation.currentTime = +this.poster*this.myPetit.normalSpeed;
		});
	}*/
	showControls(){
		this.shadowRoot.querySelector("#petit-controls").style.display = 'flex';
	}
	hideControls(){
		this.shadowRoot.querySelector("#petit-controls").style.display = 'none';
	}
	
	setAnimations(val) {
		if(!this.myPetit.isPlaying) {
			this.myPetit.pauseAll();
		}
		this.myPetit.animations.forEach(animation => {
			animation.currentTime = val;
		});
		this.adjustScrubber() 
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
loop	loop	Specifies that the petit will start over again, every time it is ended
muted	muted	Specifies that the audio output of the petit should be muted
src	URL	Specifies the URL of the petit file
poster	int	Specifies an frame to be shown until the user hits the play button	
	*/
	
	static get observedAttributes() { return ['src', 'muted', 'autoplay', 'controls', 'loop', 'poster']; }	
	
	attributeChangedCallback(name, oldValue, newValue) {
	
		if( this.connected == true ) {
			console.log('Custom element attributes changed.', name);
			//updateStyle(this);
			
			switch (name) {
				case 'muted':
					if(newValue && newValue!="false") {
						this.mute();
					}
					else {
						this.unmute();
					}
				break;
				case 'autoplay':
					if(newValue && newValue!="false") {
						this.play();
					}
					else {
						this.pause();
					}
				break;

				case 'poster':
					if(newValue ){
						this.myPetit.setPoster(newValue);
					}	
				break;
				case 'src':
					this.getSrc();		
				break;				
				case 'loop':
					if(newValue && newValue!="false") {
						this.addEventListener("ended",  this.play);
					}
					else {
						this.removeEventListener("ended", this.play );
					}
				break;				
				case 'controls':
					if(newValue && newValue!="false") {
						this.showControls();
					}
					else {
						this.hideControls();
					}
				break;								

						
				

				
				default:
					console.log('Empty attribute received.', name);
			}
		}
	}
}
window.customElements.define('petit-player', PetitPlayer);  
