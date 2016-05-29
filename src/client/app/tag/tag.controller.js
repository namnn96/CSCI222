(function () {
    'use strict';

    angular
        .module('app.tag')
        .controller('TagController', TagController);

    TagController.$inject = ['$q', 'logger', 'tagservice', '$window', '$rootScope', '$state'];
    /* @ngInject */
    function TagController($q, logger, tagservice, $window, $rootScope, $state) {
        var vm = this;
        vm.title = 'Tag';

        vm.searchTag = searchTag;
        vm.findTag = findTag;
        
        /***********Pagination**************/
        vm.firstpage = true;
        vm.lastpage = false;
        vm.next = next;
        vm.last = last;
        /***********************************/
        
        /**************Add tag**************/
        vm.canAddTag = false;
        
        vm.addTag = addTag;
        vm.submitTag = submitTag;
        vm.listing = true;
        vm.addingTag = false;
        vm.addTagSuccessful;
        vm.backToListing = backToListing;
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
        	
        	if ($window.sessionStorage.getItem('tagsPage'))
        		vm.page = JSON.parse($window.sessionStorage.getItem('tagsPage'));
        	else
        		vm.page = 1;
        	
        	vm.firstpage = (vm.page == 1 || vm.page == undefined) ? true : false;
//        	if ($window.sessionStorage.getItem('tags')) {
//            	vm.tags = JSON.parse($window.sessionStorage.getItem('tags'));
//            	return logger.info('Activated Tag View');
//        	}
        	
        	var promises = [getTags()];
        	return $q.all(promises).then(function() {
        		if ($window.sessionStorage.getItem('reputation')) {
                	vm.reputation = JSON.parse($window.sessionStorage.getItem('reputation'));
                	if (vm.loginUser.reputation >= vm.reputation.canAddTag)
            			vm.canAddTag = true;
        		}
        		
        		logger.info('Activated Tag View');
            });
        }
        
        function searchTag() {
        	var promises = [getTags()];
        	return $q.all(promises);
        }
        
        function getTags() {
            return tagservice.getTags(vm.keyword, vm.page).then(function (data) {
            	vm.lastpage = (data.length < 30) ? true : false;
            	
                vm.tags = data;
                $window.sessionStorage.setItem('tagsPage', JSON.stringify(vm.page));
//                $window.sessionStorage.setItem('tags', JSON.stringify(vm.tags));
                
                return vm.tags;
            });
        }  
        
        function findTag(tag){
        	var tagObj = [{
        			"text": tag.substr(1, tag.length-2)
        	}];
        	
        	$window.sessionStorage.setItem('tags', JSON.stringify(tagObj));
        	$state.transitionTo('question');
        }
        
        function addTag() {
        	vm.listing = false;
        	vm.addingTag = true;
        	if (vm.addTagSuccessful == true) {
        		vm.newtag = null;
        		vm.addTagSuccessful = false;
        	}
        }
        
        function submitTag() {
        	if (vm.newtag == undefined || vm.newtag.Tag == "") {
        		logger.error("Cannot post an empty tag!");
        		return;
        	}
        	
    		vm.newtag.Tag = "<" + vm.newtag.Tag + ">";
        	return tagservice.addTag(vm.newtag).then(function (data) {
//        		$window.sessionStorage.removeItem('questions');
        		vm.addTagSuccessful = true;
        		return data;
        	});
        }
        
        function backToListing() {
        	vm.listing = true;
        	vm.addingTag = false;
        	activate();
        }
        
        function next() {
        	vm.page++;
        	vm.firstpage = vm.page == 1 ? true : false;
        	return getTags();
        }
        
        function last() {
        	vm.page--;
        	vm.firstpage = vm.page == 1 ? true : false;
        	return getTags();
        }
    }
})();
