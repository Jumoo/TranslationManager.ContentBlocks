(function () {
    'use strict';

    var itemStatusViewComponent = {
        templateUrl: Umbraco.Sys.ServerVariables.application.applicationPath + 'App_Plugins/TranslationManager/items/itemStatusView.html',
        bindings: {
            node: '<'
        },
        controllerAs: 'vm',
        controller: itemStatusViewController
    };

    function itemStatusViewController($scope,
        $routeParams,
        localizationService, overlayService,
        editorService,
        editorState,
        notificationsService,
        translateStatusService,
        translateDialogManager,
        translateNodeService,
        eventsService) {

        var vm = this;
        vm.loading = true;
        vm.versions = [];

        vm.viewJob = viewJob;
        vm.viewItem = viewItem;

        vm.createTranslation = createTranslation;
        vm.getVersionStatus = getVersionStatus;
        vm.cloneTranslation = cloneTranslation;

        vm.$onInit = function () {
            vm.currentCulture = $routeParams.mculture;
            getVersionStatus(vm.node.id);
        };

        $scope.$on('translate-reloaded', function (event, args) {
            getVersionStatus(vm.node.id);
        });

        ///////////////////////

        function getVersionStatus(id) {
            vm.loading = true;
            translateStatusService.getStatus(id)
                .then(function (result) {
                    vm.versions = result.data;
                    vm.loading = false;
                });
        }

        function viewJob(jobId, $event) {
            if ($event !== undefined) {
                $event.preventDefault();
                $event.stopPropagation();
            }

            translateDialogManager.openJob(jobId, function () {
                vm.getVersionStatus(vm.node.id);
            });
        }

        function viewItem(itemId, $event) {
            if ($event !== undefined) {
                $event.preventDefault();
                $event.stopPropagation();
            }

            translateDialogManager.openItem(itemId, function () {
                vm.getVersionStatus(vm.node.id);
            });
        }

        function createTranslation(version, $event) {
            if ($event !== undefined) {
                $event.preventDefault();
                $event.stopPropagation();
            }

            translateDialogManager.openCreateDialog({
                entity: {
                    id: version.ContentId,
                    name: version.LanguageName
                },
                languages: [version.LanguageName]
            });
        }

        function cloneTranslation(target, $event) {
            if ($event !== undefined) {
                $event.preventDefault();
                $event.stopPropagation();
            }
            var source = vm.currentCulture;


            localizationService.localizeMany(["translate_cloneTitle", "translate_cloneMessage"])
                .then(function (values) {
                    var overlay = {
                        title: values[0],
                        content: localizationService.tokenReplace(values[1], [source, target]),
                        submitButtonLabelKey: "translate_cloneConfirm",
                        disableBackdropClick: true,
                        disableEscKey: true,
                        submit: function () {
                            overlayService.close();

                            translateNodeService.cloneNode(vm.node.id, source, target)
                                .then(function (result) {
                                    notificationsService.success('Cloned', 'Content Cloned to ' + target);
                                    eventsService.emit('editors.documentType.saved', { documentType: { id: vm.node.contentTypeId } });
                                });
                        }
                    };

                    overlayService.confirmDelete(overlay);
                });
        }
    }

    angular.module('umbraco')
        .component('translateItemStatusView', itemStatusViewComponent);

})();