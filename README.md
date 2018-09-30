# phina-talkcontroller

phina.jsで会話シーンを簡易化するための補助プラグイン

**[サンプル](https://pentamania.github.io/phina-talkcontroller/sample/)**

## ライブラリ読み込み

```html
<!DOCTYPE html>

<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>talkcontroller</title>
</head>
<body>

<script src='https://cdn.rawgit.com/phi-jp/phina.js/v0.2.0/build/phina.js'></script>
<script src='path/to/phina-talkcontroller.js'></script>

</body>
</html>
```

### テキストデータの用意
以下のようなcsvチックなデータを用意する。

```txt
# [textAreaId], [textString], [reactingObjectId], [callBackEventId]のフォーマットで記述
# 行頭にシャープもしくは//をつけるとコメントアウト
// \nで改行する

ta, これはコーラですか？, cL, evstart
ta, いいえ、\nそれは醤油です, cR
ta, ～完～
```

テキストデータはローダーで読み込んでおく。

```js
var app = phina.game.GameApp({
  //...中略
  assets: {
    text: {
      serifu: "./data/serifu.csv"
    }
  }
  //...中略
});

app.run();
```

### idの割り当て
テキストデータ中のテキストエリアid等と描画オブジェクトとを紐づける。

```js
phina.define('MainScene', {
  superClass: 'phina.display.DisplayScene',

  init: function(options) {
    this.superInit(options);
    var gx = this.gridX;
    var gy = this.gridY;

    /* キャラクター */
    var john = phina.display.Sprite("John_image")
      .setPosition(gx.span(4), gy.span(8))
      .addChildTo(this);
    var hanako = phina.display.Sprite("Hanako_image")
      .setPosition(gx.span(12), gy.span(8))
      .addChildTo(this);

    /* テキストオブジェクト */
    var textArea = phina.ui.LabelArea()
      .setPosition(gx.span(8), gy.span(4))
      .addChildTo(this);

    var talkControllerOption = {
      // テキスト表示オブジェクト：LabelやTextAreaクラスなど
      textAreas: [
        {
          id: "ta", // 識別キー
          entity: textArea,
        },
      ],

      // テキスト進めた際に反応するオブジェクト：キャラとか
      reactiveObjects: [
        {
          id: "cL",
          entity: john,
        },
        {
          id: "cR",
          entity: hanako,
        }
      ],

      // テキスト進めた際に実行するコールバックイベント
      events: [
        {
          id: "evstart",
          action: function() {
            console.log("会話開始");
          },
        }
      ],
    };

    // TalkControllerには読み込んだテキストデータのキー名及びオプションを渡す
    this.talkController = phina.util.TalkController('serifu', talkControllerOption);
});
```

### 会話の進行
TalkController.stepメソッドで進める

```js
phina.define('MainScene', {
  superClass: 'phina.display.DisplayScene',

  // ...中略

  update: function(app) {
    var p = app.pointer;
    var kb = app.keyboard;

    if (p.getPointingStart() || kb.getKeyDown('z')) {
      this.talkController.step();
    }
  },
})
```

### リアクションさせる
textAreaオブジェクトやreactiveオブジェクトにtalkActivate(talkDeactivate)を設定すると、
それぞれアクティブ（非アクティブ）状態になった際にコールバックを実行可能。

```js
var john = phina.display.Sprite("John_image")
  .setPosition(gx.span(4), gy.span(8))
  .addChildTo(this);
john.talkActivate = function() {
  john.visible = true;
};
john.talkDeactivate = function() {
  john.visible = false;
};
```
