(function () {
    'use strict';

    angular
        .module('app.admin')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['$q', '$scope', 'logger', 'userservice', 'dataservice', '$window', '$state', '$filter'];
    /* @ngInject */
    function AdminController($q, $scope, logger, userservice, dataservice, $window, $state, $filter) {
        var vm = this;
        vm.title = 'Admin';

		vm.showFlaggedUsers = showFlaggedUsers;
		vm.isShowingFlaggedUsers = true;
	
		vm.showReputationLevels = showReputationLevels;
		vm.isShowingReputationLevels = false;
		
		vm.showMakeAnswer = showMakeAnswer;
		vm.hideMakeAnswer = hideMakeAnswer;
		vm.isShowingMakeAnswer = false;
	
		vm.isAdmin = true;
		
		vm.viewUser = viewUser;
		vm.unflag = unflag;
		vm.successUnflag = false;
		
	    activate();
	
	    function activate() {
//	    	vm.loginUser = JSON.parse($window.sessionStorage.getItem(1));
	    	var promises = [getPending()];
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
	    
		function showFlaggedUsers() {
            vm.isShowingFlaggedUsers = true;
			vm.isShowingReputationLevels = false;
        }
	
		function showReputationLevels() {
	            vm.isShowingFlaggedUsers = false;
			vm.isShowingReputationLevels = true;	
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
		
		function unflag(id) {
			vm.unflagUser = $filter("filter")(vm.pendingUsers, {id: id})[0];
			vm.unflagUser.pending = false;
			
			return dataservice.submitEdit(vm.unflagUser).then(function (data) {
				activate();
        	});
		}
    }
})();
