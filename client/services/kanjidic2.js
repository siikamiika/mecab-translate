angular.module('mecab-translate')
.factory('Kanjidic2', function($http) {

    var output;

    return {
        get: function(val) {
            $http.post('/kanjidic2', angular.toJson(val))
            .then(function success(data) {
                this.output(data.data);
            }.bind(this), function error(data) {
                this.output({});
            }.bind(this));
        },
        setOutput: function(fn) {
            this.output = fn;
        }
    }

});
