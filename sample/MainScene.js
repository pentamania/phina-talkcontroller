
/**
 * main scene
 */
phina.define('MainScene', {
  superClass: 'phina.display.DisplayScene',

  init: function(options) {
    this.superInit(options);
    var gx = this.gridX;
    var gy = this.gridY;

    phina.display.Label({
      text: "画面タップで進む",
      fill: "#514839",
      fontSize: 38,
    })
      .setPosition(gx.center(), gy.span(2))
      .addChildTo(this)
    ;

    /* リアクションオブジェクト */
    var leftChara = Chara('circ', gx.span(6), gy.span(9))
      .addChildTo(this);
    var rightChara = Chara('rect', gx.span(10), gy.span(9))
      .addChildTo(this);

    /* テキストラベル系オブジェクト */
    var leftTB = MyTalkBubble()
      .setPosition(gx.span(6), gy.span(6))
      .addChildTo(this)
    ;
    var rightTB = MyTalkBubble()
      .setPosition(gx.span(10), gy.span(6))
      .addChildTo(this)
    ;
    var leftTTB = MyThornedTalkBubbleLabel()
      .setPosition(gx.span(6), gy.span(6))
      .addChildTo(this)
    ;
    var rightTTB = MyThornedTalkBubbleLabel({
      fill: "white",
    })
      .setPosition(gx.span(10), gy.span(6))
      .addChildTo(this)
    ;
    var centerLabel = phina.display.Label({
      fill: "#514839",
      fontSize: 140,
    })
      .setPosition(gx.center(), gy.center())
      .addChildTo(this)
    ;

    // 会話シーン用オプション
    var talkManagerOption = {
      textAreas: [
        {
          id: "bl_0", // 識別キー
          entity: leftTB,
        },
        {
          id: "br_0",
          entity: rightTB,
        },
        {
          id: "bl_1",
          entity: leftTTB,
        },
        {
          id: "br_1",
          entity: rightTTB,
        },
        {
          id: "mes",
          entity: centerLabel,
          // アクティブ・非アクティブ時の操作
          activateFunc: function() {
            this.visible = true;
          },
          deactivateFunc: function() {
            this.visible = false;
          },
        },
      ],

      reactionObjects: [
        {
          id: "cl",
          entity: leftChara,
          // activateFunc: function() {
          //   var delta = 16;
          //   var duration = 1200;
          //   this.target.tweener.clear()
          //     .by({y: -delta}, duration, "easeOutCubic")
          //     .by({y: delta}, duration, "easeOutBounce")
          //   ;
          // },
        },
        {
          id: "cr",
          entity: rightChara,
          // className: 'TalkSceneCharacter',
          // arguments: ["blaze", gx.span(15), 500, 'right'],
        }
      ],

      events: [
        {
          id: "e0",
          action: function() {
            console.log("callbackだよ!!");
          },
        }
      ],
    };
    var tm = this.talkManager = phina.util.TalkController('mukashibanashi', talkManagerOption);
    tm.reset();

    /* resetボタン */
    var resetButton = phina.ui.Button({text:"もう一回"})
      .setPosition(gx.center(), gy.span(13))
      .setVisible(false)
      .addChildTo(this);
    resetButton.on('push', function() {
      if (!this.visible) return;
      tm.reset();
      // tm.step();
      this.setVisible(false);
    });
    this.talkManager.on('talkend', function() {
      resetButton.setVisible(true);
    });
  },

  update: function(app) {
    var p = app.pointer;
    var kb = app.keyboard;

    if (p.getPointingStart() || kb.getKeyDown('z')) {
      this.talkManager.step();
    }
  },

});
