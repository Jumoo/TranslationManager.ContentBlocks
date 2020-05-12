(function () {

    'use strict';

    function summaryReceivedController(translateJobService, $timeout, navigationService, $location) {

        var vm = this;

        vm.pageTitle = 'Submitted Jobs';
        vm.loading = true;

        vm.viewJobs = viewJobs;

        loadJobInfo();

        $timeout(function () {
            navigationService.syncTree({ tree: "received", path: ['-1'] });
        });

        ///////////////
        function loadJobInfo() {
            translateJobService.getSummaryRange(10, 19)
                .then(function (result) {
                    vm.info = result.data;
                    vm.loading = false;
                });
        }

        function viewJobs(id) {
            $location.path('/translation/received/list/' + id);
        }
    }

    angular.module('umbraco')
        .controller('translateSummaryReceivedController', summaryReceivedController);

})();