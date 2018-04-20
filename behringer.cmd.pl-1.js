
var BehringerCmdPl1 = (function () {
  var CC = {
    E1: 0x00,
    E2: 0x01,
    E3: 0x02,
    E4: 0x03,
    E5: 0x04,
    E6: 0x05,
    E7: 0x06,
    E8: 0x07,

    PITCH_LED: 0x0a,

    B1: 0x10,
    B2: 0x11,
    B3: 0x12,
    B4: 0x13,
    B5: 0x14,
    B6: 0x15,
    B7: 0x16,
    B8: 0x17,
    LOAD: 0x18,
    LOCK: 0x19,
    DECK: 0x1a,
    SCRATCH: 0x1b,

    WHEEL: 0x1f,

    SYNC: 0x20,
    TAP: 0x21,
    CUE: 0x22,
    PLAY_PAUSE: 0x23,
    BACKWARD: 0x24,
    FORWARD: 0x25,
    MINUS: 0x26,
    PLUS: 0x27
  };

  var STATUS = {
    BUTTON_UP: 0x80,
    BUTTON_DOWN: 0x90,
    ENCODER: 0xb0,
    PITCH: 0xe0
  };

  var VALUE = {
    ENCODER_UP: 0x41,
    ENCODER_DOWN: 0x3f
  };

  var LED_STATUS = {
    ENCODER: 0xb0,
    BUTTON: 0x90
  };

  var CC_NAME = {};
  CC_NAME[CC.E1] = 'e1'; 
  CC_NAME[CC.E2] = 'e2'; 
  CC_NAME[CC.E3] = 'e3'; 
  CC_NAME[CC.E4] = 'e4'; 
  CC_NAME[CC.E5] = 'e5'; 
  CC_NAME[CC.E6] = 'e6'; 
  CC_NAME[CC.E7] = 'e7'; 
  CC_NAME[CC.E8] = 'e8';  
  CC_NAME[CC.B1] = 'b1'; 
  CC_NAME[CC.B2] = 'b2'; 
  CC_NAME[CC.B3] = 'b3'; 
  CC_NAME[CC.B4] = 'b4'; 
  CC_NAME[CC.B5] = 'b5'; 
  CC_NAME[CC.B6] = 'b6'; 
  CC_NAME[CC.B7] = 'b7'; 
  CC_NAME[CC.B8] = 'b8'; 
  CC_NAME[CC.LOAD] = 'load'; 
  CC_NAME[CC.LOCK] = 'lock'; 
  CC_NAME[CC.DECK] = 'deck'; 
  CC_NAME[CC.SCRATCH] = 'scratch'; 
  CC_NAME[CC.WHEEL] = 'wheel'; 
  CC_NAME[CC.SYNC] = 'sync'; 
  CC_NAME[CC.TAP] = 'tap'; 
  CC_NAME[CC.CUE] = 'cue'; 
  CC_NAME[CC.PLAY_PAUSE] = 'playPause'; 
  CC_NAME[CC.BACKWARD] = 'backward'; 
  CC_NAME[CC.FORWARD] = 'forward'; 
  CC_NAME[CC.MINUS] = 'minus'; 
  CC_NAME[CC.PLUS] = 'plus'; 

  function toImplement() {}

  function main() {
    var deck, control;
    for (deck = 0; deck < api.length; deck++)
      for (control in api[deck]) api[deck][control].setup();

    print('> Behringer CMD PL-1 restored <');
  }

  function kill() {
    var deck, control;
    for (deck = 0; deck < api.length; deck++)
      for (control in api[deck]) api[deck][control].release();

    print('> Behringer CMD PL-1 released <');
  }

  function pitch(channel, control, value, status, group) {
    api[channel].pitch.change(script.midiPitch(control, value, status), group);
  }

  function encoder(channel, control, value, status, group) {
    if (VALUE.ENCODER_UP === value) {
      api[channel][CC_NAME[control]].change(1, group);
    } else if (VALUE.ENCODER_DOWN === value) {
      api[channel][CC_NAME[control]].change(-1, group);
    } else {
      api[channel][CC_NAME[control]].change(value - 0x40, group);
    }
  }

  function buttonUp(channel, control, value, status, group) {
    api[channel][CC_NAME[control]].change(false, group);
  }

  function buttonDown(channel, control, value, status, group) {
    api[channel][CC_NAME[control]].change(true, group);
  }

  function ledOn(channel, control) {
    midi.sendShortMsg(channel + LED_STATUS.BUTTON, control, 1);
  }

  function ledOff(channel, control) {
    midi.sendShortMsg(channel + LED_STATUS.BUTTON, control, 0);
  }

  function ledBlink(channel, control) {
    midi.sendShortMsg(channel + LED_STATUS.BUTTON, control, 2);
  }

  function ledLevel(channel, control, minimum, maximum, value) {
    var level = 1 + Math.round((value - minimum) / (maximum - minimum) * 15);
    midi.sendShortMsg(channel + LED_STATUS.ENCODER, control, level);
  }

  function ledLevelOff(channel, control) {
    midi.sendShortMsg(channel + LED_STATUS.ENCODER, control, 0);
  }

  function controlApi() {
    return {
      setup: toImplement,
      release: toImplement,
      change: toImplement
    };
  }

  function pitchLed(channel) {
    return {
      off: function () { ledLevelOff(channel, CC.PITCH_LED) },

      level: function (min, max, val) {
        ledLevel(channel, CC.PITCH_LED, min, max, val);
      }
    };
  }

  function encoderLedApi(channel, control) {
    return {
      on: function () { ledOn(channel, control) },
      blink: function () { ledOff(channel, control) },

      off: function () {
        ledOff(channel, control);
        ledLevelOff(channel, control);
      },

      level: function (min, max, val) {
        ledLevel(channel, control, min, max, val);
      }
    };
  }

  function buttonLedApi(channel, control) {
    return {
      on: function () { ledOn(channel, control) },
      off: function () { ledOff(channel, control) },
      blink: function () { ledBlink(channel, control) }
    };
  }

  function deckApi(channel) {
    var cc = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'pitch', 'b1',
        'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'load', 'lock', 'deck',
        'scratch', 'wheel', 'sync', 'tap', 'cue', 'playPause', 'backward',
        'forward', 'minus', 'plus'];

    var rings = [CC.E1, CC.E2, CC.E3, CC.E4, CC.E5, CC.E6, CC.E7, CC.E8];

    var buttons = [CC.B1, CC.B2, CC.B3, CC.B4, CC.B5, CC.B6, CC.B7, CC.B8,
        CC.LOAD, CC.LOCK, CC.SCRATCH, CC.SYNC, CC.TAP, CC.CUE, CC.PLAY_PAUSE,
        CC.BACKWARD, CC.FORWARD, CC.MINUS, CC.PLUS];

    var i, deck = {};
    for (i = 0; i < cc.length; i++) deck[cc[i]] = controlApi();
    deck.pitch.led = pitchLed(channel);

    for (i = 0; i < rings.length; i++)
      deck[CC_NAME[rings[i]]].led = encoderLedApi(channel, rings[i]);

    for (i = 0; i < buttons.length; i++)
      deck[CC_NAME[buttons[i]]].led = buttonLedApi(channel, buttons[i]);

    return deck;
  }

  var api = [deckApi(0), deckApi(1), deckApi(2), deckApi(3)];

  return {
    CC: CC,
    STATUS: STATUS,
    VALUE: VALUE,
    LED_STATUS: LED_STATUS,

    deck: api,
    init: main,
    shutdown: kill,
    pitch: pitch,
    encoder: encoder,
    buttonDown: buttonDown,
    buttonUp: buttonUp
  };
})();
