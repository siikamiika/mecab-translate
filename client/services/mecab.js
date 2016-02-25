angular.module('mecab-translate')
.factory('Mecab', function($http) {

    var output;

    return {
        analyze: function(val) {
            $http.post('/mecab', angular.toJson(val))
                .success(function(data) {
                    this.output(data);
                }.bind(this));
        },
        setOutput: function(fn) {
            this.output = fn;
        }
    }

});
