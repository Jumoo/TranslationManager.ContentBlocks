(function () {
    'use strict';

    function dictionaryDialogController($scope, $location, editorState, notificationsService,
        translateSetService, translateNodeManager, translateHub) {

        var vm = this;
        vm.loading = true;

        vm.close = close;

        vm.currentNodeId = $scope.model.entity.id;
        vm.currentNodeName = $scope.model.entity.name;

        vm.page = {
            title: $scope.model.title + ' ' + vm.currentNodeName
        };

        vm.error = {};

        vm.step = 'pick';
        vm.busy = false;

        vm.children = true;
        vm.createNow = true;
        vm.autoApprove = true;

        vm.picked = [];
        vm.sets = [];
        vm.multiset = false;

        vm.nodes = [];
        vm.job = {
            status: 'Pending',
            providerOptions: {}
        };
        
        vm.canAutoSend = canAutoSend;
        vm.canAutoApprove = canAutoApprove;

        // functions (for the steps)
        vm.create = create;
        vm.createNodes = createNodes;
        vm.createNodesAndJob = createNodesAndJob;
        vm.complete = complete;

        // views
        vm.viewJob = viewJob;
        vm.viewPending = viewPending;

        ///
        initHub();
        loadSets(vm.currentNodeId);

        /////////

        function create() {
            if (vm.createNow && !vm.multiset) {
                vm.step = 'job';

                var set = getSingleSet();

                vm.providerKey = set.ProviderKey;
                vm.job.setup = false;
                vm.job.name = "Dictionary {to} " + new Date().toLocaleString();
                return;
            }
            // else
            vm.createNodes(false);
        }

        function createNodesAndJob() {
            vm.createNodes(true);
        }

        function createNodes(createJobWhenComplete) {
            vm.busy = true;
            showMessage({
                update: 'Getting dictionary items'
            });

            var set = getSingleSet();

            var options = {
                sites: vm.picked,
                setId: set.Id,
                clientId: vm.hub.clientId()
            };

            translateNodeManager.createDictionaryNodes(vm.currentNodeId, options,
                showMessage, function (nodes) {
                    if (createJobWhenComplete) {
                        return createJob(nodes);
                    }
                    complete(nodes);
                }, function (error) {
                    showError("CreateNodes", error);
                });
        }

        function createJob(nodes) {
            vm.jobs = [];

            var groups = translateNodeManager.groupNodes(nodes, vm.job.name);

            var completed = 0;
            var total = groups.length;

            var autoApproveJob = canAutoApprove() && vm.autoApprove;

            showMessage({ process: 0, update: 'creating ' + total + 'jobs' });

            groups.forEach(function (group) {
                group.status = 'submitted';
                var options = {
                    name: group.jobName,
                    nodes: group.nodes,
                    providerKey: vm.job.provider.Key,
                    providerOptions: vm.job.providerOptions,
                    autoApprove: autoApproveJob,
                    clientId: vm.hub.clientId()
                };

                translateNodeManager.createJob(options)
                    .then(function (result) {
                        completed++;
                        showMessage({
                            progress: { done: completed / total * 100, step: 'Created ' + options.jobName },
                            update: 'Creating jobs'
                        });

                        vm.jobs.push(result.data);

                        if (completed === total) {
                            vm.busy = false;
                            vm.step = 'done-job';
                        }
                    }, function (error) {
                        showError("CreateJob", error);
                    });
            });
        }

        function complete(nodes) {
            vm.step = 'done';
            vm.nodes = nodes;
            vm.busy = false;
        }

        function loadSets(nodeId) {

            translateSetService.getForDictionary(nodeId)
                .then(function (result) {
                    vm.sets = result.data;
                    vm.loading = false;
                }, function (error) {
                    notificationsService.error('load', "can't load translation sets");
                });
        }

        /////////

        function getSingleSet() {
            var pickedSets = [];
            var selectedSet = {};

            for (var s = 0; s < vm.picked.length; s++) {
                if (pickedSets.indexOf(vm.picked[s].setId) === -1) {
                    pickedSets.push(vm.picked[s].setId);
                    selectedSet = vm.sets.find(x => x.Id === vm.picked[s].setId);
                }
            }

            if (pickedSets.length < 1) {
                return null; // no sets
            }
            else if (pickedSets.length > 1) {
                vm.multiset = true;
                return null;
            }
            vm.multiset = false;
            return selectedSet;
        }


        function canAutoSend() {
            var set = getSingleSet();
            if (set === null) {
                return false;
            }
            else {
                return set.AutoSend;
            }
        }

        function canAutoApprove() {
            var set = getSingleSet();
            if (set === null) {
                return false;
            }
            else {
                return set.AutoApprove;
            }
        }



        /////////

        function showMessage(message) {
            if (message.progress !== undefined) {
                vm.progress = message.progress;
            }
            vm.update = message.update;
        }

        function showError(step, error) {

            vm.busy = false;
            vm.step = 'error';

            console.log('Error', step, error.data);

            vm.error = {
                step: step,
                message: error.data.ExceptionMessage,
                stack: error.data.StackTrace
            };
        }


        function viewJob(job) {
            if ($scope.model.close) {
                $scope.model.close();
            }
            $location.path('/translation/jobs/edit/' + job.Id);
        }

        function viewPending() {
            if ($scope.model.close) {
                $scope.model.close();
            }
            $location.path('/translation/pending/summary/');
        }

        function close() {
            if ($scope.model.close) {
                $scope.model.close();
            }
        }


        ///////// signalR things

        function initHub() {
            translateHub.initHub(function (hub) {
                vm.hub = hub;
                vm.hub.on('add', function (data) {
                    vm.update = data;
                });

                vm.hub.start();
            });
        }
    }

    angular.module('umbraco')
        .controller('translateDictionaryDialogController', dictionaryDialogController);
})();