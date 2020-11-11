/**
  *  @ngdoc service
  *  @name translateJobService
  *  @function 
  *  
  *  @description
  *    Service for managing translation jobs
  */

(function () {

    'use strict';

    function jobService($http) {

        var serviceRoot = Umbraco.Sys.ServerVariables.translationManager.jobService;

        var service = {
            get: get,
            getFull: getFull,
            getAll: getAll,

            getByCulture: getByCulture,
            getByCulturePages: getByCulturePaged,
            getByCultureAndStatusPaged: getByCultureAndStatusPaged,
            getArchivedByCulturePaged: getArchivedByCulturePaged,

            getAllNodesInJob: getAllNodesInJob,
            getFullNodesInJob: getFullNodesInJob,
            getNodesByJobPaged: getNodesByJobPaged,

            getJobsByContentId: getJobsByContentId,

            getByUser: getByUser,
            getByUserAndStatus: getByUserAndStatus,
            getByUserCultureAndStatus: getByUserCultureAndStatus,
            getUserDisplayNames: getUserDisplayNames,
            getUserDisplayName: getUserDisplayName,

            getByStatus: getByStatus,

            create: create,
            submit: submit,
            archive: archive,
            cancel: cancel,
            remove: remove,
            resetJob: resetJob,
            approve: approve,

            submitGroup: submitGroup,

            getSummaryInfo: getSummaryInfo,
            getSummaryRange: getSummaryRange,
            getSummaryCount: getSummaryCount,

            getStats: getStats,

            checkAll: checkAll,
            checkById: checkById
        };

        return service;

        ///////////////

        /// Getters 

        function get(id) {
            return $http.get(serviceRoot + "Get/" + id);
        }

        function getFull(id) {
            return $http.get(serviceRoot + "GetFull/" + id);
        }

        function getAll() {
            return $http.get(serviceRoot + "GetAll");
        }

        function getByCulture(id) {
            return $http.get(serviceRoot + "GetByCulture/" + id);
        }

        function getByCulturePaged(id, page) {
            return $http.get(serviceRoot + "GetByCulture/" + id + "?page=" + page);
        }

        function getByCultureAndStatusPaged(id, minStatus, maxStatus, page) {
            return $http.get(serviceRoot + "GetByCultureAndStatus/" +
                id + "?min=" + minStatus + "&max=" + maxStatus + "&page=" + page);
        }

        function getArchivedByCulturePaged(id, page) {
            return $http.get(serviceRoot + "GetArchivedByCulture/" + id + "?page=" + page);
        }

        function getAllNodesInJob(id) {
            return $http.get(serviceRoot + "GetAllNodesInJob/" + id);
        }

        function getFullNodesInJob(id) {
            return $http.get(serviceRoot + "GetFullNodesInJob/" + id);
        }

        function getNodesByJobPaged(id, page) {
            return $http.get(serviceRoot + "GetNodesByJob/" + id + "?page=" + page);
        }

        function getJobsByContentId(id, page) {
            return $http.get(serviceRoot + "GetJobsByContentId/" + id + "?page=" + page);
        }

        function getByUser(id, page) {
            return $http.get(serviceRoot + "GetByUser/" + id + "?page=" + page);
        }

        function getByUserAndStatus(id, minStatus, maxStatus, page) {
            return $http.get(serviceRoot + "GetByUserAndStatus/" +
                id + "?min=" + minStatus + "&max=" + maxStatus + "&page=" + page);
        }

        function getByUserCultureAndStatus(id, cultureId, minStatus, maxStatus, page) {
            return $http.get(serviceRoot + "GetByUserCultureAndStatus/" +
                id + "?cultureId=" + cultureId + "&min=" + minStatus + "&max=" + maxStatus + "&page=" + page);
        }

        function getByStatus(minStatus, maxStatus, page) {
            return $http.get(serviceRoot + "GetByStatus/?min=" + minStatus + "&max=" + maxStatus + "&page=" + page);
        }

        function getUserDisplayNames(ids) {
            return $http.post(serviceRoot + "GetUserDisplayNames", ids);
        }

        function getUserDisplayName(id) {
            return $http.get(serviceRoot + "GetUserDisplayName/" + id);
        }

        /// Job Workflow

        function create(options) {
            return $http.post(serviceRoot + "Create", options);
        }

        function submit(id) {
            return $http.post(serviceRoot + "Submit/" + id);
        }

        function archive(id) {
            return $http.post(serviceRoot + "Archive/" + id);
        }

        function cancel(id) {
            return $http.post(serviceRoot + "Cancel/" + id + "?deleteNodes=true");
        }

        function remove(id) {
            return $http.post(serviceRoot + "Remove/" + id);
        }

        function resetJob(id, status) {
            return $http.post(serviceRoot + "ResetJob/" + id + "?status=" + status);
        }

        function approve(id, options) {
            return $http.post(serviceRoot + "Approve/" + id, options);
        }

        function submitGroup(groupId) {
            return $http.post(serviceRoot + "SubmitGroup/" + groupId);
        }

        // summary 
        function getSummaryInfo(status) {
            return $http.get(serviceRoot + "GetSummaryInfo/?status=" + status);
        }
        function getSummaryRange(min, max) {
            return $http.get(serviceRoot + "GetSummaryRange/?min=" + min + "&max=" + max);
        }
        function getSummaryCount(min, max) {
            return $http.get(serviceRoot + "GetSummaryCount/?min=" + min + "&max=" + max);
        }

        function getStats() {
            return $http.get(serviceRoot + "GetStats");
        }

        // job checkers
        function checkAll() {
            return $http.get(serviceRoot + "CheckPending");
        }

        function checkById(id) {
            return $http.get(serviceRoot + "CheckPendingById/" + id);

        }
    }

    angular.module('umbraco.services')
        .factory('translateJobService', jobService);

})();