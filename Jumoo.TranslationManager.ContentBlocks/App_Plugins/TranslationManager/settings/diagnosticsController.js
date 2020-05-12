(function () {
    'use strict';

    function diagnosticsController(
        $scope, translateSettingsService) {

        var vm = this;

        getInfo();

        function getInfo() {
            translateSettingsService.getSetup()
                .then(function (result) {
                    vm.info = result.data;
                    getUpdateInfo();
                });
        }

        function getUpdateInfo() {
            translateSettingsService.getUpdate()
                .then(function (result) {
                    vm.update = result.data;

                    if (vm.info.CoreVersion < vm.update.Version) {
                        vm.uptodate = false;
                    }
                    else {
                        vm.uptodate = true;
                    }
                });
        }

    }

    angular.module('umbraco')
        .controller('tranlateSettings.DiagnosticsController', diagnosticsController);
})();