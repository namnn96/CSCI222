(function () {
    'use strict';

    var app = angular
        .module('app.user', [])
        
    app.controller('UserController', UserController);
    app.controller('UserDetailController', UserDetailController);

    UserController.$inject = ['$q', 'userservice', 'logger', '$rootScope', '$state', 'routerHelper', '$filter', '$window'];
    /* @ngInject */
    function UserController($q, userservice, logger, $rootScope, $state, routerHelper, $filter, $window) {
        var vm = this;
        var states = routerHelper.getStates();
        
        vm.users = [];
        vm.title = 'User';
        vm.usearch = function() {
        	var promises = [getUsers()];
            return $q.all(promises);
        }
        vm.viewUser = viewUser;
        
        /*************************************
        Sorting
        *************************************/
        vm.sortBy = "reputation";
        vm.resort = resort;
        
        
        /************************************/
//        vm.order = function(predicate) {
//            vm.predicate = predicate;
//            vm.reverse = (vm.predicate === predicate) ? !vm.reverse : false;
//            vm.users = $filter('orderBy')(vm.users, predicate, vm.reverse);
//          };
        /***********************************/
          
        /***********************************/
        vm.firstpage = true;
        vm.lastpage = false;
        vm.next = next;
        vm.last = last;
        /***********************************/
          
        activate();

        function activate() {
        	if ($window.sessionStorage.getItem('login')) {
            	vm.loginUser = JSON.parse($window.sessionStorage.getItem('login'));
            	if (vm.loginUser.type == 0)
                	vm.userType = "General user";
            	else if (vm.loginUser.type == 1)
            		vm.userType = "General admin";
        		else 
        			vm.userType = "System admin";
            	
            	$rootScope.userType = vm.userType;
                $rootScope.loginUser = JSON.parse($window.sessionStorage.getItem('login'));
         		$rootScope.$broadcast("SuccessLogin");
        	}
        	else 
        		$state.get("admin").settings.nav = 3;
        	
        	if ($window.sessionStorage.getItem('usersPage'))
        		vm.page = JSON.parse($window.sessionStorage.getItem('usersPage'));
        	else
        		vm.page = 1;
        	
        	vm.firstpage = (vm.page == 1 || vm.page == undefined) ? true : false;
        	
        	if ($window.sessionStorage.getItem('usersSort'))
        		vm.sortBy = JSON.parse($window.sessionStorage.getItem('usersSort'));
        	
        	if ($window.sessionStorage.getItem('uname'))
        		vm.uname = JSON.parse($window.sessionStorage.getItem('uname'));
//        	if ($window.sessionStorage.getItem('users')) {
//            	vm.users = JSON.parse($window.sessionStorage.getItem('users'));
//            	vm.order('name', true);
//            	return logger.info('Activated User View');
//        	}
        	
        	var promises = [getUsers()];
            return $q.all(promises).then(function() {
//            	vm.order('name', true);
                logger.info('Activated User View');
            });
        }
        
        function getUsers() {
            return userservice.getUsers(vm.uname, vm.page, vm.sortBy).then(function (data) {
                vm.users = data;
                
                $window.sessionStorage.setItem('usersPage', JSON.stringify(vm.page));
                $window.sessionStorage.setItem('usersSort', JSON.stringify(vm.sortBy));
                if (vm.uname) {
                	$window.sessionStorage.setItem('uname', JSON.stringify(vm.uname));
                }
//                $window.sessionStorage.setItem('users', JSON.stringify(vm.users));
                return vm.users;
            });
        }
        
        function viewUser(id) {
        	$state.transitionTo('userDetail', {id: id});
        }
        
        function resort() {
        	return getUsers();
        }
        
        function next() {
        	vm.page++;
        	vm.firstpage = vm.page == 1 ? true : false;
        	return getUsers();
        }
        
        function last() {
        	vm.page--;
        	vm.firstpage = vm.page == 1 ? true : false;
        	return getUsers();
        }
    }
    
    UserDetailController.$inject = ['$q', 'userservice', 'logger', '$window', '$rootScope', '$state'];
    /* @ngInject */
    function UserDetailController($q, userservice, logger, $window, $rootScope, $state, $stateParams) {
        var vm = this;
        vm.title = 'User detail';
        
        // User related
        vm.flagUser = flagUser;
        vm.promote = promote;
        
        // Navigation
        vm.back = back;
        
        activate();

        function activate() {
        	if ($window.sessionStorage.getItem('login')) {
            	vm.loginUser = JSON.parse($window.sessionStorage.getItem('login'));
            	if (vm.loginUser.type == 0)
                	vm.userType = "General user";
            	else if (vm.loginUser.type == 1)
            		vm.userType = "General admin";
        		else 
        			vm.userType = "System admin";
            	
            	$rootScope.userType = vm.userType;
                $rootScope.loginUser = JSON.parse($window.sessionStorage.getItem('login'));
         		$rootScope.$broadcast("SuccessLogin");
        	}
        	else 
        		$state.get("admin").settings.nav = 3;
        	
        	var promises = [findUser()];
            return $q.all(promises).then(function() {
                logger.info('Activated User Detail View');
            });
        }
        
        function findUser() {
        	if (vm.userDetail = JSON.parse($window.sessionStorage.getItem('targetUserDetail'))) {
        		console.log($state);
        		$window.sessionStorage.removeItem('targetUserDetail');
        		return vm.userDetail;
        	}
        	
            return userservice.findUser($state.params['id']).then(function (data) {
                vm.userDetail = data;
                return vm.userDetail;
            });
        }
        
        function flagUser(userToFlag) {
        	if ($window.sessionStorage.getItem('login') == undefined) {
        		logger.error("Please log in to flag a user!");
        		return;
        	}
        	
        	if (userToFlag.pending) {
        		logger.error("User " + userToFlag.name + " has already been flagged!");
        		return;
        	}
        	
        	if (userToFlag.disabled) {
        		logger.error("User " + userToFlag.name + " has already been banned!");
        		return;
        	}
        	
        	userToFlag.pending = true;
        	return userservice.updateUser(userToFlag).then(function (data) {
        		logger.warning("You flagged user " + userToFlag.name);
                return data;
            });
        }
        
        function promote(userToPromote) {
        	userToPromote.type = 1;
        	
        	return userservice.updateUser(userToPromote).then(function (data) {
				logger.info("Promoted user " + userToPromote.name);
				activate();
        	});
        }
        
        // Navigation
        function back() {
        	$state.transitionTo('user');
        }
    }
})();
