class Sound {
  constructor(name, audio) {
    if(!(audio instanceof Audio))
      throw new TypeError('Argument audio that passsed in Sound class should be instance of Audio class!');

    this.audio = audio;
    this.name = name;
  }
}

class AudioPlayer {
  constructor() {
    this.isUserInterracted = IsUserInterracted.getInstance();
  }

  playSound(sound) {
    if(!(sound instanceof Sound))
      throw new TypeError('Argument sound that passsed in AudioPlayer class should be instance of Sound class!');


    if (!this.isUserInterracted.status) {
      console.warn('Can\'t play before user interact with page');
      return;
    }

    const el = sound.audio;
    document.body.appendChild(el);

    const removeEl = () => {
      document.body.removeChild(el);
      el.onended = el.onerror = null;
    }

    el.currentTime = 0;
    el.play().catch(removeEl);

    el.onended = removeEl;
    el.onerror = removeEl;
  }
}

class DrumPlayer extends AudioPlayer {
  constructor(sounds = []) {
    super();

    this.sounds = sounds;
  }

  play(name) {
    for(let sound of this.sounds) {
      if(sound.name === name) {
        this.playSound(sound);
        break;
      }
    }
  }

  addSound(sounds) {
    if(Array.isArray(sounds)) {
      this.sounds.push(...sounds)
    }

    this.sounds.push(sounds);
  }

  removeKeys(soundName) {
    this.sounds = this.sounds.filter(sound => sound.name !== soundName);
  }
}

class Key {
  constructor(keyCode, text, key, onActive = Function.prototype, context = null) {
    this.keyCode = keyCode;
    this.key = key;
    this.text = text;
    this.id = key + ~~(Date.now() / keyCode) + text;
    this.onActive = onActive.bind(context, this.text, this.id);
  }

  render() {
    return /*html*/`
    <div data-key="${this.id}" class="key">
      <kbd>${this.key}</kbd>
      <span class="sound">${this.text}</span>
    </div>
    `;
  }
}

class Keys {
  constructor(selector, keys = []) {
    this.container = document.querySelector(selector);
    this.keys = keys;

    this._init();
  }

  _init() {
    this.render();
    this.container.addEventListener('click', this.onClick.bind(this));
    window.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  onClick(e) {
    const target = e.target.closest('.key');
    if(!target) return;

    const id = target.getAttribute('data-key');

    this.keys.forEach(key => {
      if(key.id === id && typeof key.onActive === 'function')
        key.onActive(e, 'click');
    })
  }

  onKeyDown(e) {
    const keyCode = e.keyCode;
    for (let key of this.keys) {
      if(key.keyCode == keyCode && typeof key.onActive === 'function') {
        key.onActive(e, 'keydown');
        break;
      }
    }
  }

  addKeys(keys) {
    if(Array.isArray(keys)) {
      this.keys.push(...keys)
    }

    this.keys.push(keys);

    this.render();
  }

  removeKeys(keyName) {
    this.keys = this.keys.filter(key => key.keyName !== keyName);

    this.render();
  }

  render() {
    this.container.innerHTML = '';

    this.keys.forEach(key => {
      const value = key.render();

      if(typeof value === 'string')
        return this.container.insertAdjacentHTML('beforeend', value);


      this.container.appendChild(value);
    })
  }
}

class DrumSet {
  constructor(selector) {
    this.player = new DrumPlayer();
    this.keys = new Keys(selector);
  }

  addKey(name, keyCode, key, path) {
    if(path) this.player.addSound(new Sound(name, new Audio(path)));

    this.keys.addKeys(new Key(keyCode, name, key, this._onplay, this));
    return this;
  }

  _onplay(name, id) {
    const keys = document.querySelectorAll(`[data-key="${id}"]`);

    keys.forEach(key => {
      key.classList.toggle('playing');

      function removeTransition(e) {
        if (e.propertyName !== 'transform') return;
        e.target.classList.remove('playing');
      }

      key.addEventListener('transitionend', removeTransition)
    });

    this.player.play(name);
  }
}

class IsUserInterracted {
  static instance = null; 
  
  constructor() {
    this.status = false;
    this._init();
  }

  _init() {
    const events = ["click", "touch", "keydown", "focus"];

    const withEvents = (prefix = 'add') => {
      events.forEach(event => {
        window[prefix + 'EventListener'](event, handler);
      });
    };

    const handler = () => {
      this.status = true;
      withEvents('remove');
    }

    withEvents();
  }

  static getInstance() {
    if(!IsUserInterracted.instance) {
      IsUserInterracted.instance = new IsUserInterracted();
    }

    return IsUserInterracted.instance;
  }
}

IsUserInterracted.getInstance();

window.drum = new DrumSet('.keys')
  .addKey('clap', 65, 'A', 'sounds/clap.wav')
  .addKey('hihat', 83, 'S', 'sounds/hihat.wav')
  .addKey('kick', 68, 'D', 'sounds/kick.wav')
  .addKey('openhat', 70, 'F', 'sounds/openhat.wav')
  .addKey('boom', 71, 'G', 'sounds/boom.wav')
  .addKey('ride', 72, 'H', 'sounds/ride.wav')
  .addKey('snare', 74, 'J', 'sounds/snare.wav')
  .addKey('tom', 75, 'K', 'sounds/tom.wav')
  .addKey('tink', 76, 'L', 'sounds/tink.wav');


document.addEventListener('dblclick', e => {
  e.preventDefault();
  return false;
});


