(function () {
    'use strict';

    var itemListViewComponent = {
        templateUrl: Umbraco.Sys.ServerVariables.application.applicationPath + 'App_Plugins/TranslationManager/items/itemlistview.html',
        bindings: {
            nodeId: '<',
            jobId: '<',
            culture: '<',
            status: '<',
            selectable: '<',
            allowRemove: '<',
            allowRemoveAll: '<',
            selectedItems: '=',
            selectedByDefault: '<',
            showSets: '<?'
        },
        controllerAs: 'vm',
        controller: itemListViewController
    };

    function itemListViewController($scope, $filter, editorService, 
        notificationsService, localizationService, overlayService,
        translateNodeService,
        translateJobService,
        translateSetService) {

        var vm = this;

        vm.buttonState = 'init';

        vm.page = 1;
        vm.allSelected = false;
        vm.loading = true;
        vm.paths = [];
        vm.selectedItems = [];

        // hook into parent if we want to refresh everything
        vm.refreshParent = $scope.$parent.vm.refresh;

        // list view functions 
        vm.isSelectable = isSelectable;
        vm.isActive = isActive;
        vm.showPath = showPath;
        vm.hasOpenNodes = hasOpenNodes;
        vm.defaultAction = defaultAction;

        vm.selectItem = selectItem;
        vm.selectAll = selectAll;
        vm.selectEvery = selectEvery;
        vm.deselectItem = deselectItem;
        vm.deselectAll = deselectAll;

        // basic item manipulation
        vm.viewItem = viewItem;
        vm.removeItem = removeItem;
        vm.removeAll = removeAll;
        vm.refresh = refresh;

        // paging
        vm.next = next;
        vm.prev = prev;
        vm.gotoPage = gotoPage;


        vm.$onInit = function () {
            vm.allSelected = vm.selectedByDefault;
            vm.refresh();
        };

        $scope.$on('translate-reloaded', function () {
            vm.refresh();
        });

        $scope.$on('translate-parentloaded', function () {
            vm.updateSelectedState();
        });


        ////////// List view stuff
        function selectItem(item, $event) {

            if ($event !== undefined) {
                $event.preventDefault();
                $event.stopPropagation();
            }

            item.selected = !item.selected;

            if (item.Status !== 'Approved') {
                generateSelectedIds(false);
            }
        }

        function selectAll() {
            vm.allSelected = !vm.allSelected;

            for (var i = 0; i < vm.results.items.length; i++) {
                if (vm.results.items[i].selectable) {
                    vm.results.items[i].selected = vm.allSelected;
                }
            }

            generateSelectedIds(true);
        }


        function selectEvery() {
            if (vm.jobId !== undefined) {
                selectAllInJob(vm.jobId);
            }
            else {
                selectAllNodes(vm.culture, vm.status);
            }
        }

        function selectAllInJob(jobId) {
            vm.buttonState = 'busy';
            translateJobService.getAllNodesInJob(jobId)
                .then(function (result) {
                    vm.allSelected = true;
                    vm.selectedItems = [];

                    for (var i = 0; i < result.data.length; i++) {
                        if (isSelectable(result.data[i])) {
                            vm.selectedItems.push(result.data[i]);
                        }
                    }

                    updateSelectedState();
                    vm.buttonState = 'success';
                });
        }

        function selectAllNodes(cultureName, status) {
            vm.buttonState = 'busy';
            translateNodeService.getAllByCultureAndStatus(cultureName, status)
                .then(function (result) {
                    vm.selectedItems = result.data;
                    vm.allSelected = true;
                    vm.buttonState = 'success';
                    updateSelectedState();
                });
        }


        function deselectAll() {
            vm.allSelected = false;
            vm.selectedItems = [];
            updateSelectedState();
        }

        function updateLocalItemOptions() {
            if (vm.results !== undefined && vm.results.items.length > 0) {
                for (var i = 0; i < vm.results.items.length; i++) {
                    vm.results.items[i].selectable = isSelectable(vm.results.items[i]);
                    vm.results.items[i].active = isActive(vm.results.items[i]);
                }
            }

        }

        function updateSelectedState() {
            if (vm.results !== undefined && vm.results.items.length > 0) {

                var wholePagePicked = true;

                angular.forEach(vm.results.items, function (value) {
                    if (value.selectable) {
                        value.selected = isSelected(value);
                        if (!value.selected) {
                            wholePagePicked = false;
                        }
                    }
                });

                vm.allSelected = wholePagePicked;
            }
        }

        function generateSelectedIds(blankFirst) {

            if (blankFirst) {
                vm.selectedItems = [];
            }

            angular.forEach(vm.results.items, function (value) {
                if (value.selected) {
                    if (isSelectable(value)) {
                        addSelectedItem(value);
                    }
                }
                else {
                    deselectItem(value);
                }
            });
        }

        function deselectItem(item) {
            for (var i = 0; i < vm.selectedItems.length; i++) {
                if (vm.selectedItems[i].Id === item.Id) {
                    vm.selectedItems.splice(i, 1);
                    return;
                }
            }
        }

        function addSelectedItem(item) {
            for (var i = 0; i < vm.selectedItems.length; i++) {
                if (vm.selectedItems[i].Id === item.Id) {
                    return;
                }
            }

            vm.selectedItems.push(item);
        }

        function isSelectable(item) {
            return item.Status === 'Reviewing'
                || item.Status === 'Open'
                || item.Status === 'InProgress';
        }

        function isActive(item) {
            return item.Status !== 'Approved' && item.Status !== 'Closed';
        }

        function isSelected(item) {
            if (vm.selectedItems !== undefined) {
                for (var i = 0; i < vm.selectedItems.length; i++) {
                    if (vm.selectedItems[i].Id === item.Id) {
                        return true;
                    }
                }
            }
            return false;
        }

        /// sets
        vm.sets = [];
        vm.setVisible = false;
        vm.getSet = getSet;

        function loadSets() {
            translateSetService.list()
                .then(function (result) {
                    vm.sets = result.data;
                    if (vm.sets.length > 1)
                        vm.setVisible = true;
                });
        }

        function getSet(key) {
            return $filter('filter')(vm.sets, { 'Key': key })[0].Name;
        }


        ///////// Loading 

        function loadByStatus(culture, status, page) {
            vm.loading = true;
            translateNodeService.getByCultureAndStatusPaged(culture, status, page)
                .then(function (result) {
                    vm.results = result.data;
                    updateLocalItemOptions();

                    if (vm.selectedByDefault) {
                        selectAll();
                    }
                    else {
                        updateSelectedState();
                    }
                    getPaths();
                    vm.loading = false;
                }, function (error) {
                    notificationsService
                        .error('load failed', error.data.ExceptionMessage);
                });
        }

        function loadByJob(jobId, page) {
            vm.loading = true;

            translateJobService.getNodesByJobPaged(jobId, page)
                .then(function (result) {
                    vm.results = result.data;
                    updateLocalItemOptions();

                    if (vm.selectedByDefault) {
                        selectAllInJob(jobId);
                    }
                    else {
                        updateSelectedState();
                    }
                    getPaths();
                    vm.loading = false;
                }, function (error) {
                    notificationsService
                        .error('load failed', error.data.ExceptionMessage);
                });
        }

        function loadByNode(nodeId, status, page) {
            vm.loading = true;

            translateNodeService.getByNodeAndStatusPaged(nodeId, status, page)
                .then(function (result) {
                    vm.results = result.data;
                    updateLocalItemOptions();
                    getPaths();
                    vm.loading = false;
                }, function (error) {
                    notificationsService
                        .error('load failed', error.data.ExceptionMessage);
                });
        }


        function getPaths() {
            var ids = [];
            vm.paths = {};

            for (var i = 0; i < vm.results.items.length; i++) {

                if (vm.results.items[i].IsDictionary) {
                    // push to paths.
                    vm.paths[vm.results.items[i].MasterNodeId] = 'Dictionary';
                    vm.paths[vm.results.items[i].TargetNodeId] = 'Dictionary';
                }
                else {
                    ids.push(vm.results.items[i].MasterNodeId);
                    ids.push(vm.results.items[i].TargetNodeId);
                }
            }


            if (ids.length > 0) {
                translateNodeService.getPaths(ids)
                    .then(function (result) {
                        vm.paths = Object.assign(vm.paths, result.data);
                    });
            }
        }

        function showPath(id) {
            if (vm.paths.hasOwnProperty(id)) {
                return vm.paths[id];
            }
            return '..';
        }

        function hasOpenNodes(item) {
            if (item !== undefined) {
                return item.HasOpenSiblings && isActive(item);
            }
            return false;
        }

        /// item management 
        function removeAll() {

            localizationService.localizeMany(["translate_removeAllTitle", "translate_removeAllMessage"])
                .then(function (values) {
                    var overlay = {
                        title: values[0],
                        content: values[1],
                        submitButtonLabelKey: "translate_removeAllConfirm",
                        closeButtonLabelKey: "translate_removeAllCancel",
                        disableBackdropClick: true,
                        disableEscKey: true,
                        submit: function () {
                            overlayService.close();
                            vm.buttonState = 'busy';

                            translateNodeService.removeOpenByCulture(vm.culture)
                                .then(function (result) {
                                    notificationsService
                                        .success('remove', 'all items removed');
                                    vm.refresh();
                                    vm.buttonState = 'success';
                                }, function (error) {
                                    notificationsService
                                        .error('failed', 'failed to remove nodes');
                                    vm.buttonState = 'error';
                                });
                        }
                    };

                    overlayService.confirmDelete(overlay);
                });
        };

        /////////
        function defaultAction(item) {
            if (item.selectable) {
                vm.selectItem(item);
            }
            else {
                vm.viewItem(item);
            }
        }


        function viewItem(item, $event) {
            if ($event !== undefined) {
                $event.preventDefault();
                $event.stopPropagation();
            }

            editorService.open({
                nodeId: item.Id,
                title: 'Item View',
                view: Umbraco.Sys.ServerVariables.translationManager.plugin + 'backoffice/items/view.html',
                submit: function (done) {
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            });
        }

        function removeItem(item, $event) {

            if ($event !== undefined) {
                $event.preventDefault();
                $event.stopPropagation();
            }


            translateNodeService.remove(item.Id)
                .then(function (result) {
                    notificationsService.success('delete', 'item removed');
                    vm.refresh();
                }, function (error) {
                    notificationsService.error('delete failed', error.data.ExceptionMessage);
                });
        }

        function refresh() {
            vm.allSelected = false;
            vm.loading = true;

            if (vm.jobId !== undefined) {
                loadByJob(vm.jobId, vm.page);
            }
            else if (vm.nodeId !== undefined) {
                loadByNode(vm.nodeId, vm.status, vm.page);
            }
            else  {
                loadByStatus(vm.culture, vm.status, vm.page);
            }

            if (vm.showSets) {
                loadSets();
            }

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
        .component('translateItemListView', itemListViewComponent);
})();