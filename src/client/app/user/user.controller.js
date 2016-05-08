(function () {
    'use strict';

    angular
        .module('app.user')
        .controller('UserController', UserController);

    UserController.$inject = ['$q', 'userservice', 'logger'];
    /* @ngInject */
    function UserController($q, userservice, logger) {
        var vm = this;
        vm.users = [];
        vm.title = 'User';
        vm.usearch = function() {
        	var promises = [getUsers()];
            return $q.all(promises);
        }
        vm.viewuser = function(name) {
        	var promises = [viewUser(name)];
            return $q.all(promises);
        }
        
        activate();

        function activate() {
        	var promises = [getUsers()];
            return $q.all(promises).then(function() {
                logger.info('Activated User View');
            });
        }
        
        function getUsers() {
            return userservice.getUsers(vm.uname).then(function (data) {
                vm.users = data;
                return vm.users;
            });
        }
        
        function viewUser(name) {
            return userservice.getUsers(name).then(function (data) {
                vm.oneuser = data;
                return vm.oneuser;
            });
        }
    }
})();
