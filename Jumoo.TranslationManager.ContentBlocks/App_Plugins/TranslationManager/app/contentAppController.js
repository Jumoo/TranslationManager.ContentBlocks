(function () {

    'use strict';

    function contentAppController($rootScope, $q, editorService, editorState, userService,
        translateSetService,
        translateNodeService,
        translateJobService,
        translateDialogManager) {

        var vm = this;
        vm.loading = true;
        vm.nodeId = editorState.current.id;
        vm.status = 0;
        vm.node = editorState.current;

        vm.canSend = editorState.current.allowedActions.indexOf(Umbraco.Sys.ServerVariables.translationManager.Options.SendLetter) !== -1;
        if (vm.canSend) {
            canBeSent(vm.nodeId);
        }

        vm.versions = {};

        vm.create = create;
        vm.loadJobs = loadJobs;

        vm.loading = false;

        vm.hasSettings = false;
        vm.hasTranslation = false;

        userService.getCurrentUser().then(function (u) {
            vm.hasSettings = u.allowedSections.includes('settings');
            vm.hasTranslation = u.allowedSections.includes('translation');
        });

        /////////////
        function create() {
            translateDialogManager.openCreateDialog({
                entity: {
                    id: editorState.current.id,
                    name: editorState.current.variants[0].name
                }
            }, function (change) {
                $rootScope.$broadcast('translate-reloaded');
            });
        }

        function getJobsForContent(id, page, cb) {
            translateJobService.getJobsByContentId(id, page)
                .then(function (result) {
                    cb(result.data);
                });
        }

        function loadJobs(page, cb) {
            getJobsForContent(vm.nodeId, page, function (results) {
                cb(results);
            });
        }

        function canBeSent(id) {
            translateSetService.isInAnyMaster(id)
                .then(function (result) {
                    vm.canSend = result.data;
                });
        }
    }

    angular.module('umbraco')
        .controller('translateContentAppController', contentAppController);
})();