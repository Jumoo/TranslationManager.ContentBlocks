/**
 * @ngdoc factory
 * @name translateDialogManager
 * @description opens the dialog for sending things to translation
 * 
 *  we have done it seperate so we can call it as a custom action
 *  from the actions menu of a node. 
 */
(function () {
    'use strict';

    function dialogManager($timeout, editorService, navigationService) {

        return {
            openCreateDialog: openCreateDialog,
            openDictionaryDialog: openDictionaryDialog,
            openItem: openItem,
            openJob: openJob,
            openSet: openSet
        };

        function openCreateDialog(options, cb) {

            editorService.open({
                entity: {
                    id: options.entity.id * 1,
                    name: options.entity.name
                },
                languages: options.languages,
                title: 'Create Translations for',
                view: Umbraco.Sys.ServerVariables.translationManager.plugin + 'app/createDialog.html',
                size: 'small',
                submit: function (done) {
                    editorService.close();
                    navigationService.hideNavigation();
                    if (cb !== undefined) {
                        cb(true);
                    }
                },
                close: function () {
                    editorService.close();
                    navigationService.hideNavigation();
                    if (cb !== undefined) {
                        cb(false);
                    }
                }
            });

            $timeout(function () {
                navigationService.hideDialog();
            });

        }

        function openDictionaryDialog(options, cb) {
            navigationService.hideDialog();

            editorService.open({
                entity: {
                    id: options.entity.id * 1,
                    name: options.entity.name
                },
                languages: options.languages,
                title: 'Create dictionary translations',
                view: Umbraco.Sys.ServerVariables.translationManager.plugin + 'app/dictionaryDialog.html',
                size: 'small',
                submit: function (done) {
                    editorService.close();
                    if (cb !== undefined) {
                        cb(true);
                    }
                },
                close: function () {
                    editorService.close();
                    if (cb !== undefined) {
                        cb(false);
                    }
                }
            });
        }

        function openItem(itemId, cb) {

            editorService.open({
                nodeId: item.Id,
                title: 'Item View',
                view: Umbraco.Sys.ServerVariables.translationManager.plugin + 'backoffice/items/view.html',
                submit: function (done) {
                    editorService.close();
                    if (cb !== undefined) {
                        cb();
                    }
                },
                close: function () {
                    editorService.close();
                    if (cb !== undefined) {
                        cb();
                    }
                }
            });
        }

        function openJob(jobId, cb) {
            editorService.open({
                jobId: jobId,
                title: 'Job View',
                view: Umbraco.Sys.ServerVariables.translationManager.plugin + 'backoffice/jobs/edit.html',
                submit: function () {
                    editorService.close();
                    if (cb !== undefined) {
                        cb();
                    }
                },
                close: function () {
                    editorService.close();
                    if (cb !== undefined) {
                        cb();
                    }
                }
            });
        }

        function openSet(setId, cb) {
            editorService.open({
                setId: setId,
                title: 'Set View',
                view: Umbraco.Sys.ServerVariables.translationManager.plugin + 'backoffice/tmSettings/setEdit.html',
                submit: function () {
                    editorService.close();
                    if (cb !== undefined) {
                        cb();
                    }
                },
                close: function () {
                    editorService.close();
                    if (cb !== undefined) {
                        cb();
                    }
                }
            });

        }

    }

    angular.module('umbraco')
        .factory('translateDialogManager', dialogManager);
})();