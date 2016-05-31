(function () {
    'use strict';

    angular
        .module('app.admin')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['$q', '$scope', 'logger', 'userservice', 'dataservice', 'tagservice', '$rootScope', '$window', '$state', '$filter'];
    /* @ngInject */
    function AdminController($q, $scope, logger, userservice, dataservice, tagservice, $rootScope, $window, $state, $filter) {
        var vm = this;
        vm.title = 'Admin';

        vm.searchPendingUser = searchPendingUser;
        
		vm.showFlaggedUsers = showFlaggedUsers;
		vm.isShowingFlaggedUsers = true;
	
		vm.showReputationLevels = showReputationLevels;
		vm.isShowingReputationLevels = false;
		vm.updateReputation = updateReputation;
		
		vm.showAdmins = showAdmins;
		vm.isShowingReputationLevels = false;
		vm.demote = demote;
		
		vm.showReport = showReport;
		vm.isShowingReport = false;
		
		vm.showFeedbacks = showFeedbacks;
		vm.isShowingFeedbacks = false;
		
		vm.showNewTags = showNewTags;
		vm.isShowingNewTags = false;
	
		vm.viewUser = viewUser;
		vm.unflag = unflag;
		vm.ban = ban;
		
		vm.approve = approve;
		vm.reject = reject;
		
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
	    	
	    	var promises = [getPending(), getAdmins(), getFeedbacks(), getPendingTags()	];
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
	    
	    function getFeedbacks() {
			return dataservice.getFeedbacks().then(function (data) {
				vm.feedbacks = data;
				return vm.feedbacks;
			});
		}
	    
	    function searchPendingUser() {
        	var promises = [getPending()];
        	return $q.all(promises);
        }
	    
	    function searchPendingTag() {
        	var promises = [getPendingTags()];
        	return $q.all(promises);
        }
	    
	    function getPendingTags() {
	    	return tagservice.getPending(vm.pendingTagSearch).then(function(data) {
	    		vm.pendingTags = data;
	    		return vm.pendingTags;
	    	});
	    }
	    
		function showFlaggedUsers() {
            vm.isShowingFlaggedUsers = true;
			vm.isShowingReputationLevels = false;
			vm.isShowingAdmins = false;
			vm.isShowingReport = false;
			vm.isShowingFeedbacks = false;
			vm.isShowingNewTags = false;
        }
	
		function showReputationLevels() {
	        vm.isShowingFlaggedUsers = false;
			vm.isShowingReputationLevels = true;
			vm.isShowingAdmins = false;
			vm.isShowingReport = false;
			vm.isShowingFeedbacks = false;
			vm.isShowingNewTags = false;
	    }
		
		function showAdmins() {
			vm.isShowingFlaggedUsers = false;
			vm.isShowingReputationLevels = false;
			vm.isShowingAdmins = true;
			vm.isShowingReport = false;
			vm.isShowingFeedbacks = false;
			vm.isShowingNewTags = false;
		}
		
		function showReport() {
			vm.isShowingFlaggedUsers = false;
			vm.isShowingReputationLevels = false;
			vm.isShowingAdmins = false;
			vm.isShowingReport = true;
			vm.isShowingFeedbacks = false;
			vm.isShowingNewTags = false;
			
			return userservice.getReport().then(function (data) {
				vm.report = data;
				return vm.report;
			});
		}
		
		function showFeedbacks() {
			vm.isShowingFlaggedUsers = false;
			vm.isShowingReputationLevels = false;
			vm.isShowingAdmins = false;
			vm.isShowingReport = false;
			vm.isShowingFeedbacks = true;
			vm.isShowingNewTags = false;
		}
		
		function showNewTags() {
			vm.isShowingFlaggedUsers = false;
			vm.isShowingReputationLevels = false;
			vm.isShowingAdmins = false;
			vm.isShowingReport = false;
			vm.isShowingFeedbacks = false;
			vm.isShowingNewTags = true;
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
		
		function approve(tagToApprove) {
			tagToApprove.Pending = false;
			
			return tagservice.updateTag(tagToApprove).then(function (data) {
				logger.info("Approved tag " + tagToApprove.Tag);
				activate();
        	});
		}
		
		function reject(tagToReject) {
			return tagservice.deleteTag(tagToReject).then(function (data) {
				logger.warning("Reject tag " + tagToReject.Tag);
				activate();
        	});
		}
    }
})();
