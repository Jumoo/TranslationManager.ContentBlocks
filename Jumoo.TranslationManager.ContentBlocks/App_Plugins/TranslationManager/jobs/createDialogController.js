(function () {
    'use strict';

    function createDialogJobController(
        $scope,
        $location,
        translateCultureService,
        translateNodeManager) {
        var vm = this;

        vm.creating = false;
        vm.done = false;

        vm.options = $scope.model.createOptions;
        vm.job = {
            name: 'Translation Job ' + new Date().toLocaleString(),
            status: 'Pending',
            providerOptions: {}
        };

        getCultureInfo(vm.options.cultureName);

        vm.create = create;
        vm.close = close;
        vm.viewJob = viewJob;

        ///////////

        function create() {

            vm.creating = true;

            var options = {
                name: vm.job.name,
                nodes: vm.options.items,
                providerKey: vm.job.provider.Key,
                providerOptions: vm.job.providerOptions
            };

            translateNodeManager.createJob(options)
                .then(function (result) {
                    vm.result = result.data;
                    vm.creating = false;
                    vm.done = true;
                    vm.completeMsg = 'Job Created';
                }, function (error) {
                    vm.creating = false;
                    vm.done = true;
                    vm.completeMsg = 'error creating job ' + error.data.ExceptionMessage;
                });
        }


        function close() {
            if (vm.done && $scope.model.submit) {
                $scope.model.submit();
            }
            else if ($scope.model.close) {
                $scope.model.close(vm.done);
            }
        }

        function viewJob(job) {
            if ($scope.model.close) {
                $scope.model.close(vm.done);
            }

            $location.path('/translation/jobs/edit/' + job.Id);
        } 


        ////////////
        function getCultureInfo(id) {
            translateCultureService.getCultureInfo(id)
                .then(function (result) {
                    vm.cultureInfo = result.data;
                    vm.job.name = vm.cultureInfo.DisplayName + ' ' + new Date().toLocaleString();
                });
        }
    }

    angular.module('umbraco')
        .controller('translateCreateJobDialogController', createDialogJobController);

})();