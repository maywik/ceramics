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
        $scope.order = {};
        $scope.zoomInImage = {};

        $scope.showModal = false;
        $scope.showConfiramtionModal = false;
        $scope.showZoomInImageModal = false;
        $scope.isLoading = false;

        $scope.toggleModal = function(){
            $scope.showModal = !$scope.showModal;
        };

        $scope.getResult = function() {
            $scope.isLoading = true;
            $http({
                method: 'GET',
                url: '/product/catalog'
            }).success(function (data) {
                $scope.isLoading = false;
                console.log(data);
                $scope.result.json = data;
            }).error(function(reason) {
                $scope.isLoading = false;
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
            $scope.order = {};
            if (!$scope.user.name || !$scope.user.phone) {
                return;
            }

            $scope.order = {
                'imageNames' : $scope.updateCheckedProduct(),
                'userName': $scope.user.name,
                'userPhone': $scope.user.phone,
                'productTitles' : $scope.updateCheckedProductTitles()
            };

            $scope.showConfiramtionModal = true;
            $scope.showModal = false;
        };

        $scope.confirmOrder = function() {
            $scope.postResult({'order' : $scope.order}, '/order');
            $window.location.reload();
        };

        $scope.cancelOrder = function() {
            $scope.showConfiramtionModal = false;
        };

        $scope.updateCheckedProductTitles = function () {
            var remProductNames = [];
            var catalog = $scope.result.json.production.catalog;

            for (var catalog_key in catalog) {
                var catalogObj = catalog[catalog_key];
                for (var product_key in catalogObj) {
                    var product = catalogObj[product_key];
                    if (product.in_order) {
                        remProductNames.push(product.productName + " - " + product.title + " - " + product.price);
                    }
                }
            }
            return remProductNames;
        };

        $scope.showZoomInImage = function (imgObj) {
            $scope.showZoomInImageModal = true;
            $scope.zoomInImage = {
                'imgSrc': imgObj.path + imgObj.imageName,
                'imgTitle': imgObj.productName + " - " + imgObj.title
            };
        };

        $scope.updateCheckedProduct = function () {
            var remProductNames = [];
            var catalog = $scope.result.json.production.catalog;

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

        $scope.removePanel = function(panel) {
            for(var item in panel) {
               panel[item].rem_selected = !panel[item].rem_selected;
            }
        };

        $scope.removeContent = function() {
            var remProductNames = [];
            var catalog = $scope.result.json.production.catalog;

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
