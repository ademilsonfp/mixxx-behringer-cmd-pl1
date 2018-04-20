
function myCustomDeck(channel, deck) {
  var masterGroup = '[Master]';
  var channelGroup = '[Channel' + (1 + channel) + ']';

  var forceScratch = false;
  var link = {};

  // SETUP AND RELEASE

  deck.playPause.setup = function () {
    updatePlayPause();
    link.playPause = connect('play', updatePlayPause);
  };

  deck.playPause.release = function () {
    link.playPause.disconnect();
    delete link.playPause;

    deck.playPause.led.off();
  };

  deck.pitch.setup = function () {
    deck.pitch.led.level(-1, 1, 0);
  };

  deck.pitch.release = function() {
    deck.pitch.led.off();
  };

  // CONTROLLER CHANGES

  deck.b1.change = function(value, group) {
    if (value) {
      engine.brake(1 + channel, true, 20);
      deck.b1.led.on();
    } else {
      engine.brake(1 + channel, false);
      deck.b1.led.off();
    }
  };

  deck.b2.change = function(value, group) {
    if (value) {
      engine.spinback(1 + channel, true, 1, 1.25);
      deck.b2.led.on();
    } else {
      engine.spinback(1 + channel, false);
      deck.b2.led.off();
    }
  };

  deck.b3.change = function(value, group) {
    if (value) {
      engine.softStart(1 + channel, true, 10, 400);
      deck.b3.led.on();
    } else {
      engine.softStart(1 + channel, false);
      deck.b3.led.off();
    }
  };

  deck.playPause.change = function (value, group) {
    if (true === value) {
      if (!engine.getValue(group, 'play')) {
        engine.setValue(group, 'play', 1);
        deck.playPause.led.on();
      } else {
        engine.setValue(group, 'play', 0);
        deck.playPause.led.off();
      }
    }
  };

  deck.scratch.change = function (value, group) {
    if (value) {
      if (forceScratch) {
        if (engine.isScratching(1 + channel)) {
          disableScratch();
        } else {
          forceScratch = false;
          deck.scratch.led.off();
        }
      } else {
        forceScratch = true;
        deck.scratch.led.on();
      }
    }
  };

  deck.wheel.change = function (value, group) {
    var deckNum = 1 + channel;

    if (true === value) {
      enableScratch();
    } else if (false === value) {
      disableScratch();
    } else if (engine.isScratching(deckNum)) {
      engine.scratchTick(deckNum, value);
    } else if (forceScratch) {
      enableScratch();
    } else  {
      engine.setValue(group, 'jog', value);
    }
  };

  deck.pitch.change = function (value, group) {
    /* CHANGING TEMPO

    var BPM_MIN = 64;
    var BPM_MAX = 140;

    var MIN = -1.0001220852154804; // found this values debugging the controller
    var MAX = 0.9981687217677939;
    var RES = 100;

    var val = (value - MIN) / (MAX - MIN) * (BPM_MAX - BPM_MIN) + BPM_MIN;
    var ival = Math.floor(val);
    val = (ival + Math.round((val - ival) * RES) / RES);

    engine.setValue(group, 'bpm', value);
    deck.pitch.led(-1, 1, value); */

    /* CHANGING NOTES

    var NOTES = 8; // half of total

    engine.setValue(group, 'pitch', NOTES * value);
    deck.pitch.led.level(-1, 1, value); */

    // CHANGING CROSSFADER

    //value = Math.min(1 + value, 1);
    engine.setValue(masterGroup, 'crossfader', value);
    deck.pitch.led.level(-1, 1, value);
  };

  // NON API FUNCTIONS

  function updatePlayPause() {
    if (engine.getValue(channelGroup, 'play')) {
      deck.playPause.led.on();
    } else {
      deck.playPause.led.off();
    }
  }

  function updatePitch() {

  }

  function enableScratch() {
    engine.scratchEnable(1 + channel, 420, 30, .220, .00620);
    deck.scratch.led.blink();
  }

  function disableScratch() {
    forceScratch = false;
    engine.scratchDisable(1 + channel);
    deck.scratch.led.off();
  }

  function connect(ui, callback) {
    return engine.makeConnection(channelGroup, ui, callback);
  }

  function encoderReseter(control) {
    return function() {
      control.led.level(0);
      control.led.off();
    };
  }

  function buttonReseter(control) {
    return function() {
      control.led.off();
    }
  }

  // CONTROLLER GENERIC SETUP

  deck.e1.setup = deck.e1.release = encoderReseter(deck.e1);
  deck.e2.setup = deck.e2.release = encoderReseter(deck.e2);
  deck.e3.setup = deck.e3.release = encoderReseter(deck.e3);
  deck.e4.setup = deck.e4.release = encoderReseter(deck.e4);
  deck.e5.setup = deck.e5.release = encoderReseter(deck.e5);
  deck.e6.setup = deck.e6.release = encoderReseter(deck.e6);
  deck.e7.setup = deck.e7.release = encoderReseter(deck.e7);
  deck.e8.setup = deck.e8.release = encoderReseter(deck.e8);

  deck.b1.setup = deck.b1.release = buttonReseter(deck.b1);
  deck.b2.setup = deck.b2.release = buttonReseter(deck.b2);
  deck.b3.setup = deck.b3.release = buttonReseter(deck.b3);
  deck.b4.setup = deck.b4.release = buttonReseter(deck.b4);
  deck.b5.setup = deck.b5.release = buttonReseter(deck.b5);
  deck.b6.setup = deck.b6.release = buttonReseter(deck.b6);
  deck.b7.setup = deck.b7.release = buttonReseter(deck.b7);
  deck.b8.setup = deck.b8.release = buttonReseter(deck.b8);

  deck.load.setup = deck.load.release = buttonReseter(deck.load);
  deck.lock.setup = deck.lock.release = buttonReseter(deck.lock);
  deck.scratch.setup = deck.scratch.release = buttonReseter(deck.scratch);
  deck.sync.setup = deck.sync.release = buttonReseter(deck.sync);
  deck.tap.setup = deck.tap.release = buttonReseter(deck.tap);
  deck.cue.setup = deck.cue.release = buttonReseter(deck.cue);
  deck.backward.setup = deck.backward.release = buttonReseter(deck.backward);
  deck.forward.setup = deck.forward.release = buttonReseter(deck.forward);
  deck.minus.setup = deck.minus.release = buttonReseter(deck.minus);
  deck.plus.setup = deck.plus.release = buttonReseter(deck.plus);
}

var BehringerCmdPl1Custom = (function () {
  function main() {
    print('setting up custom Behringer CMD PL-1 decks');

    for (var ch = 0; ch < BehringerCmdPl1.deck.length; ch++)
      myCustomDeck(ch, BehringerCmdPl1.deck[ch]);

    BehringerCmdPl1.init(); // forcing reloading
  }

  function kill() {
    print('releasing custom Behringer CMD PL-1 decks');
  }

  return { init: main, shutdown: kill };
})();
