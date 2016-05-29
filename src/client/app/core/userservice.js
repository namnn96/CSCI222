(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('userservice', userservice);

    userservice.$inject = ['$http', '$q', 'exception', 'logger', 'config'];
    /* @ngInject */
    function userservice($http, $q, exception, logger, config) {
        var service = {
            getUsers: getUsers,
            findUser: findUser,
            getPending: getPending,
            getAdmins: getAdmins,
            updateUser: updateUser
        };

        return service;

        function getUsers(keyword, page, sortBy) {
            return $http.get(config.host + '/users?page=' + page + '&keyword=' + (keyword ? keyword : '') + "&sortBy=" + (sortBy ? sortBy : ''))
                .then(success)
                .catch(fail);

            function success(response) {
                return response.data;
            }

            function fail(e) {
                return exception.catcher('XHR Failed for getUser')(e);
            }
        }
        
        function findUser(id) {
        	return $http.get(config.host + '/users/' + id)
                .then(success)
                .catch(fail);

            function success(response) {
                return response.data;
            }

            function fail(e) {
                return exception.catcher('XHR Failed for getUser')(e);
            }
        }
        
        function getPending(keyword) {
        	return $http.get(config.host + '/pending?keyword=' + (keyword ? keyword : ''))
            .then(success)
            .catch(fail);

	        function success(response) {
	            return response.data;
	        }
	
	        function fail(e) {
	            return exception.catcher('XHR Failed for getPending')(e);
	        }
        }
        
        function getAdmins(keyword) {
        	return $http.get(config.host + '/admins?keyword=' + (keyword ? keyword : ''))
            .then(success)
            .catch(fail);

	        function success(response) {
	            return response.data;
	        }
	
	        function fail(e) {
	            return exception.catcher('XHR Failed for getAdmins')(e);
	        }
        }
        
        function updateUser(obj) {
        	return $http.put(config.host + '/users/' + obj.id, obj)
            .then(success)
            .catch(fail);

	        function success(data, status, header, config) {
	            return data;
	        }
	
	        function fail(e) {
	            return exception.catcher('XHR Failed for updateUser')(e);
	        }
        }
    }
})();
