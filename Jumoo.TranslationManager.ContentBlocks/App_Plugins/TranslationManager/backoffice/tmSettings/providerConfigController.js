(function () {

    'use static';

    function providerConfigController($scope, $routeParams, $timeout,
        navigationService,
        notificationsService, translateProviderService) {

        var vm = this;
        vm.loading = true;
        vm.isValid = true;

        vm.page = {
            title: 'provider',
            description: 'provider'
        };

        vm.key = $routeParams.id;
        vm.hasView = false;

        vm.provider = {};
        vm.settings = {};

        vm.save = save;

        getProvider(vm.key);



        $timeout(function () {
            navigationService.syncTree({ tree: "tmSettings", path: ['-1', '200', vm.key] });
        });


        //////////

        function getProvider(key) {
            translateProviderService.getProvider(key)
                .then(function (result) {
                    vm.provider = result.data;
                    vm.page.title = vm.provider.Name;
                    vm.page.description = vm.provider.Key;

                    vm.hasView = vm.provider.Views.Config !== undefined
                        && vm.provider.Views.Config.length > 0;

                    getSettings(vm.provider.Key);
                    vm.loading = false;

                }, function (error) {
                    notificationsService.error("Error", error.data.ExceptionMessage);
                });
        }

        function getSettings(key) {
            translateProviderService.getSettings(key)
                .then(function (result) {
                    vm.settings = result.data;

                    // we fire this, so dependent provider controllers can wait for the settings
                    $scope.$broadcast('tp_providerSettings');

                }, function (error) {
                    notificationsService.error("Error", error.data.ExceptionMessage);
                });
        }

        function save() {
            translateProviderService.saveSettings(vm.key, vm.settings)
                .then(function (result) {
                    $scope.providerConfig.$dirty = false;
                    $scope.$broadcast('tp_providerSettings');
                    notificationsService
                        .success("saved", "Settings updated ");
                }, function (error) {
                    notificationsService.error("Error", error.data.ExceptionMessage);
                });
        }
    }

    angular.module('umbraco')
        .controller('translateProviderConfigController', providerConfigController);

})();