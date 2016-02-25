angular.module('mecab-translate')
.factory('Edict2', function($rootScope, $http) {

    var response = null;

    return {
        translate: function(val) {
            $http.post('/edict2', angular.toJson(val))
                .success(function(data) {
                    this.response = data;
                    $rootScope.$broadcast('edict2Response');
                }.bind(this));
        },
        response: response
    }

});
