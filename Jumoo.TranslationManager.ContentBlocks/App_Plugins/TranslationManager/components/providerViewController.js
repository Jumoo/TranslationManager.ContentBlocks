(function () {

    var providerViewComponent = {
        templateUrl: Umbraco.Sys.ServerVariables.application.applicationPath + 'App_Plugins/TranslationManager/components/providerView.html',
        bindings: {
            job: '=',
            providerKey: '<',
            status: '<',
            isValid: '='
        },
        controllerAs: 'vm',
        controller: providerViewController
    };

    function providerViewController($scope, translateProviderService) {

        var vm = this;

        vm.$onInit = function () {
            if (vm.job !== undefined && vm.providerKey !== undefined) {
                getProvider(vm.providerKey);
            }

            $scope.$watch('vm.providerKey', function (newValue, oldValue) {
                if (newValue !== undefined && newValue !== null) {
                    getProvider(vm.providerKey);
                }
            });
        };


        //////////
        function getProvider(key) {

            if (key !== undefined && key !== '00000000-0000-0000-0000-000000000000') {
                translateProviderService.getProvider(key)
                    .then(function (result) {
                        setView(result.data, vm.status);
                    });

                translateProviderService.getSettings(key)
                    .then(function (result) {
                        vm.settings = result.data;
                    });
            }
        }

        function setView(provider, status) {

            switch (status) {
                case 'Submitted':
                case 'Partial':
                    vm.view = provider.Views.Submitted;
                    break;
                case 'Pending':
                    vm.view = provider.Views.Pending;
                    break;
                case 'Config':
                    vm.view = provider.Views.Config;
                    break;
                default:
                    vm.view = provider.Views.Approved;
            };

        }
    }

    angular.module('umbraco')
        .component('translateProviderView', providerViewComponent);
})();