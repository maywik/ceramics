"use strict";
angular.module('ceramics').controller('HomePageController', ['$rootScope',
                                                                  '$scope',
                                                                  function($rootScope,
                                                                           $scope) {
    $rootScope.tab = 'home';
}]);
