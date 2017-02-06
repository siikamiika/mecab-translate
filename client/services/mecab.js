angular.module('mecab-translate')
.factory('Mecab', function($http, EventBridge) {

    var history = [];
    var historyIndex = -1;

    return {
        analyze: function(val, analyzingHistory, N) {
            if (!analyzingHistory && val && val.length) {
                if (history.length >= 50) {
                    history.shift(1);
                    historyIndex--;
                }
                // this is the browser-like behavior but probably not wanted here
                //if (historyIndex > -1)
                //    history.length = historyIndex + 1;
                history.push(val);
                historyIndex = history.length - 1;
            }
            if (historyIndex == 0) {
                this.back.disabled = true;
            } else {
                this.back.disabled = false;
            }
            if (historyIndex == history.length - 1) {
                this.forward.disabled = true;
            } else {
                this.forward.disabled = false;
            }
            $http.post('/mecab', angular.toJson({text: val, nbest: N}))
            .then(function success(data) {
                EventBridge.dispatch(N ? 'mecab-nbest' : 'mecab-response', data.data);
            }.bind(this), function error(data) {
                EventBridge.dispatch(N ? 'mecab-nbest' : 'mecab-response', []);
            }.bind(this));
        },
        analyzeHistory: function(offset) {
            var newValue = historyIndex + offset;
            if (newValue > -1 && newValue < history.length) {
                historyIndex = newValue;
                this.analyze(history[historyIndex], true);
                this.input.value = history[historyIndex];
            }
        },
        setInput: function(textarea) {
            this.input = textarea;
        },
        setButtons: function(back, forward) {
            this.back = back;
            this.forward = forward;
        }
    }

});
