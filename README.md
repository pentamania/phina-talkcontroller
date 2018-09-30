# phina-talkController

phina.jsで会話シーンをやってみるテスト

**[サンプル](https://pentamania.github.io/phina-talkcontroller/sample/)**

## ライブラリ読み込み

```html
<!DOCTYPE html>

<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>title</title>
</head>
<body>

<script src='http://cdn.rawgit.com/phi-jp/phina.js/v0.2.0/build/phina.js'></script>
<script src='./src/TalkManager.js'></script>

</body>
</html>
```

### テキストデータの用意
以下のようなcsvチックなデータを用意する。

```txt
# [textAreaId], [textString], [reactingObjectId], [callBackEventId]のフォーマットで記述
# 行頭にシャープもしくは//をつけるとコメントアウト
// \nで改行 する

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

### id割り当て
テキストデータ中のテキストエリアid等と描画オブジェクトとを紐づけ。

```js
phina.define('MainScene', {
  superClass: 'phina.display.DisplayScene',

  init: function(options) {
    this.superInit(options);
    var gx = this.gridX;
    var gy = this.gridY;

    /* キャラクター */
    var john = phina.display.Sprite("John_image").addChildTo(this);
    var hanako = phina.display.Sprite("Hanako_image").addChildTo(this);

    /* テキストオブジェクト */
    var textArea = phina.ui.LabelArea()
      .setPosition(gx.span(6), gy.span(6))
      .addChildTo(this);

    var talkManagerOption = {
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

    // TalkManagerには読み込んだテキストデータのキー及びオプションを渡す
    this.talkManager = TalkManager('serifu', talkManagerOption);
});
```

### step
会話の進行はstepで進める

```js
phina.define('MainScene', {
  superClass: 'phina.display.DisplayScene',

  // ...中略

  update: function(app) {
    var p = app.pointer;
    var kb = app.keyboard;

    if (p.getPointingStart() || kb.getKeyDown('z')) {
      this.talkManager.step();
    }
  },
})
```

