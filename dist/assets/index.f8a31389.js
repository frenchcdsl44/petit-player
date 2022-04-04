const b=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function e(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerpolicy&&(i.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?i.credentials="include":r.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(r){if(r.ep)return;r.ep=!0;const i=e(r);fetch(r.href,i)}};b();class g{constructor(t,e){this.audioArray=[],this.normalSpeed=e,this.state="paused",this.previousTime=-1,t.addEventListener("rebase",()=>{this.rebaseAll()}),t.addEventListener("finished",()=>{this.rebaseAll(),this.state="paused",console.log("finished")}),t.addEventListener("pause",()=>{this.pauseAll()}),t.addEventListener("play",()=>{this.playAll()}),t.addEventListener("seek",s=>{this.seek(s.detail.time)}),t.addEventListener("added",s=>{s.detail.animation.effect.target.tagName.toLowerCase()=="audio"&&this.add(s.detail.animation.effect.target,s.detail.sequence)}),t.addEventListener("changescrub",s=>{this.changeScrub(s.detail)}),t.addEventListener("mute",()=>{this.muteAll(!0)}),t.addEventListener("unmute",()=>{this.muteAll(!1)})}muteAll(t){this.audioArray.forEach(e=>{e.el.muted=t})}rebaseAll(){this.previousTime=-1,this.audioArray.forEach(t=>{t.el.pause(),t.el.currentTime=0})}add(t,e){e.forEach((s,r)=>{let i=s.kft*this.normalSpeed;isNaN(t.duration)&&(t.onloadeddata=n=>{this.audioArray.forEach(function(h,u){h.el==n.target&&(h.duration=n.target.duration)})}),this.audioArray.push({el:t,start:i,duration:t.duration})})}playAll(){this.state="playing",this.audioArray.forEach(t=>{t.el.currentTime>0&&setTimeout(function(){t.el.play()},0)})}pauseAll(){this.state="paused",this.audioArray.forEach(t=>{t.el.pause()})}seek(t){this.audioArray.forEach(e=>{this.previousTime<e.start&&e.start<=t&&(e.el.pause(),e.el.currentTime=(t-e.start)/1e3,setTimeout(function(){e.el.play()},0))}),this.previousTime=t}changeScrub(t){this.audioArray.forEach(e=>{t>e.start&&t<=e.start+e.duration*1e3?(e.el.pause(),e.el.currentTime=(t-e.start)/1e3,this.state=="playing"&&setTimeout(function(){e.el.play()},0)):(e.el.pause(),e.el.currentTime=0)})}}class E{constructor(t,e){var s,r;this.version=.1,this.petit=e,this.playerEl=t,this.animations=[],this.isPlaying=!1,this.normalSpeed=Math.round(1e3/(e.fr?e.fr:60)),(s=e.layers)==null||s.forEach((i,n)=>{const h=t.querySelectorAll(i.sel);let u=[],l=i.kf[0].kft,d=i.kf[i.kf.length-1].kft;const m={duration:(d-l)*this.normalSpeed,fill:"both",delay:l*this.normalSpeed,endDelay:(e.op-d)*this.normalSpeed},y=d-l>0?d-l:1;i.kf.forEach(function(o,f){if(o.kft){let c=(o.kft-l)/y;o.offset=c}u.push(o)}),h.forEach(o=>{let f=new KeyframeEffect(o,u,i.t?i.t:m),c=new Animation(f);this.animations.push(c),t.dispatchEvent(new CustomEvent("added",{detail:{animation:c,sequence:u,timining:m}}))})}),(r=e.events)==null||r.forEach((i,n)=>{}),this.animations[0].addEventListener("finish",()=>{this.isPlaying=!1,t.dispatchEvent(new CustomEvent("finished"))})}pauseAll(){this.isPlaying=!1,this.animations.forEach(t=>{t.pause()}),this.playerEl.dispatchEvent(new CustomEvent("pause"))}finishAll(){this.isPlaying=!1,this.animations.forEach(t=>{t.finish()}),this.playerEl.dispatchEvent(new CustomEvent("finished"))}playAll(){this.isPlaying=!0,this.playerEl.dispatchEvent(new CustomEvent("play")),this.animations.forEach(t=>{t.play()})}}function p(a){return typeof a!="string"?!1:!isNaN(a)&&!isNaN(parseFloat(a))}class v extends HTMLElement{constructor(){super(),this.connected=!1}connectedCallback(){const t=`
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
			<p class="support">Requires native Web Animation Support (latest Firefox, Chrome, Opera)</p>
			<slot></slot>
			<ul id="petit-controls">
				<li><button class="playb">&#62;</button></li>
				<li class="scrubbar"><input type="range" value="0" min="0" step="1" class="scrub" /></li>
				<li><button class="muted">&#x1f507;</button></li>
				<li><button class="debug">?</button></li>
			</ul>
			<slot name="aftercontrols"></slot>
		`,e=document.createElement("template");e.innerHTML=t,this.attachShadow({mode:"open"}).appendChild(e.content.cloneNode(!0)),this.version=.1,this.getSrc()}getSrc(){let t=this.getAttribute("src");fetch(t).then(e=>{if(e.ok)return e.json();throw console.log(e),this.displayError("Error petit source : "+e.statusText+" for : "+t),new Error("Sorry cannot play animation")}).then(e=>{new g(this,Math.round(1e3/e.fr)),this.myPetit=new E(this,e),this.timer=null,this.playButton=this.shadowRoot.querySelector(".playb"),this.scrub=this.shadowRoot.querySelector(".scrub"),this.scrub.value=0,this.scrub.max=e.op*this.myPetit.normalSpeed,this.playButton.addEventListener("mouseup",s=>{this.myPetit.isPlaying?this.myPetit.pauseAll():this.play()}),this.shadowRoot.querySelector(".debug").addEventListener("mouseup",s=>{prompt(`Petit Player 
please report bugs with your petit file and the following info :`,"Petit version :"+this.myPetit.version+`
Player version :`+this.version+`
Browser`+navigator.userAgent)}),this.muted=this.getAttribute("muted"),this.mutedButton=this.shadowRoot.querySelector(".muted"),this.mutedButton.addEventListener("mouseup",s=>{this.muted?this.setAttribute("muted",!1):this.setAttribute("muted",!0)}),this.muted!=null&&this.mute(),this.addEventListener("play",()=>{this.playButton.innerHTML="II"}),this.addEventListener("pause",()=>{this.playButton.innerHTML=">"}),this.addEventListener("finished",()=>{this.playButton.innerHTML=">"}),console.log("TODO replace myPetit"),document.body.animate||this.shadowRoot.querySelector(".support").classList.add("unsupported"),this.scrub.addEventListener("input",s=>{console.log("input",s.currentTarget.value);var r=s.currentTarget.value;this.myPetit.animations.forEach(i=>{i.currentTime=r}),this.myPetit.isPlaying||this.myPetit.pauseAll()}),this.scrub.addEventListener("change",s=>{if(console.log("change",s.currentTarget.value),this.myPetit.animations[0].currentTime>=s.currentTarget.getAttribute("max"))return this.myPetit.finishAll(),!1;this.dispatchEvent(new CustomEvent("rebase")),this.dispatchEvent(new CustomEvent("changescrub",{detail:parseInt(this.scrub.value)})),this.adjustScrubber(),this.myPetit.isPlaying&&this.myPetit.playAll()}),this.getAttribute("autoplay")!=null&&this.play(),this.getAttribute("controls")!=null&&this.getAttribute("controls")=="false"&&this.showControls(),this.getAttribute("loop")!=null&&this.addEventListener("finished",this.play),this.poster=this.getAttribute("poster"),this.poster!=null&&p(this.poster)&&this.setPoster(this.poster)}).catch(e=>{console.log(e),this.displayError("Error petit source : "+e.message+" for : "+t)}),this.connected=!0}displayError(t){const e=document.createElement("div");e.classList.add("foo"),e.textContent=t,this.shadowRoot.appendChild(e)}play(){this.poster!=null&&p(this.poster)&&this.myPetit.animations.forEach(t=>{t.currentTime=0}),this.myPetit.isPlaying=!0,this.myPetit.playAll(),this.adjustScrubber()}pause(){this.myPetit.pauseAll()}mute(){this.muted=!0,this.mutedButton.innerHTML="&#x1f50a;",this.dispatchEvent(new CustomEvent("mute"))}unmute(){this.muted=!1,this.mutedButton.innerHTML="&#x1f507;",this.dispatchEvent(new CustomEvent("unmute"))}setPoster(t){this.myPetit.animations.forEach(e=>{e.currentTime=+this.poster*this.myPetit.normalSpeed})}showControls(){this.shadowRoot.querySelector("#petit-controls").style.display="flex"}hideControls(){this.shadowRoot.querySelector("#petit-controls").style.display="none"}adjustScrubber(){let t=this.myPetit.animations[0].currentTime;this.scrub.value=t||0,cancelAnimationFrame(this.timer),this.myPetit.isPlaying&&(this.dispatchEvent(new CustomEvent("seek",{detail:{time:parseInt(this.scrub.value)}})),this.timer=requestAnimationFrame(()=>this.adjustScrubber()))}static get observedAttributes(){return["src","muted","autoplay","controls","loop","poster"]}attributeChangedCallback(t,e,s){if(this.connected==!0)switch(console.log("Custom element attributes changed.",t),t){case"muted":s&&s!="false"?this.mute():this.unmute();break;case"autoplay":s&&s!="false"?this.play():this.pause();break;case"poster":s&&p(s)&&(this.poster=s,this.setPoster(s));break;case"src":this.getSrc();break;case"loop":s&&s!="false"?this.addEventListener("finished",this.play):this.removeEventListener("finished",this.play);break;case"controls":s&&s!="false"?this.showControls():this.hideControls();break;default:console.log("Empty attribute received.",t)}}}window.customElements.define("petit-player",v);
