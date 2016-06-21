angular.module('mecab-translate')
.factory('EventBridge', function() {

    var eventListeners = {};

    return {
        dispatch: function(eventName, event) {
            for(i in eventListeners[eventName])
                eventListeners[eventName][i](event);
        },
        addEventListener: function(eventName, cb) {
            if (!eventListeners[eventName])
                eventListeners[eventName] = [];
            eventListeners[eventName].push(cb);
        }
    }

});
