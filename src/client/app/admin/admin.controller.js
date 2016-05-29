(function () {
    'use strict';

    angular
        .module('app.admin')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['$q', '$scope', 'logger', 'userservice', 'dataservice', '$rootScope', '$window', '$state', '$filter'];
    /* @ngInject */
    function AdminController($q, $scope, logger, userservice, dataservice, $rootScope, $window, $state, $filter) {
        var vm = this;
        vm.title = 'Admin';

		vm.showFlaggedUsers = showFlaggedUsers;
		vm.isShowingFlaggedUsers = true;
	
		vm.showReputationLevels = showReputationLevels;
		vm.isShowingReputationLevels = false;
		vm.updateReputation = updateReputation;
		
		vm.showAdmins = showAdmins;
		vm.isShowingReputationLevels = false;
		vm.demote = demote;
		
		vm.showMakeAnswer = showMakeAnswer;
		vm.hideMakeAnswer = hideMakeAnswer;
		vm.isShowingMakeAnswer = false;
	
		vm.isAdmin = true;
		
		vm.viewUser = viewUser;
		vm.unflag = unflag;
		vm.ban = ban;
		
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
	    	
	    	if (!$window.sessionStorage.getItem('reputation')) {
        		dataservice.getReputation().then(function (data) {
        			vm.reputation = data;
        			$window.sessionStorage.setItem('reputation', JSON.stringify(vm.reputation));
        		}); 
        	}
        	else {
        		vm.reputation = JSON.parse($window.sessionStorage.getItem('reputation'));
        	}
	    	
	    	var promises = [getPending(), getAdmins()];
        	return $q.all(promises).then(function() {
        		logger.info('Activated Admin View');
            });
	    }
	
	    function getPending() {
	    	return userservice.getPending(vm.pendingSearch).then(function(data) {
	    		vm.pendingUsers = data;
	    		return vm.pendingUsers;
	    	});
	    }
	    
	    function getAdmins() {
	    	return userservice.getAdmins(vm.adminSearch).then(function (data) {
	    		vm.admins = data;
	    		return vm.admins;
	    	});
	    }
	    
		function showFlaggedUsers() {
            vm.isShowingFlaggedUsers = true;
			vm.isShowingReputationLevels = false;
			vm.isShowingAdmins = false;
        }
	
		function showReputationLevels() {
	        vm.isShowingFlaggedUsers = false;
			vm.isShowingReputationLevels = true;
			vm.isShowingAdmins = false;
	    }
		
		function showAdmins() {
			vm.isShowingFlaggedUsers = false;
			vm.isShowingReputationLevels = false;
			vm.isShowingAdmins = true;
		}
		
		function showMakeAnswer() {
			vm.isShowingMakeAnswer = true;
		}
		
		function hideMakeAnswer() {
			vm.isShowingMakeAnswer = false;
		}
		
		function viewUser(id) {
        	$state.transitionTo('userDetail', {id: id});
        }
		
		function unflag(userToUnflag) {
			userToUnflag.pending = false;
			
			return userservice.updateUser(userToUnflag).then(function (data) {
				logger.info("Unflagged user " + userToUnflag.name);
				activate();
        	});
		}
		
		function ban(userToBan) {
			userToBan.disabled = true;
			userToBan.pending = false;
			
			return userservice.updateUser(userToBan).then(function (data) {
				logger.warning("Banned user " + userToBan.name);
				activate();
        	});
		}
		
		function updateReputation() {
			return dataservice.updateReputation(vm.reputation).then(function (data) {
				logger.info("Reputation levels updated!");
				$window.sessionStorage.removeItem("reputation");
				activate();
        	});
		}
		
		function demote(adminToDemote) {
			adminToDemote.type = 0;
        	
        	return userservice.updateUser(adminToDemote).then(function (data) {
				logger.warning("Demoted admin " + adminToDemote.name);
				activate();
        	});
		}
    }
})();
