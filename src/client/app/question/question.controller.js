(function () {
    'use strict';

    var app = angular
        .module('app.question', ['ngSanitize']);
        
    app.controller('QuestionController', QuestionController);
    app.controller('QuestionDetailController', QuestionDetailController);

    QuestionController.$inject = ['$q', 'questionservice', 'logger', '$state', '$window'];
    /* @ngInject */
    function QuestionController($q, questionservice, logger, $state, $window) {
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
        
        activate();

        function activate() {
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
        	
            return questionservice.getQuestions(vm.qtitle).then(function (data) {
                vm.questions = data;
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
        	if ($window.sessionStorage.length == 0) {
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
    }
    
    QuestionDetailController.$inject = ['$q', 'questionservice', 'logger', '$state', '$window'];
    /* @ngInject */
    function QuestionDetailController($q, questionservice, logger, $state, $window) {
        var vm = this;
        vm.title = 'Question detail';
        vm.back = back;
        vm.gotoUser = gotoUser;
        
        activate();

        function activate() {
        	var promises = [findQuestion()];
        	return $q.all(promises).then(function() {
        		//console.log($state);
        		logger.info('Activated Question View');
            });
        }
        
        function findQuestion() {
            return questionservice.findQuestion($state.params['id']).then(function (data) {
                vm.question = data;
                
               // vm.question.Post.Body = vm.question.Post.Body ? String(vm.question.Post.Body).replace(/<[^>]+>/gm, '') : '';
                return vm.question;
            });
        }        
        
        function gotoUser(id) {
        	$window.sessionStorage.setItem('targetUserDetail', JSON.stringify(vm.question.Post.Owner));
        	$state.transitionTo('userDetail', {id: id});
        }
        
        function back() {
        	$state.transitionTo('question');
        }
    }
})();
