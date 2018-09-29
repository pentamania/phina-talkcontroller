/*!
 * phina-talkcontroller.js 0.1.0
 * plugin for phina.js
 * MIT Licensed
 *
 * Copyright (C) 2018 pentamania
 */

phina.namespace(function() {
  /*
    var talkControllerSetting = {
      textAreas: [
        {
          id: string, // 識別キー
          entity: string|Function, // クラス名stringもしくはinstance
        }
      ],
      reactionObjects: [
        {
          id: string,
          entity: string|Function,
        }
      ],
      events: [
        {
          id: string,
          action: function, // コールバック
        }
      ],
    }
  */

  /**
   * @class TalkManager
   *
   * @param {string} textFileKey - AssetManagerのkey
   * @param {talkControllerSetting} settings - idの割当とか
   */
  phina.define('phina.util.TalkController', {
    superClass: 'phina.util.EventDispatcher',

    init: function(textFileKey, setting) {
      this.superInit();
      this._index = 0;

      /* textArea setup */
      this._textAreaObjectMap = {};
      setting.textAreas.forEach(function(params) {
        var areaObj;
        if (typeof params.entity === 'string') {
          var klass = phina.using(params.entity);
          if (typeof klass !== 'function') throw Error(params.entity+'は定義されてません');
          areaObj = klass();
        } else {
          areaObj = params.entity;
        }
        if (params.activateFunc) {
          areaObj.talkActivate = params.activateFunc.bind(areaObj);
        }
        if (params.deactivateFunc) {
          areaObj.talkDeactivate = params.deactivateFunc.bind(areaObj);
        }

        this._textAreaObjectMap[params.id] = areaObj;
      }.bind(this));

      /* reactionObject setup */
      this._reactionObjectMap = {};
      if (setting.reactionObjects) {
        setting.reactionObjects.forEach(function(data) {
          var entity;
          if (typeof data.entity === 'string') {
            var klass = phina.using(data.entity);
            if (typeof klass !== 'function') throw Error(data.entity+'は定義されてません');
            entity = klass.apply(null, data.arguments);
          } else {
            entity = data.entity;
          }

          /* activate(deactivate) method setup(override) */
          if (data.activateFunc) {
            entity.talkActivate = data.activateFunc.bind(entity);
          }
          if (data.deactivateFunc) {
            entity.talkDeactivate = data.deactivateFunc.bind(entity);
          }

          // entity._id = data.id;
          this._reactionObjectMap[data.id] = entity;
        }.bind(this));
      }

      /* イベントセット */
      this._eventMap = {};
      if (setting.events) {
        setting.events.forEach(function(data) {
          this._eventMap[data.id] = data.action;
        }.bind(this));
      }

      /* テキストデータのパース */
      this.lineList = [];
      var textData = this.rawData = phina.asset.AssetManager.get('text', textFileKey);
      this._parse(textData.data);
    },

    /**
     * @private reset
     * @param {string} textString
     * @return {void}
     */
    _parse: function(textString) {
      // console.log(textString.split('\n'));
      textString.split('\n').forEach(function(line, i) {
        line = line.trim();
        // コメントアウト・空白列は無視
        if (line.match(/^\/{2}/) || line.match(/^\#/) || !line) {
          return;
        }

        var data = line.split(",");
        var lineDataObj = {
          activeTextAreaList: {
            // id: textString
          },
          reactingObjectIds: [],
          eventIds: [],
        };

        /* テキストエリアの設定 */
        var textAreaIds = data[0].split("|");
        var textStrings = data[1].split("|");
        textAreaIds.forEach(function(areaId, i) {
          areaId = areaId.trim();
          if (areaId) {
            var text = textStrings[i].trim().replace(/\\n/g, "\n");
            lineDataObj.activeTextAreaList[areaId] = text;
          }
        });

        /* アクティブ化オブジェクトの設定 */
        if (data[2]) {
          data[2].split("|").forEach(function(objId, i) {
            objId = objId.trim();
            if (objId) lineDataObj.reactingObjectIds.push(objId);
          });
        }

        /* イベント設定 */
        if (data[3]) {
          data[3].split("|").forEach(function(eventId, i) {
            eventId = eventId.trim();
            if (eventId) lineDataObj.eventIds.push(eventId);
          });
        }

        this.lineList.push(lineDataObj);
      }.bind(this));
    },

    /**
     * step
     * @return {void}
     */
    step: function() {
      var lineData = this.lineList[this._index];

      /* 終わっている場合 */
      if (!lineData) {
        this.flare("talkend");
        return;
      }
      // console.log("step", lineData)

      /* フキダシのアクティブ化 */
      this._textAreaObjectMap.forIn(function(id, textAreaObj) {
      // lineData.activeTextAreaList.forIn(function(id, text) {
        var dataText = lineData.activeTextAreaList[id];
        if (dataText) {
          textAreaObj.text = dataText;
          if (textAreaObj.talkActivate) textAreaObj.talkActivate();
          // textAreaObj.visible = true;
        } else {
          if (textAreaObj.talkDeactivate) textAreaObj.talkDeactivate();
          // textAreaObj.visible = false;
        }
      }.bind(this));

      /*　指定オブジェクトのアクティブ化 */
      this._reactionObjectMap.forIn(function(id, entity) {
        if (lineData.reactingObjectIds.contains(id)) {
          if (entity.talkActivate) entity.talkActivate();
        } else {
          if (entity.talkDeactivate) entity.talkDeactivate();
        }
      });

      /* イベントあれば発火 */
      this._eventMap.forIn(function(id, action) {
        if (lineData.eventIds.contains(id)) {
          action();
        }
      });

      this._index++;
      this.flare("stepend");
    },

    /**
     * reset
     * @return {void}
     */
    reset: function() {
      this._index = 0;
      this._isEnd = false;

      // 全てを非アクティブ化する
      this._textAreaObjectMap.forIn(function(id, textAreaObj) {
        textAreaObj.visible = false;
      });
      this._reactionObjectMap.forIn(function(id, entity) {
        if (entity.talkDeactivate) entity.talkDeactivate();
      });
    },

    _static: {
      // TOOD
      defaults: {
      }
    }

  });

});