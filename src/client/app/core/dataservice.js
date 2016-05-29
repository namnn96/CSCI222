(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('dataservice', dataservice);

    dataservice.$inject = ['$http', '$q', 'exception', 'logger', 'config'];
    /* @ngInject */
    function dataservice($http, $q, exception, logger, config) {
        var service = {
            getPeople: getPeople,
            login: login,
            signup: signup,
            getReputation: getReputation,
            updateReputation: updateReputation
        };

        return service;

        function getPeople() {
            return $http.get('/api/people')
                .then(success)
                .catch(fail);

            function success(response) {
                return response.data;
            }

            function fail(e) {
                return exception.catcher('XHR Failed for getPeople')(e);
            }
        }
        
        function login(email, password) {
        	return $http.get(config.host + '/login?email=' + email + '&password=' + password)
                .then(success)
                .catch(fail);

            function success(response) {
                return response.data;
            }

            function fail(e) {
            	return null;
//                return exception.catcher('XHR Failed for login')(e);
            }
        }
        
        function signup(obj) {
        	return $http.post(config.host + '/users', obj)
                .then(success)
                .catch(fail);

            function success(data, status, header, config) {
                return data;
            }

            function fail(e) {
            	logger.error("There is an existing account with this email!");
            	return;
                //return exception.catcher('XHR Failed for signup')(e);
            }
        }
        
        function getReputation() {
        	return $http.get(config.host + '/reputation')
                .then(success)
                .catch(fail);

            function success(response) {
                return response.data;
            }

            function fail(e) {
                return exception.catcher('XHR Failed for getReputation')(e);
            }
        }
        
        function updateReputation(obj) {
        	console.log(obj);
        	
        	return $http.put(config.host + '/reputation/' + obj.Id, obj)
                .then(success)
                .catch(fail);

            function success(data, status, header, config) {
                return data;
            }

            function fail(e) {
                return exception.catcher('XHR Failed for updateReputation')(e);
            }
        }
    }
})();
