angular.module('mecab-translate')
.factory('Edict2', function($http) {

    var output;

    return {
        translate: function(val) {
            $http.post('/edict2', angular.toJson(val))
            .then(function success(data) {
                this.output(data.data);
            }.bind(this), function error(data) {
                this.output([]);
            }.bind(this));
        },
        setOutput: function(fn) {
            this.output = fn;
        }
    }

});
