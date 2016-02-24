angular.module('ceramics').controller('ProductPageController', ['$rootScope',
                                                                '$scope',
                                                                '$http',
                                                                '$window',
                                                                function($rootScope,
                                                                         $scope,
                                                                         $http,
                                                                         $window) {
        $rootScope.tab = 'product';
        $scope.result = { json : {} };
        $scope.user = {};
        $scope.activeOrder = false;

        $scope.showModal = false;
        $scope.toggleModal = function(){
            $scope.showModal = !$scope.showModal;
        };



        $scope.getResult = function() {
            $http({
                method: 'GET',
                url: '/product/catalog'
            }).success(function (data) {
                console.log(data);
                $scope.result.json = data;
            }).error(function(reason) {
                console.log(reason);
            });
        };

        $scope.getResult();

        $scope.updateOrderBtn = function () {
            $scope.activeOrder = false;
            if ($scope.updateCheckedProduct().length > 0) {
                $scope.activeOrder = true;
            }
        };

        $scope.orderContent = function() {
            var order = {};
            if (!$scope.user.name || !$scope.user.phone) {
                return;
            }

            order = {
                'imageNames' : $scope.updateCheckedProduct(),
                'userName': $scope.user.name,
                'userPhone': $scope.user.phone
            };

            $scope.postResult({'order' : order}, '/order');
            $window.location.reload();
        };

        $scope.updateCheckedProduct = function () {
            var remProductNames = [];
            var catalog = $scope.result.json.catalog;

            for (var catalog_key in catalog) {
                var catalogObj = catalog[catalog_key];
                for (var product_key in catalogObj) {
                    var product = catalogObj[product_key];
                    if (product.in_order) {
                        remProductNames.push(product.imageName);
                    }
                }
            }
            return remProductNames;
        };

        $scope.removeContent = function() {
            var remProductNames = [];
            var catalog = $scope.result.json.catalog;

            for (var catalog_key in catalog) {
                var catalogObj = catalog[catalog_key];
                for (var product_key in catalogObj) {
                    var product = catalogObj[product_key];
                    if (product.rem_selected) {
                        remProductNames.push(product.imageName);
                    }
                }
            }
            $scope.postResult({'imageNames' : remProductNames}, '/remove');
            $window.location.reload();
        };

        $scope.postResult = function (data, url) {
            $http({
                  method: 'POST',
                  url: url,
                  data: data,
                  headers: {
                      'Content-Type': 'application/json'
                  }
                })
                .success(function (d) {
                    alert("done");
                })
                .error(function (reason) {
                    console.log(reason);
                });
        };

    }]);
