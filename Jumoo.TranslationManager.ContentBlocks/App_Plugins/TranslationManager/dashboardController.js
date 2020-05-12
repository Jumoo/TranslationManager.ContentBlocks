(function () {
    'use strict';

    function dashboardController(
        $location,
        userService,
        translateSetService,
        translateJobService,
        translateNodeService) {

        var vm = this;

        vm.loading = true;
        vm.setup = false;
        vm.createSet = createSet;
        vm.hasSettings = false;

        vm.showSummary = true;
        vm.summaryText = 'My Jobs';
        vm.toggleSummary = toggleSummary;

        vm.viewSets = viewSets;
        vm.viewPending = viewPending;
        vm.viewSubmitted = viewSubmitted;
        vm.viewReceived = viewReceived;

        vm.receivedRange = [10, 19];
        vm.submittedRange = [1, 19];

        vm.counts = {
            pending: -1,
            submitted: -1,
            received: -1
        };

        Init();

        ///////////
        function createSet() {
            $location.path('/settings/tmSettings/setEdit/-1');
        }

        function viewSets() {
            $location.path('/settings/tmSettings/sets');
        }

        function viewPending() {
            $location.path('/translation/pending/summary');
        }

        function viewSubmitted() {
            $location.path('/translation/submitted/summary');
        }

        function viewReceived() {
            $location.path('/translation/received/summary');
        }


        function getjobCounts() {


            translateJobService.getSummaryCount(10, 19)
                .then(function (result) {
                    vm.counts.received = result.data;
                });

            translateJobService.getSummaryCount(1, 9)
                .then(function (result) {
                    vm.counts.submitted = result.data;
                });

            translateNodeService.getSummaryCount(0)
                .then(function (result) {
                    vm.counts.pending = result.data;
                });
        }


        function getSets() {
            translateSetService.list()
                .then(function (result) {
                    vm.sets = result.data;
                    vm.setup = vm.sets.length > 0;
                    vm.loading = false;
                });
        }

        function toggleSummary() {
            vm.showSummary = !vm.showSummary;

            if (vm.showSummary) {
                vm.summaryText = 'My Jobs';
            }
            else {
                vm.summaryText = 'Return to summary';
            }
        }


        function Init() {
            getSets();
            getjobCounts();

            userService.getCurrentUser().then(function (u) {
                vm.hasSettings = u.allowedSections.includes('settings');
            });

        }

    }

    angular.module('umbraco')
        .controller('translateDashboardController', dashboardController);
})();