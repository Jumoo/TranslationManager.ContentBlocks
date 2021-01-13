(function () {

    'use strict';

    function summarySubmittedController($location, $timeout, navigationService, translateJobService) {

        var vm = this;

        vm.pageTitle = 'Submitted Jobs';
        vm.loading = true;

        vm.viewJobs = viewJobs;
        vm.statusRange = [1, 9];

        loadJobInfo();


        $timeout(function () {
            navigationService.syncTree({ tree: "submitted", path: ['-1'] });
        });


        ///////////////
        function loadJobInfo() {
            translateJobService.getSummaryRange(1, 9)
                .then(function (result) {
                    vm.info = result.data;
                    vm.loading = false;
                });
        }

        function viewJobs(id) {
            $location.path('/translation/submitted/list/' + id);
        }
    }

    angular.module('umbraco')
        .controller('translateSummarySubmittedController', summarySubmittedController);

})();