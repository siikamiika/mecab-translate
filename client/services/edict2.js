angular.module('mecab-translate')
.factory('Edict2', function($http) {

    var output;

    return {
        translate: function(val) {
            $http.post('/edict2', angular.toJson(val))
                .success(function(data) {
                    this.output(data);
                }.bind(this));
        },
        setOutput: function(fn) {
            this.output = fn;
        }
    }

});
