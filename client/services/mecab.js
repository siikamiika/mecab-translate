angular.module('mecab-translate')
.factory('Mecab', function($rootScope, $http) {

    var response = null;

    return {
        analyze: function(val) {
            $http.post('/mecab', angular.toJson(val))
                .success(function(data) {
                    this.response = data;
                    $rootScope.$broadcast('mecabResponse');
                }.bind(this));
        },
        response: response
    }

});
