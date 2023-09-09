class DomEventsController {
  constructor() {
    this.events = {
      remove: {}
    }
  }

  on(event, cb) {
    if(!this.events[event]) {
      this.events[event] = [];
      this.events.remove[event] = this._initEvent(event);
    }

    this.events[event].push(cb);
  }

  off(event, cb) {
    if(!this.events[event])
      return;


    const idx = this.events[event].findIndex(fn => fn.toString() === cb.toString())
    if(idx < 0) return;

    this.events[event] = [
      ...this.events[event].slice(0, idx),
      ...this.events[event].slice(idx + 1)
    ];

    if(!this.events[event].length) {
      delete this.events[event];
      this._removeEventListener(event)
    }
  }

  _initEvent(event) {
    const cb = this._eventHandler.bind(this, event);

    document.addEventListener(event, cb);

    return () => document.removeEventListener(event, cb);
  }

  _eventHandler(eventType, ...args) {
    this.events[eventType].forEach(fn => fn(...args));
  }

  _removeEventListener(event) {
    const fn = this.events.remove[event];
    if(!fn) return;

    fn();

    delete this.events.remove[event];
  }

}


class Video extends DomEventsController {
  constructor(url) {
    super();
    this.video = document.createElement('video');
    this.url = url;
    this.video.src = url;
    this.video.classList.add('player__video', 'viewer');
  }

  render() {
    return this.video;
  }
}

class VideoControllers extends Video {
  constructor(url) {
    super(url);
    this.controller = document.createElement('div');
    this.components = {};
    this.isFullScreen = false;

    this._initTemplate();
    this._initHandlers();
  }

  _initTemplate() {
    const html = /*html*/`
      <div class="progress">
        <div class="progress__filled"></div>
      </div>
      <button class="player__button toggle" title="Toggle Play">►</button>
      <input type="range" name="volume" class="player__slider" min="0" max="1" step="0.05" value="1">
      <input type="range" name="playbackRate" class="player__slider" min="0.5" max="2" step="0.25" value="1">
      <button data-skip="-10" class="player__button">« 10s</button>
      <button data-skip="10" class="player__button">10s »</button>
    `;

    this.controller.classList.add('player__controls');
    this.controller.insertAdjacentHTML('afterbegin', html);
    
    const playToggle  = this.controller.querySelector('.player__button.toggle');
    const progress    = this.controller.querySelector('.progress');
    const progressBar = this.controller.querySelector('.progress__filled');
    const skipButtons = this.controller.querySelectorAll('[data-skip]');
    const ranges      = this.controller.querySelectorAll('.player__slider');

    this.components = {
      playToggle,
      progress,
      progressBar,
      skipButtons,
      ranges
    }
  }

  _initHandlers() {
    this.on('click', this.playToggleHandler.bind(this));
    this.on('click', this.skipButtonsHandler.bind(this));
    this.on('click', this.videoClickHandler.bind(this));
    this.on('mousedown', this.progressDragHandler.bind(this));
    this.on('keydown', this.delegateKeyPress.bind(this));
    this.on('input', this.volumeHandler.bind(this));
    this.on('input', this.playbackRateHandler.bind(this));
   
    this.video.addEventListener('timeupdate', this.handleProgress.bind(this));
    this.video.addEventListener('dblclick', this.toggleFullScreen.bind(this));
  }

  scrub(e) {
    const scrubTime = (e.offsetX / this.components.progress.offsetWidth) * this.video.duration;
    this.video.currentTime = scrubTime;
  }

  progressDragHandler(e) {
    const target = e.target.closest('.progress');
    if(!target) return;
    this.scrub(e);

    const onMouseMove = (e) => {
      this.scrub(e);
    }

    const onMouseUp = (e) => {
      document.onmousemove = null;
      document.onmouseup = null;
    }

    document.onmousemove = onMouseMove;
    document.onmouseup = onMouseUp;
  }

  toggleFullScreen(e) {
    if(!this.isFullScreen) {
      this.video.closest('.player').requestFullscreen();
      this.isFullScreen = true;
    } else {
      document.exitFullscreen();
      this.isFullScreen = false;
    }
  }

  delegateKeyPress(e) {
    if(e.keyCode == 32) this.playToggleHandler(e);
    if(e.keyCode == 39) this.skipVideo(10);
    if(e.keyCode == 37) this.skipVideo(-10);
  }

  videoClickHandler(e) {
    if(e.target === this.video) this.playToggleHandler(e);
  }

  volumeHandler(e) {
    const target = e.target;
    if(target.name !== 'volume') return;

    this.video.volume = target.value;
  }

  playbackRateHandler(e) {
    const target = e.target;
    if(target.name !== 'playbackRate') return;

    this.video.playbackRate = target.value;
  }

  playToggleHandler(e) {
    if(e instanceof PointerEvent) {
      const target = e.target;
      const closest = target.closest('.toggle');
      if(closest !== this.components.playToggle) return;
    } else {
      this.components.playToggle.blur();
    }


    const [method, icon] = this.video.paused ?
    ['play', '❚ ❚']
    : ['pause', '►'];


    this.video[method]();
    this.components.playToggle.textContent = icon;

  }

  skipButtonsHandler(e) {
    const target = e.target;
    const closest = target.closest('[data-skip]');
    if(!closest) return;

    this.skipVideo(+closest.dataset.skip);
  }

  skipVideo(timeToSkip) {
    this.video.currentTime += timeToSkip;
  }

  handleProgress(e) {
    const percent = (this.video.currentTime / this.video.duration) * 100;
    this.components.progressBar.style.flexBasis = `${percent}%`;
  }

  render() {
    return [super.render(), this.controller];
  }
}


class VideoPlayer extends VideoControllers{
  constructor(url) {
    super(url)
  }


  render(selector) {
    const container = document.querySelector(selector);
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.classList.add('player');

    const [video, controllers] = super.render();
    wrapper.appendChild(video);
    wrapper.appendChild(controllers);

    container.appendChild(wrapper);
  }
}


new VideoPlayer('652333414.mp4').render('.container');
