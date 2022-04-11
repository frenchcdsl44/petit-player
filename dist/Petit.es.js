class Petit {
  constructor(playerEl, petit) {
    var _a, _b;
    this.version = 0.1;
    this.petit = petit;
    this.playerEl = playerEl;
    this.animations = [];
    this.isPlaying = false;
    this.normalSpeed = Math.round(1e3 / (petit.fr ? petit.fr : 60));
    (_a = petit.layers) == null ? void 0 : _a.forEach((elCollection, i) => {
      const els = playerEl.querySelectorAll(elCollection.sel);
      let animArray = [];
      let minkft = elCollection.kf[0].kft;
      let maxkft = elCollection.kf[elCollection.kf.length - 1].kft;
      const timing = {
        duration: (maxkft - minkft) * this.normalSpeed,
        fill: "both",
        delay: minkft * this.normalSpeed,
        endDelay: (petit.op - maxkft) * this.normalSpeed
      };
      const duration = maxkft - minkft > 0 ? maxkft - minkft : 1;
      elCollection.kf.forEach(function(kf, index) {
        if (kf.kft) {
          let newkft = (kf.kft - minkft) / duration;
          kf.offset = newkft;
        }
        animArray.push(kf);
      });
      els.forEach((el) => {
        let anim = new KeyframeEffect(el, animArray, elCollection.t ? elCollection.t : timing);
        let animation = new Animation(anim);
        this.animations.push(animation);
        playerEl.dispatchEvent(new CustomEvent("added", { detail: { animation, sequence: animArray, timining: timing } }));
      });
    });
    (_b = petit.events) == null ? void 0 : _b.forEach((elCollection, i) => {
    });
    this.animations[0].addEventListener("finish", () => {
      this.isPlaying = false;
      playerEl.dispatchEvent(new CustomEvent("finished"));
    });
  }
  pauseAll() {
    this.isPlaying = false;
    this.animations.forEach((animation) => {
      animation.pause();
    });
    this.playerEl.dispatchEvent(new CustomEvent("pause"));
  }
  finishAll() {
    this.isPlaying = false;
    this.animations.forEach((animation) => {
      animation.finish();
    });
    this.playerEl.dispatchEvent(new CustomEvent("finished"));
  }
  playAll() {
    this.isPlaying = true;
    this.playerEl.dispatchEvent(new CustomEvent("play"));
    this.animations.forEach((animation) => {
      animation.play();
    });
  }
}
export { Petit as default };
