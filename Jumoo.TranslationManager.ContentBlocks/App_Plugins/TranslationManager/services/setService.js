/**
  *  @ngdoc service
  *  @name translateSetService
  *  @function 
  *  
  *  @description
  *    Service for managing lifecylce of a translation set
  */

(function () {

    'use strict';

    function setService($http) {

        var serviceRoot = Umbraco.Sys.ServerVariables.translationManager.SetService;

        var service = {

            isLicenced: isLicenced,
            validLicence: validLicence,
            licenceStatus: licenceStatus,

            isInAnyMaster: isInAnyMaster,

            list: list,
            get: get,
            getByKey: getByKey,
            getByNode: getByNode,
            getByTargetNode: getByTargetNode,

            getForDictionary: getForDictionary,

            delete: deleteSet,

            getSettings: getSettings,
            saveSettings: saveSettings,

            getCultures: getCultures,
            getInstalledCultures: getInstalledCultures,
            getContentInfo: getContentInfo,

            getNotifySettings: getNotifySettings,
            saveNotifySettings: saveNotifySettings

        };

        return service;

        ///////////////

        function isLicenced() {
            return $http.get(serviceRoot + "IsLicenced");
        }

        function validLicence() {
            return $http.get(serviceRoot + "ValidLicence");
        }

        function licenceStatus() {
            return $http.get(serviceRoot + "LicenceStatus");
        }

        function isInAnyMaster(id) {
            return $http.get(serviceRoot + "IsInAnyMaster/" + id);
        }

        function list() {
            return $http.get(serviceRoot + "List");
        }

        function get(id) {
            return $http.get(serviceRoot + "Get/" + id);
        }

        function getByKey(id) {
            return $http.get(serviceRoot + "GetByKey/" + id);
        }

        function getByNode(id) {
            return $http.get(serviceRoot + "GetByNode/" + id);
        }

        function getByTargetNode(id) {
            return $http.get(serviceRoot + "GetByTargetNode/" + id);
        }

        function deleteSet(id) {
            return $http.delete(serviceRoot + "Delete/" + id);
        }

        function getSettings(id) {
            return $http.get(serviceRoot + "GetSettings/" + id);
        }

        function saveSettings(id, properties) {
            return $http.post(serviceRoot + "SaveSettings/" + id, properties);
        }

        function getCultures() {
            return $http.get(serviceRoot + "GetCultures");
        }

        function getInstalledCultures() {
            return $http.get(serviceRoot + "GetInstalledCultures");
        }

        function getContentInfo(id) {
            return $http.get(serviceRoot + "GetContentInfo/" + id);
        }

        function getForDictionary(id) {
            return $http.get(serviceRoot + "List");
        }

        function getNotifySettings(key) {
            return $http.get(serviceRoot + "GetNotifySettings/" + key);
        }

        function saveNotifySettings(settings) {
            return $http.post(serviceRoot + "SaveNotifySettings/", settings);
        }
    }

    angular.module('umbraco.services')
        .factory('translateSetService', setService);

})();