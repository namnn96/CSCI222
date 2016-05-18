(function () {
    'use strict';

    var app = angular
        .module('app.user', [])
        
    app.controller('UserController', UserController);
    app.controller('UserDetailController', UserDetailController);

    UserController.$inject = ['$q', 'userservice', 'logger', '$state', 'routerHelper'];
    /* @ngInject */
    function UserController($q, userservice, logger, $state, routerHelper) {
        var vm = this;
        var states = routerHelper.getStates();
        
        vm.users = [];
        vm.title = 'User';
        vm.usearch = function() {
        	var promises = [getUsers()];
            return $q.all(promises);
        }
        vm.viewUser = viewUser;
        
        activate();

        function activate() {
        	console.log(states);
        	
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
        
        function viewUser(id) {
        	$state.transitionTo('userDetail', {id: id});
        }
    }
    
    UserDetailController.$inject = ['$q', 'userservice', 'logger', '$state'];
    /* @ngInject */
    function UserDetailController($q, userservice, logger, $state, $stateParams) {
        var vm = this;
        vm.title = 'User detail';
        vm.back = back;
        
        activate();

        function activate() {
        	var promises = [findUser()];
            return $q.all(promises).then(function() {
                logger.info('Activated User Detail View');
            });
        }
        
        function findUser() {
            return userservice.findUser($state.params['id']).then(function (data) {
                vm.userDetail = data;
                return vm.userDetail;
            });
        }
        
        function back() {
        	$state.transitionTo('user');
        }
        
    }
})();
