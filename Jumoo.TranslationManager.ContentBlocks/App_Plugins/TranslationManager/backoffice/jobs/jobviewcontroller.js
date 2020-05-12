(function () {
    'use strict';

    function jobViewController($scope, $rootScope, $routeParams, $timeout, navigationService,
        notificationsService,
        translateJobService) {

        var vm = this;
        vm.loading = true;

        vm.batchSize = Umbraco.Sys.ServerVariables.translationManager.Options.BatchSize;

        vm.job = {};
        vm.items = [];

        // job id comes from route, unless its in the model (we are in infinate editor)
        vm.jobId = $routeParams.id;
        if ($scope.model !== undefined) { vm.jobId = $scope.model.jobId; }


        vm.stage = 'none';
        vm.canReset = false;
        vm.selectable = false;
        vm.removable = false; 

        vm.page = {
            title: 'Job Item',
            description: 'A single job'
        };

        vm.update = {
            status: 'idle',
            msg: '',
            progress: 100
        };


        // functions
        vm.check = check;
        vm.cancel = cancel;
        vm.remove = remove;
        vm.refresh = refresh;

        vm.back = back;
        vm.close = close;

        // buttons 
        vm.buttonState = 'init';
        vm.approveGroup = {
            defaultButton: {
                labelKey: 'translate_approvePublish',
                handler: approvePublish
            },
            subButtons: [
                {
                    labelKey: 'translate_reset',
                    handler: resetStatus
                },
                {
                    labelKey: 'translate_saveReview',
                    handler: saveReview
                },
                {
                    labelKey: 'translate_approveJobOnly',
                    handler: archive
                },
                {
                    labelKey: 'translate_approve',
                    handler: approveJob
                }
            ]
        };

        vm.resetGroup = {
            defaultButton: {
                labelKey: 'translate_reset',
                handler: resetStatus
            },
            subButtons: [
                {
                    labelKey: 'translate_resetReceived',
                    handler: resetToReceived
                }
            ]
        };

      
        vm.$onInit = function () {
            loadJob(vm.jobId);
        };

        $scope.$on('translate-job-reloaded', function () {
            refresh();
        });

        ////////////

        function loadJob(id) {
            vm.loading = true;

            translateJobService.get(id)
                .then(function (result) {
                    vm.loading = false;
                    vm.job = result.data;

                    if (vm.job !== null) {
                        vm.page.title = vm.job.Name +
                            ' [ ' + vm.job.SourceCulture.DisplayName + ' to ' +
                            vm.job.TargetCulture.DisplayName + ' ] ';
                    }
                    initJobOptions(vm.job);
                    getJobUser();
                    navigationService.syncTree({ tree: getTree(vm.job.Status), path: ['-1', vm.job.TargetCulture.Name] });


                });
        }

        function getTree(status) {
            if (status === 'Submitted') return 'submitted';
            if (status === 'Received' || status === 'Reviewing' || status === 'Partial') return 'received';
            return 'archive';
        }

        function getJobUser() {
            // vm.job.UserId
            // go get the username based on the Id.
            translateJobService.getUserDisplayName(vm.job.UserId)
                .then(function (result) {
                    vm.job.username = result.data;
                    vm.page.description = 'Owner: ' + vm.job.username;
                });
        }

        function initJobOptions(job) {

            vm.stage = 'none';
            vm.canReset = false;
            vm.selectable = false;
            vm.removable = false;

            if (job === null) { return; }

            switch (job.Status) {
                case 'Partial':
                    vm.selectable = true;
                    vm.stage = 'Submitted';
                    vm.canReset = true;
                    break;
                case 'Submitted':
                    vm.stage = 'Submitted';
                    break;
                case 'Received':
                case 'Reviewing':
                    vm.selectable = true;
                    vm.stage = 'Received';
                    vm.canReset = true;
                    break;
                case 'Closed':
                case 'Accepted':
                    vm.stage = 'Archived';
                    vm.canReset = true;
                    vm.removable = true;
                    break;
            }
        }

        function refresh() {
            $rootScope.$broadcast('translate-reload');
            loadJob(vm.jobId);
        }

        //////////// button actions 
        function check(jobId) {
            vm.buttonState = 'busy';

            translateJobService.checkById(jobId)
                .then(function (result) {
                    vm.buttonState = 'success';

                    if (result.data.Success === false) {
                        notificationsService.warning('Check', 'Job not ready : ' + result.data.Message);
                    }
                    else {
                        notificationsService.success('Check', 'Job Checked');
                        refresh();
                    }
                }, function (error) {
                    vm.buttonState = 'error';
                    notificationsService.error('error',
                        'Unable to check this job ' + error.data.ExceptionMessage);
                });
        }

        function cancel() {
            vm.buttonState = 'busy';
            translateJobService.cancel(vm.jobId)
                .then(function (result) {
                    vm.buttonState = 'success';
                    notificationsService
                        .success("cancelled", "the job has been canceled - all nodes have been reset.");
                    vm.refresh();
                }, function (error) {
                    notificationsService
                        .error("Error", "Unable to cancel the job");
                    vm.buttonState = 'error';
                });
        }

        function remove() {
            if (confirm("Are you sure you want to remove this job? All data will be removed and cannot be restored")) {
                vm.buttonState = 'busy';
                translateJobService.remove(vm.jobId)
                    .then(function () {
                        vm.buttonState = 'success';
                        notificationsService
                            .success("remove", "the job has been removed");
                        close(true);
                    }, function (error) {
                        vm.buttonState = 'error';
                        notificationsService
                            .error("Error", error.data.ExceptionMessage);
                    });

            }
        }

        function approveJob() {
            // don't publish - do approve
            doApprove(vm.job, false, true);
        }

        function approvePublish() {
            // publish and approve
            doApprove(vm.job, true, true);
        }

        function saveReview() {
            // just save (don't publish or approve)
            doApprove(vm.job, false, false);

        }

        function doApprove(job, publish, approve) {

            vm.buttonState = 'busy';

            var nodeIds = [];
            for (var i = 0; i < vm.items.length; i++) {
                nodeIds.push(vm.items[i].Id);
            }

            if (nodeIds.length === 0) {
                vm.buttonState = 'error';
                notificationsService.error('failed', 'no nodes selected in job');
                return;
            }

            var batches = createBatches(nodeIds, vm.batchSize);

            approveBatches(batches, job, publish, approve,
                function () {
                    notificationsService.success('complete',
                        'process completed');
                    vm.buttonState = 'success';
                    $rootScope.$broadcast('translate-reloaded');
                    refresh();
                }, function (error) {
                    vm.buttonState = 'error';
                    notificationsService.error('failed', error.data.ExceptionMessage);
                });
        }

        function createBatches(items, size) {

            var batches = [];
            var batchCount = Math.ceil(items.length / size);

            for (var b = 0; b < batchCount; b++) {
                var batch = items.slice(b * size, (b + 1) * size);
                batches.push(batch);
            }

            return batches;
        }

        function approveBatches(batches, job, publish, approve, callback, err) {

            var c = 0;
            process(batches[c]);

            function process(items) {
                c++;

                vm.update = {
                    status: 'working',
                    msg: 'processing group ' + c + ' of ' + batches.length,
                    progress: c / batches.length * 100
                };

                var finalCheck = c === batches.length;

                var options = {
                    nodeIds: items,
                    publish: publish,
                    approve: approve,
                    check: finalCheck
                };
                translateJobService.approve(job.Id, options)
                    .then(function (result) {
                        if (c < batches.length) {
                            process(batches[c]);
                        }
                        else {
                            vm.update.status = 'done';
                            callback();
                        }
                    }, function (error) {
                        vm.update.status = 'done';
                        err(error);
                    });
            }

        }



        function resetStatus() {
            if (confirm("Are you sure you want to reset the job back status back to 'submitted' not all jobs will be able to progress from submitted a second time")) {
                resetToStatus(1);
            }
        }

        function resetToReceived() {
            if (confirm("Are you sure you want to reset the job back status back to 'Received' you will need to reapprove a job to get the content in umbraco")) {
                resetToStatus(15);
            }
        }

        function archive() {
            vm.buttonState = 'busy';

            translateJobService.archive(vm.jobId)
                .then(function () {
                    vm.buttonState = 'success';
                    notificationsService
                        .success("approved", "Translation job archived");
                    refresh();
                }, function (error) {
                    vm.buttonState = 'error';
                    notificationsService
                        .error("failed", error.data.ExceptionMessage);
                });
        }

        function back() {
            window.history.back();
        }

        function close(isPost) {
            if ($scope.model && $scope.model.close) {
                $scope.model.close();
            } else {
                let back = -1;
                if (isPost) {
                    back = -2;
                }
                window.history.go(back);
            }
        }

        ///// 
        function resetToStatus(status) {
            vm.buttonState = 'busy';

            translateJobService.resetJob(vm.jobId, status)
                .then(function () {
                    notificationsService
                        .success("Job Reset", "Job status has been reset to submitted");
                    vm.buttonState = 'success';
                    refresh();
                }, function (error) {
                    notificationsService
                        .error("failed", error.data.ExceptionMessage);
                    vm.buttonState = 'error';
                });
        }
    }

    angular.module('umbraco')
        .controller('translateJobViewController', jobViewController);
})();