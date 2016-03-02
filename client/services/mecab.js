angular.module('mecab-translate')
.factory('Mecab', function($http) {

    return {
        analyze: function(val) {
            $http.post('/mecab', angular.toJson(val))
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
