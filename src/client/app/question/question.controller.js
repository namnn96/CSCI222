(function () {
    'use strict';

    var app = angular
        .module('app.question', []);
        
    app.controller('QuestionController', QuestionController);
    app.controller('QuestionDetailController', QuestionDetailController);

    QuestionController.$inject = ['$q', 'questionservice', 'logger', '$state'];
    /* @ngInject */
    function QuestionController($q, questionservice, logger, $state) {
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
        
        activate();

        function activate() {
        	var promises = [getQuestions()];
        	return $q.all(promises).then(function() {
        		logger.info('Activated Question View');
            });
        }
        
        function getQuestions() {
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
        }
        
        function backToListing() {
        	vm.listing = true;
        	vm.asking = false;
        }
        
        function submitQuestion() {
        	vm.newquestion.Post.PostType = 1;
        	vm.newquestion.Post.Owner_id = 1;
        	return questionservice.askQuestion(vm.newquestion).then(function (data) {
        		return data;
        	});
        }
    }
    
    QuestionDetailController.$inject = ['$q', 'questionservice', 'logger', '$state'];
    /* @ngInject */
    function QuestionDetailController($q, questionservice, logger, $state) {
        var vm = this;
        vm.title = 'Question detail';
        vm.back = back;
        vm.gotoUser = gotoUser;
        
        activate();

        function activate() {
        	var promises = [findQuestion()];
        	return $q.all(promises).then(function() {
        		console.log($state);
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
        	$state.transitionTo('userDetail', {id: id});
        }
        
        function back() {
        	$state.transitionTo('question');
        }
    }
})();
