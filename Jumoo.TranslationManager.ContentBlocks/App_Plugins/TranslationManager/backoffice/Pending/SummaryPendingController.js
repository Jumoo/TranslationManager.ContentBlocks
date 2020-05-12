(function () {

    'use strict';

    function summaryPendingController($scope, $location,$timeout, navigationService, translateNodeService) {

        var vm = this;
        vm.pageTitle = 'Incoming items';
        vm.loading = true;

        vm.viewLanguage = viewLanguage;

        loadLanguages();


        $timeout(function () {
            navigationService.syncTree({ tree: "pending", path: ['-1'] });
        });

        ////////////

        function loadLanguages() {
            translateNodeService.getSummaryInfo(0)
                .then(function (result) {
                    vm.open = result.data;
                    vm.loading = false;
                });
        }

        function viewLanguage(id) {
            $location.path('/translation/pending/list/' + id);
        }
    }


    angular.module('umbraco')
        .controller('translateSummaryPendingController', summaryPendingController);
})();