(function () {
    'use strict';

    function createDialogController($scope,
        $routeParams,
        $q,
        $location,
        editorState,
        contentResource,
        notificationsService,
        translateSetService,
        translateNodeManager,
        translateHub) {

        var vm = this;
        vm.loading = true;

        vm.busy = false;

        vm.currentNodeId = $scope.model.entity.id;
        vm.currentNodeName = $scope.model.entity.name;
        vm.selectedLanguages = $scope.model.languages || [];

        vm.error = {
            message: ''
        };

        vm.page = {
            title: $scope.model.title + ' ' + vm.currentNodeName
        };

        vm.batchSize = Umbraco.Sys.ServerVariables.translationManager.Options.BatchSize;
        vm.hasChildren = false;

        // options
        vm.createNow = true;
        vm.children = true;
        vm.unpublished = true;
        vm.picked = [];
        vm.autoApprove = true;

        // data 
        vm.nodes = [];
        vm.job = {
            status: 'Pending',
            providerOptions: {}
        };

        // steps 
        vm.step = 'pick';

        // functions
        vm.submit = submit;
        vm.close = close;
        vm.viewPending = viewPending;
        vm.toggleChildren = toggleChildren;
        vm.toggleUnpublished = toggleUnpublished;
        vm.toggleCreateNow = toggleCreateNow;

        vm.canAutoSend = canAutoSend;
        vm.canAutoApprove = canAutoApprove;

        vm.viewJob = viewJob;

        // main step functions 
        vm.create = create;
        vm.createNodes = createNodes;
        vm.createNodesAndJob = createNodesAndJob;
        vm.complete = complete;

        // not called directly (private ?)
        vm.createJob = createJob;

        // init.
        loadSets(vm.currentNodeId);
        loadContent(vm.currentNodeId);
        initHub();

        //////////

        function create() {
            if (vm.createNow) {

                vm.step = 'job';
                var set = getSingleSet();
                vm.providerKey = set.ProviderKey;
                vm.job.setup = false;
                vm.job.name = formatJobName();
                return;
            }
            vm.createNodes(false);
        }

        function formatJobName() {

            // we can move these to settings ? 
            var truncateAt = 41;
            var dateFormat = 'DD/MM/YYYY, HH:mm';

            var momentDate = moment(new Date());
            var name = vm.currentNodeName;

            if (vm.hasChildren && vm.children) {
                if (name.length > truncateAt - 10)
                    name = name.substring(0,truncateAt-10) + '...';
                name += ' +children';
            }
            else {
                if (name.length > truncateAt)
                    name = name.substring(0, truncateAt) + '...';
            }
            name += ' - ' + momentDate.format(dateFormat);

            return name;
        }

        function createNodesAndJob() {
            vm.createNodes(true);
        }

        function createNodes(createJobWhenComplete) {
            vm.busy = true;
            showMessage({
                update: 'getting content nodes'
            });

            var options = {
                includeUnpublished: vm.unpublished,
                sites: vm.picked,
                clientId: getClientId()
            };

            translateNodeManager.createNodes(
                vm.currentNodeId, vm.children, options, vm.batchSize, showMessage,
                function (nodes) {
                    if (createJobWhenComplete) {
                        return createJob(nodes);
                    }
                    complete(nodes);
                }, function (error) {
                    showError(error);
                });


        }

        function createJob(nodes) {

            vm.jobs = []; // multiple languages .
            var groups = translateNodeManager.groupNodes(nodes, vm.job.name);

            var completed = 0;
            var total = groups.length + 1;

            var autoApproveJob = canAutoApprove() && vm.autoApprove;

            var groupId = createNewGroupId();

            showMessage({ progress: 0, update: 'creating ' + groups.length + ' jobs' });


            var jobPromises = [];

            groups.forEach(function (group) {
                group.status = 'submitted';

                var options = {
                    name: group.jobName,
                    nodes: group.nodes,
                    providerKey: vm.job.provider.Key,
                    providerOptions: vm.job.providerOptions,
                    autoApprove: autoApproveJob,
                    clientId: getClientId(),
                    groupId: groupId
                };

                jobPromises.push(
                    translateNodeManager.createJob(options)
                        .then(function (result) {
                            completed++;
                            showMessage({
                                progress: { done: completed / total * 100, step: 'Created ' + options.jobName },
                                update: 'Creating jobs'
                            });

                            vm.jobs.push(result.data);

                        }, function (error) {
                            showError(error);
                        })
                );
            });

            $q.all(jobPromises).then(function () {

                showMessage({
                    progress: { done: 100, step: 'Submitting Job Group' },
                    update: 'Finalizing Jobs'
                });

                vm.submittingGroup = true;
                translateNodeManager.submitGroup(groupId)
                    .then(function (result) {

                        vm.submittingGroup = false;
                        vm.busy = false;

                        if (vm.step !== 'error') {
                            vm.step = 'done-job';
                        }
                    }, function (error) {
                        showError(error);
                    });
            });

        }

        function complete(nodes) {
            vm.step = 'done';
            vm.nodes = nodes;
            vm.busy = false;
        }

        //////////
        function showMessage(message) {
            if (message.progress !== undefined) {
                vm.progress = message.progress;
            }
            vm.update = message.update;
        }

        function showError(error) {

            vm.busy = false;
            vm.step = 'error';

            console.log('Error', error.data);

            vm.error = {
                message: error.data.ExceptionMessage,
                stack: error.data.StackTrace
            };
        }


        //////////

        function loadSets(id) {

            translateSetService.getByNode(id)
                .then(function (result) {
                    vm.sets = result.data;

                    setSelectedLanguages(vm.sets);

                    vm.loading = false;
                }, function (error) {
                    notificationsService
                        .error('load', "can't load sets for this node");
                });
        }

        function setSelectedLanguages(sets) {
            sets.forEach(function (set) {
                set.Sites.forEach(function (site) {
                    if (vm.selectedLanguages.includes(site.Culture.DisplayName)) {
                        site.checked = true;
                        vm.picked.push({ siteId: site.Id, cultureId: site.Culture.Name, setId: set.Id });
                    }
                });
            });
        }

        function getSingleSet() {
            var pickedSets = [];
            var selectedSet = {};

            for (var s = 0; s < vm.picked.length; s++) {
                if (pickedSets.indexOf(vm.picked[s].setId) === -1) {
                    pickedSets.push(vm.picked[s].setId);
                    selectedSet = vm.sets.find(x => x.Id === vm.picked[s].setId);
                }
            }

            // no set, or multiset return null;
            if (pickedSets.length < 1 || pickedSets.length > 1) {
                return null;
            }

            return selectedSet;
        }

        /// 
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

        function loadContent(nodeId) {
            contentResource.getChildren(nodeId, { cultureName: $routeParams.mculture })
                .then(function (data) {
                    vm.hasChildren = data.totalItems !== 0;
                });
        }

        ////// toggles 

        function toggleChildren() {
            vm.children = !vm.children;
        }

        function toggleUnpublished() {
            vm.unpublished = !vm.unpublished;
        }

        function toggleCreateNow() {
            vm.createNow = !vm.createNow;
        }

        ///// dialog functions 
        function viewJob(job) {
            if ($scope.model.close) {
                $scope.model.close();
            }

            $location.path('/translation/jobs/edit/' + job.Id);
        }

        function submit() {
            if ($scope.model.submit) {
                $scope.model.submit(true);
            }
        }

        function close() {
            if ($scope.model.close) {
                $scope.model.close();
            }
        }

        function viewPending() {
            if ($scope.model.close) {
                $scope.model.close();
            }
            $location.path('/translation/pending/summary');
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

        // gets the clientId from the signalRHub
        function getClientId() {
            if ($.connection !== undefined && $.connection.hub !== undefined) {
                return $.connection.hub.id;
            }

            return '';
        }

        // psudo guid gen, so we get something unique 
        function createNewGroupId() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

    }

    angular.module('umbraco')
        .controller('translateCreateDialogController', createDialogController);
})();