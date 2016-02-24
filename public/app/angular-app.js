'use strict';

angular.module('ceramics',['ngResource', 'ngRoute', 'ui.bootstrap', 'ngPrettyJson'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/home',{ templateUrl: '/app/common/view/home.html',controller:'HomePageController' })
            .when('/product',{ templateUrl: '/app/product/view/product.html',controller:'ProductPageController', reloadOnSearch: false })
            .when('/delivery',{ templateUrl: '/app/common/view/delivery.html',controller:'DeliveryPageController', reloadOnSearch: false })
            .when('/about',{ templateUrl: '/app/common/view/about.html',controller:'AboutPageController' })
            .otherwise({
                redirectTo: '/home'
            });
    }]).run(function($rootScope) {
        $rootScope.isAdmin = false;
        $rootScope.showAdminModal = false;

        $rootScope.getAdminOut = function() {
            $rootScope.isAdmin = false;
        };

    }).controller('MainController', ['$scope','$rootScope','$http', '$window', function($scope, $rootScope, $http, $window){

        $scope.admin = {};
        $scope.getAdminIn = function(){
            $scope.showAdminModal = !$scope.showAdminModal;
        };

        $scope.enterAdminPass = function() {

            $http({
                    method: 'POST',
                    url: '/admin',
                    data:  {
                        "admin" : {
                            "name": $scope.admin.name,
                            "password": $scope.admin.password
                        }
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    $rootScope.isAdmin = data.isAdmin;
                    if ($rootScope.isAdmin) {
                        $scope.showAdminModal = false;
                    }
                })
                .error(function (reason) {
                    console.log(reason);
                });

        }
    }]);
