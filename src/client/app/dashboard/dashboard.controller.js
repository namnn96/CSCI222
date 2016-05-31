	(function () {
    'use strict';

    angular
        .module('app.dashboard')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$q', 'dataservice', 'userservice', 'logger', '$state', '$filter', '$window', '$rootScope'];
    /* @ngInject */
    function DashboardController($q, dataservice, userservice, logger, $state, $filter, $window, $rootScope) {
        var vm = this;
        
        vm.today = new Date();
        vm.people = [];
        vm.title = 'Dashboard';
        
        // Handle login - signup - logout
        vm.login = login;
        vm.signup = signup;
        vm.logout = logout;
        
        // Function buttons
        vm.postFeedback = postFeedback;
        vm.showForm = showForm;
        vm.showEditForm = showEditForm;
        vm.submitEdit = submitEdit;
        vm.cancelEdit = cancelEdit;
        
        // Boolean for ng-if
        vm.showsignin = ($window.sessionStorage.getItem('login') == undefined) ? true : false;
        vm.showsignup = false;
        vm.showCurrentUser = ($window.sessionStorage.getItem('login') == undefined) ? false : true;
        vm.showEdit = false;
        
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
        	
            var promises = [getAdmins()];
            return $q.all(promises).then(function() {
                logger.info('Activated Dashboard View');
            });
        }

        function getAdmins() {
	    	return userservice.getAdmins(vm.adminSearch).then(function (data) {
	    		vm.admins = data;
	    		return vm.admins;
	    	});
	    }
        
        function login(email, password) {
        	return dataservice.login(email, password).then(function (data) {
        		if (!data) {
        			logger.error("Invalid email or password!");
        			return;
        		}
        		
        		vm.loginUser = data;
        		
        		if (vm.loginUser.disabled) {
        			logger.error("Your account has been banned!");
        			return;
        		}
        		
                if (vm.loginUser.type == 0)
                	vm.userType = "General user";
            	else if (vm.loginUser.type == 1)
            		vm.userType = "General admin";
        		else 
        			vm.userType = "System admin";
                
                $window.sessionStorage.setItem('login', JSON.stringify(vm.loginUser));
                if (!$window.sessionStorage.getItem('reputation')) {
            		dataservice.getReputation().then(function (data) {
            			console.log(data);
            			$window.sessionStorage.setItem('reputation', JSON.stringify(data));
            		}); 
            	}
                
                $rootScope.userType = vm.userType;
                $rootScope.loginUser = JSON.parse($window.sessionStorage.getItem('login'));
        		$rootScope.$broadcast("SuccessLogin");
        		
                vm.showsignin = false;
                vm.showCurrentUser = true;
            });
        }
        
        function signup() {
        	if (vm.newuser.email.indexOf("@") == -1) {
        		logger.error("Invalid email!")
        		return;
        	}
        	
        	return dataservice.signup(vm.newuser).then(function (data) {
        		vm.showsignin = true;
        		vm.showsignup = false;
        	});
        }
        
        function showForm() {
        	vm.showsignin = vm.showsignin == false ? true : false;
        	vm.showsignup = vm.showsignup == false ? true : false;
        }
        
        function logout() {
        	$window.sessionStorage.clear();
        	
        	$rootScope.userType = null;
        	$rootScope.loginUser = null;
        	$rootScope.$broadcast("SuccessLogout");
        	
        	vm.showCurrentUser = false;
        	vm.showsignin = true;
        }
        
        function showEditForm() {
        	vm.showEdit = true;
        }
        
        function cancelEdit() {
        	vm.showEdit = false;
        }
        
        function submitEdit() {
        	return userservice.updateUser(vm.loginUser).then(function (data) {
        		vm.showEdit = false;
        		
        		return data;
        	});
        }
        
        function postFeedback() {
        	if (vm.feedback.Body == undefined) {
        		logger.error("Cannot leave an empty feedback!");
        		return;
        	}
        	
        	return dataservice.postFeedback(vm.feedback).then(function (data) {
        		logger.info("Thank you for the feedback!")
        		vm.feedback = undefined;
        		return data;
        	});
        		
        }
    }
})();
