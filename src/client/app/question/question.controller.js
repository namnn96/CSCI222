(function () {
    'use strict';

    var app = angular
        .module('app.question', ['ngSanitize']);
        
    app.controller('QuestionController', QuestionController);
    app.controller('QuestionDetailController', QuestionDetailController);

    QuestionController.$inject = ['$q', 'questionservice', 'logger', '$state', '$window', '$rootScope'];
    /* @ngInject */
    function QuestionController($q, questionservice, logger, $state, $window, $rootScope) {
        var vm = this;
        
        vm.title = 'Question';
        
        // Listing questions
        vm.questions = [];
        vm.qsearch = function() {
        	var promises = [getQuestions()];
        	return $q.all(promises);
        }
        vm.viewQuestion = viewQuestion;
        vm.qask = qask;

        vm.submitQuestion = submitQuestion;
        vm.backToListing = backToListing;
        
        vm.listing = true;
        vm.asking = false;
        vm.askSuccessful;
        
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
            	if (vm.loginUser.type == 1)
                	vm.userType = "General user";
            	else if (vm.loginUser.type == 2)
            		vm.userType = "General admin";
        		else 
        			vm.userType = "System admin";
            	
            	$rootScope.userType = vm.userType;
                $rootScope.loginUser = JSON.parse($window.sessionStorage.getItem('login'));
         		$rootScope.$broadcast("SuccessLogin");
        	}
        	else 
        		$state.get("admin").settings.nav = 3;
        	
        	vm.page = 1;
        	if ($window.sessionStorage.getItem('questions')) {
            	vm.questions = JSON.parse($window.sessionStorage.getItem('questions'));
            	return logger.info('Activated Question View');
        	}
        	
        	var promises = [getQuestions()];
        	return $q.all(promises).then(function() {
        		logger.info('Activated Question View');
            });
        }
        
        function getQuestions() {
        	if (vm.asking == true) {
        		vm.asking = false;
        		vm.listing = true;
        	}
        	
            return questionservice.getQuestions(vm.qtitle, vm.page).then(function (data) {
                vm.questions = data;
                $window.sessionStorage.setItem('questions', JSON.stringify(vm.questions));
                return vm.questions;
            });
        }      
        
        function viewQuestion(id) {
        	$state.transitionTo('questionDetail', {id: id});
        }
        
        function qask() {
        	vm.listing = false;
        	vm.asking = true;
        	if (vm.askSuccessful == true) {
        		vm.newquestion = null;
        		vm.askSuccessful = false;
        	}
        }
        
        function backToListing() {
        	vm.listing = true;
        	vm.asking = false;
        }
        
        function submitQuestion() {
        	if ($window.sessionStorage.getItem('login') == undefined) {
        		logger.error("Please log in to ask a question!");
        		return;
        	}
        		
        	vm.newquestion.Post.Owner_id = JSON.parse($window.sessionStorage.getItem('login')).id;
        	vm.newquestion.Post.PostType = 1;
        	return questionservice.askQuestion(vm.newquestion).then(function (data) {
        		vm.askSuccessful = true;
        		return data;
        	});
        }
        
        function next() {
        	vm.page++;
        	vm.firstpage = vm.page == 1 ? true : false;
        	return getQuestions();
        }
        
        function last() {
        	vm.page--;
        	vm.firstpage = vm.page == 1 ? true : false;
        	return getQuestions();
        }
    }
    
    QuestionDetailController.$inject = ['$q', 'questionservice', 'commentservice', 'logger', '$state', '$window', '$rootScope'];
    /* @ngInject */
    function QuestionDetailController($q, questionservice, commentservice, logger, $state, $window, $rootScope) {
        var vm = this;
        vm.title = 'Question detail';
        vm.back = back;
        vm.gotoUser = gotoUser;
        vm.postComment = postComment;
        vm.commentbox = [];
        
        activate();

        function activate() {
        	if ($window.sessionStorage.getItem('login')) {
            	vm.loginUser = JSON.parse($window.sessionStorage.getItem('login'));
            	if (vm.loginUser.type == 1)
                	vm.userType = "General user";
            	else if (vm.loginUser.type == 2)
            		vm.userType = "General admin";
        		else 
        			vm.userType = "System admin";
            	
            	$rootScope.userType = vm.userType;
                $rootScope.loginUser = JSON.parse($window.sessionStorage.getItem('login'));
         		$rootScope.$broadcast("SuccessLogin");
        	}
        	else 
        		$state.get("admin").settings.nav = 3;
        	
        	var promises = [findQuestion()];
        	return $q.all(promises).then(function() {
        		//console.log($state);
        		logger.info('Activated Question View');
            });
        }
        
        function findQuestion() {
            return questionservice.findQuestion($state.params['id']).then(function (data) {
                vm.question = data;
                return vm.question;
            });
        }        
        
        function gotoUser(id) {
        	$window.sessionStorage.setItem('targetUserDetail', JSON.stringify(vm.question.Question.Post.Owner));
        	$state.transitionTo('userDetail', {id: id});
        }
        
        function back() {
        	$state.transitionTo('question');
        }
        
        function postComment(parentId) {
        	if ($window.sessionStorage.getItem('login') == undefined) {
        		logger.error("Please log in to post a comment!");
        		return;
        	}
        		
        	vm.commentbox[parentId].Post.Owner_id = JSON.parse($window.sessionStorage.getItem('login')).id;
        	
        	return commentservice.postComment(parentId, vm.commentbox[parentId]).then(function (data) {
        		vm.commentbox[parentId].Post.Body = "";
        		activate();
        		return data;
        	});
        }
    }
})();
