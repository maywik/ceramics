angular.module('ceramics').factory('EnvironmentManager', ['$http','$q', function($http, $q) {
    var environment = null;
    var promises = [];
    var deferred = $q.defer();

    var environmentPromise = $http.get('/app/environment.json').success(function(data) {
        environment = data;

        deferred.resolve(data);
    });

    promises.push(environmentPromise);

    return {
        promise: $q.all(promises),
        getByKey: function(key) {
            return environment[key];
        }
    };
}]);
