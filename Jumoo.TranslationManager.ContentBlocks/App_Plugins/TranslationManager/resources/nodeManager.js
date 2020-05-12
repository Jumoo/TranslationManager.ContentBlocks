/**
 * @ngdoc factory
 * @name translateNodeManager
 * @description manages the creation / deleting of nodes
 */

(function () {
    'use strict';

    function nodeManager(translateNodeService, translateJobService) {

        return {
            createNodes: createNodes,
            groupNodes: groupNodesByCulture,
            createJob: createJob,
            openCreateDialog: openCreateDialog,

            submitGroup: submitGroup,

            createDictionaryNodes: createDictionaryNodes
        };

        function openCreateDialog(options) {
            // console.log(options);
        }

        ////////// Node Creation 
        function createNodes(nodeId, children, options, batchSize,
            msgCallback,
            completeCallback,
            errorCallback)
        {
            msgCallback({
                progress: { done: 0, step: 'starting up' },
                update: 'getting content ids'
            });

            translateNodeService.getContentIds(nodeId, children)
                .then(function (result) {
                    var ids = result.data;
                    var batches = createBatches(ids, batchSize);

                    createNodesFromBatches(batches, options, msgCallback,
                        function (nodes) {
                            if (nodes.length === 0) {
                                errorCallback({
                                    data: {
                                        ExceptionMessage: 'No valid nodes to send to translation',
                                        StackTrace: 'CreateNodes returned 0 nodes, they may not exist or be published'
                                    }
                                });
                            }
                            else {
                                completeCallback(nodes);
                            }
                        }, errorCallback);
                });
        }

        /**
         * @ngdoc method 
         * @name createBatches
         * @description splits an array of items into an array of batched items
         * @param {array} items items you want to split
         * @param {int} size how many items in each batch
         * @returns {array} batches of ids broken up
         */
        function createBatches(items, size) {

            var batches = [];
            var batchCount = Math.ceil(items.length / size);
            for (var b = 0; b < batchCount; b++) {
                var batch = items.slice(b * size, (b + 1) * size);
                batches.push(batch);
            }
            return batches;
        }

        /**
         * @ngdoc method
         * @name createNodesFromBatches
         * @description creates the nodes in batch calls
         * 
         * @param {array} batches batches of node ids
         * @param {object} options creation options 
         * @param {function} msgCallback function to call with updates on progress
         * @param {function} callback callback when complete
         * @param {function} errCallback callback when errors
         */
        function createNodesFromBatches(batches, options,
            msgCallback,
            callback, errCallback) {
            var b = 0;
            process(batches[b]);

            var nodes = [];

            function process(items) {
                b++;

                var msg = {
                    progress: { done: b / batches.length * 100, step: 'group ' + b + ' of ' + batches.length },
                    update: 'processing batch'
                };
                msgCallback(msg);

                translateNodeService.createNodes(items, options)
                    .then(function (result) {
                        nodes = nodes.concat(result.data);
                        if (b < batches.length) {
                            process(batches[b]);
                        }
                        else {
                            callback(nodes);
                        }
                    }, function (error) {
                        errCallback(error);
                    });
            }
        }


        /**
         * @ngdoc method
         * @name groupNodesByCulture
         * @description groups a list of nodes based on their culture
         * @param {array} nodes nodes you want to group
         * @param {string} nameTemplate name template for the groups
         * 
         * @returns {array} nodes groups by the culture Id
         */
        function groupNodesByCulture(nodes, nameTemplate) {

            var groups = [];

            nodes.map(function (node) {
                var found = false;
                groups.map(function (group) {
                    if (group.id === node.Culture.Name) {
                        group.nodes.push(node);
                        found = true;
                    }
                });

                if (!found) {
                    // new 
                    var newGroup = {
                        id: node.Culture.Name,
                        name: node.Culture.DisplayName,
                        nodes: [],
                        status: 'Pending',
                        jobName: nameTemplate
                            .replace("{to}", node.Culture.DisplayName)
                    };
                    newGroup.nodes.push(node);
                    groups.push(newGroup);
                }
            });

            return groups;
        }

        ///// Job Creation
        function createJob(options) {
            return translateJobService.create(options);
        }
 
        function submitGroup(groupId) {
            return translateJobService.submitGroup(groupId);
        }

        /////// dictionary items 
        function createDictionaryNodes(nodeId, options,
            msgCallback,
            completeCallback,
            errorCallback) {

            msgCallback({
                progress: { done: 0, step: 'starting up' },
                update: 'Creating dictionary items'
            });

            var items = [nodeId];

            translateNodeService.createDictionaryNodes(items, options)
                .then(function (result) {
                    completeCallback(result.data);
                }, function (error) {
                    errorCallback(error);
                });
        }
    }

    angular.module('umbraco')
        .factory('translateNodeManager', nodeManager);

})();