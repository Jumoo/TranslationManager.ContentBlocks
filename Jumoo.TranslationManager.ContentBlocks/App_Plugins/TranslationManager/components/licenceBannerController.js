(function () {
    'use strict';

    var licenceBannerComponent = {
        templateUrl: Umbraco.Sys.ServerVariables.application.applicationPath + 'App_Plugins/TranslationManager/components/licenceBanner.html',
        controllerAs: 'vm',
        controller: licenceBannerController
    }

    function licenceBannerController(translateSetService) {

        var vm = this;
        vm.loading = true;
        vm.valid = 'valid';

        vm.$onInit = function () {
            translateSetService.licenceStatus()
                .then(function (result) {
                    vm.loading = false;
                    vm.valid = result.data;
                }, function(error) {
                    // error getting the licence info.
                });
        }
    }

    angular.module('umbraco')
        .component('translateLicenceBanner', licenceBannerComponent);
})();