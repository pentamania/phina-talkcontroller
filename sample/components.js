
/**
 * フキダシ拡張
 */
phina.namespace(function() {
  var duration = 200;
  var activateFunc = function() {
    this.visible = true;
    this.tweener.clear()
      .to({alpha: 1}, duration, "easeOutCubic")
    ;
  };

  var deactivateFunc = function() {
    this.tweener.clear()
      .to({alpha: 0}, duration, "easeOutCubic")
    ;
    // var delta = 14;
    // this.tweener.clear()
    //   .by({y: -delta}, duration, "easeOutCubic")
    //   .call(function() {
    //     this.y += delta; // もとに戻す
    //     this.visible = false;
    //   }.bind(this))
    // ;
  };

  phina.define('MyTalkBubble', {
    superClass: 'phina.ui.TalkBubbleLabel',

    init: function(direction) {
      var tipSize = 20;
      var options = {
        tipDirection: 'bottom',
        tipBasePositionRatio: 0.5,
        tipProtrusion: 40,
        tipBottomSize: tipSize,
      };
      this.superInit(options);
    },

    // talkActivate: activateFunc.bind(this),
    talkActivate: function() {
      activateFunc.bind(this)();
    },

    talkDeactivate: function() {
      deactivateFunc.bind(this)();
    },
  });

  phina.define('MyThornedTalkBubbleLabel', {
    superClass: 'phina.ui.ThornedTalkBubbleLabel',

    init: function() {
      this.superInit();
    },

    talkActivate: function() {
      activateFunc.bind(this)();
    },

    talkDeactivate: function() {
      deactivateFunc.bind(this)();
    },
  });
});

/**
 * 会話シーン用キャラ
 */
phina.define('Chara', {
  superClass: 'phina.display.DisplayElement',

  init: function(type, x, y) {
    this.superInit();
    this.target = (type == "circ") ?
      phina.display.CircleShape({stroke: false, fill: "#D82754"}) :
      phina.display.RectangleShape({stroke: false, fill: "#23EC13"})
    ;
    this.target
      .setPosition(x, y)
      .addChildTo(this)
    ;
    this._origPosition = this.target.position.clone();
  },

  // TMactivate: function() {
  talkActivate: function() {
    var delta = 16;
    var duration = 200;
    this.target.tweener.clear()
      .by({y: -delta}, duration, "easeOutCubic")
      .by({y: delta}, duration, "easeOutBounce")
    ;
  },

  talkDeactivate: function() {
    this.target.tweener.clear();
    this.target.setPosition(this._origPosition.x, this._origPosition.y);
  }
});
