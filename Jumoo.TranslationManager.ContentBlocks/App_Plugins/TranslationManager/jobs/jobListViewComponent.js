(function () {
    'use strict';

    var jobListViewComponent = {
        templateUrl: Umbraco.Sys.ServerVariables.application.applicationPath + 'App_Plugins/TranslationManager/jobs/joblistview.html',
        bindings: {
            selectable: '<',
            statusRange: '<',
            culture: '<',
            userView: '<',
            hideUserToggle: '<',
            onRefresh: '&'
        },
        controllerAs: 'vm',
        controller: jobListViewController
    };

    function jobListViewController($scope, $attrs, $location, editorService, userService,
        translateDialogManager,
        notificationsService,
        translateJobService) {

        var vm = this;
        vm.page = 1;
        vm.loading = true;
        vm.results = [];

        vm.viewJob = viewJob;
        vm.refresh = refresh;

        vm.next = next;
        vm.prev = prev;
        vm.gotoPage = gotoPage;

        vm.userBtnText = 'My Jobs';
        vm.toggleUser = toggleUser;


        $scope.$on('translate-reloaded', function () {
            vm.refresh();
        });

        vm.$onInit = function () {
            userService.getCurrentUser().then(function (result) {
                vm.userId = result.id;
                vm.refresh();
            });
        };

        ////////////////
        function loadJobs(culture, status, page) {
            vm.loading = true;

            if (vm.userView) {

                if (culture !== undefined) {
                    translateJobService.getByUserCultureAndStatus(vm.userId, culture, status[0], status[1], page)
                        .then(function (result) {
                            vm.results = result.data;
                            vm.loading = false;
                            getUserNames(vm.results);
                        }, function (error) {
                            notificationsService
                                .error('Load failed', error.data.ExceptionMessage);
                        });
                }
                else {
                    translateJobService.getByUserAndStatus(vm.userId, status[0], status[1], page)
                        .then(function (result) {
                            vm.results = result.data;
                            vm.loading = false;
                            getUserNames(vm.results);
                        }, function (error) {
                            notificationsService
                                .error('Load failed', error.data.ExceptionMessage);
                        });
                }
            }
            else {
                translateJobService.getByCultureAndStatusPaged(culture, status[0], status[1], page)
                    .then(function (result) {
                        vm.results = result.data;
                        vm.loading = false;
                        getUserNames(vm.results);
                    }, function (error) {
                        notificationsService
                            .error('Load failed', error.data.ExceptionMessage);
                    });
            }
        }


        function refresh() {
            if ($attrs.onRefresh !== undefined) {
                vm.loading = true;
                vm.onRefresh({
                    page: vm.page, cb: function (results) {
                        vm.results = results;
                        vm.loading = false;
                    }
                });
            }
            else {
                loadJobs(vm.culture, vm.statusRange, vm.page);
            }
        }

        function viewJob(jobId, $event) {
            if ($event !== undefined) {
                $event.preventDefault();
                $event.stopPropagation();
            }

            // open by url
            $location.path('/translation/jobs/edit/' + jobId);
        }

        function toggleUser() {
            vm.userView = !vm.userView;

            loadJobs(vm.culture, vm.statusRange, vm.page);
        }

        function loadUserJobs(culture, status, page) {
            vm.loading = true;

        }

        function getUserNames(jobs) {
            var users = [];
            for (let u = 0; u < jobs.items.length; u++) {
                users.push(jobs.items[u].UserId);
            }
            translateJobService.getUserDisplayNames(users)
                .then(function (result) {
                    vm.usernames = result.data;
                });
        }

        //////// paging
        function next() {
            vm.page++;
            refresh();
        }

        function prev() {
            vm.page--;
            refresh();
        }

        function gotoPage(pageNo) {
            vm.page = pageNo;
            refresh();
        }
    }

    angular.module('umbraco')
        .component('translateJobListView', jobListViewComponent);
})();