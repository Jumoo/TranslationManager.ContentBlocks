/**
  *  @ngdoc service
  *  @name translateNodeService
  *  @function 
  *  
  *  @description
  *    Service for getting and creating translation nodes
  */

(function () {

    'use strict';

    function nodeService($http) {

        var serviceRoot = Umbraco.Sys.ServerVariables.translationManager.nodeService;

        var service = {
            getNode : getNode,
            getByCultureId : getByCultureId,

            getAllByCultureAndStatus: getAllByCultureAndStatus,
            getByCultureAndStatusPaged: getByCultureAndStatusPaged,
            getByNodeAndStatusPaged: getByNodeAndStatusPaged,

            getCultures : getCultures,
            getSummaryInfo: getSummaryInfo,
            getSummaryCount: getSummaryCount,
            getVersionStatus: getVersionStatus,

            getPaths: getPaths,

            getContentIds: getContentIds,
            createNodes: createNodes,
            createNodesFromTarget: createNodesFromTarget,

            getDictionaryIds: getDictionaryIds,
            createDictionaryNodes: createDictionaryNodes,

            remove: remove,
            removeOpenByCulture: removeOpenByCulture,

            removeProperty: removeProperty,
            saveProperty: saveProperty,
            updateProperties: updateProperties,

            getWordCountInfo: getWordCountInfo,

            cloneNode: cloneNode
        };

        return service;

        ///////////////

        /// Getters
        function getNode(id) {
            return $http.get(serviceRoot + "GetNode/" + id);
        }

        function getByCultureId(id) {
            return $http.get(serviceRoot + "GetByCultureId/" + id);
        }

        function getAllByCultureAndStatus(id, status) {
            return $http.get(serviceRoot + "GetAllByCultureAndStatus/" + id + "?status=" + status);
        }

        function getByCultureAndStatusPaged(id, status, page) {
            return $http.get(serviceRoot + "GetByCultureAndStatus/" + id + '?status=' + status + '&page=' + page);
        }

        function getByNodeAndStatusPaged(id, status, page) {
            return $http.get(serviceRoot + "GetByNodeAndStatus/" + id + "?status=" + status + '&page=' + page);
        }

        function getCultures() {
            return $http.get(serviceRoot + "GetCultures");
        }

        function getVersionStatus(id) {
            return $http.get(serviceRoot + "GetVersionStatus/" + id);
        }

        function getSummaryInfo(status) {
            return $http.get(serviceRoot + "GetSummaryInfo/?status=" + status);
        }

        function getSummaryCount(status) {
            return $http.get(serviceRoot + "GetSummaryCount/?status=" + status);
        }


        /// Node Creation
        function getContentIds(id, includeDecendents) {
            return $http.get(serviceRoot + "GetContentIds/" + id + "?includeDecendents=" + includeDecendents);
        }

        function createNodes(ids, options) {
            return $http.post(serviceRoot + "CreateNodes", { ids: ids, options: options });
        }

        function createNodesFromTarget(ids, options) {
            return $http.post(serviceRoot + "CreateNodesFromTarget", { ids: ids, options: options });
        }

        /////// dictionary
        function getDictionaryIds(id, includeDecendents) {
            return $http.get(serviceRoot + "GetDictionaryIds/" + id + "?includeDecendents=" + includeDecendents);
        }

        function createDictionaryNodes(ids, options) {
            return $http.post(serviceRoot + "CreateDictionaryNodes", { ids: ids, options: options });
        }


        /// Delete / removal
        function remove(id) {
            return $http.delete(serviceRoot + "Remove/" + id);
        }

        function removeOpenByCulture(cultureId) {
            return $http.delete(serviceRoot + "RemoveOpenByCulture/" + cultureId);
        }

        /// properties 
        function removeProperty(id) {
            return $http.delete(serviceRoot + "RemoveProperty/" + id);
        }

        function saveProperty(id, property) {
            return $http.post(serviceRoot + "SaveProperty/" + id, property);
        } 

        function updateProperties(id, properties) {
            return $http.post(serviceRoot + "UpdateProperties/" + id, properties);
        }

        function getPaths(nodes) {
            return $http.post(serviceRoot + "NodePaths", nodes);
        }

        /////// word count 
        function getWordCountInfo(id) {
            return $http.get(serviceRoot + "GetWordCountInfo/" + id);
        }

        ////// clone
        function cloneNode(id, source, target) {
            return $http.post(serviceRoot + "CloneNode/" + id, { source: source, target: target });
        }
    }

    angular.module('umbraco.services')
        .factory('translateNodeService', nodeService);

})();