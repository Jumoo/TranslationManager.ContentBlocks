(function () {
    'use strict';

    var jobOptionsComponent = {
        templateUrl: Umbraco.Sys.ServerVariables.application.applicationPath + 'App_Plugins/TranslationManager/components/jobOptions.html',
        bindings: {
            job: '=',
            provider: '=',
            providerKey: '<',
            isValid: '='
        },
        controllerAs: 'vm',
        controller: jobOptionsController
    };

    function jobOptionsController($scope, translateProviderService) {

        var vm = this;

        vm.providers = [];
        vm.provider = {};
        vm.singleProvider = false;

        // think we have to wrap this in a watch ? 

        vm.$onInit = function () {
            vm.singleProvider = vm.providerKey !== undefined && vm.providerKey !== '00000000-0000-0000-0000-000000000000';
            if (!vm.singleProvider) {
                getProviders();
            }
            else {
                getProvider(vm.providerKey);
            }
        };

        /////////////

        function getProviders() {
            translateProviderService.getProviders()
                .then(function (result) {
                    vm.providers = result.data;
                });
        }

        function getProvider(key) {
            if (key !== undefined && key !== '00000000-0000-0000-0000-000000000000') {
                translateProviderService.getProvider(key)
                    .then(function (result) {
                        vm.job.provider = result.data;
                    });
            }
            else {
                vm.job.provider = null;
            }
        }
    }

    angular.module('umbraco')
        .component('translateJobOptions', jobOptionsComponent);

})();