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
        vm.qsearch = qsearch; 
        vm.viewQuestion = viewQuestion;
        vm.qask = qask;
        vm.submitQuestion = submitQuestion;
        
        // Navigation
        vm.backToListing = backToListing;
        vm.listing = true;
        vm.asking = false;
        vm.askSuccessful;
        
        /***********Pagination**************/
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
        
        function qsearch() {
        	var promises = [getQuestions()];
        	return $q.all(promises);
        }
        
        function getQuestions() {
        	if (vm.asking) {
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
        
        function submitQuestion() {
        	if ($window.sessionStorage.getItem('login') == undefined) {
        		logger.error("Please log in to ask a question!");
        		return;
        	}
        	
        	if (vm.newquestion == undefined || vm.newquestion.Post.Body == "") {
        		logger.error("Cannot post an empty question!");
        		return;
        	}
        	
        	vm.newquestion.Post.Owner_id = JSON.parse($window.sessionStorage.getItem('login')).id;
        	vm.newquestion.Post.PostType = 1;
        	return questionservice.askQuestion(vm.newquestion).then(function (data) {
        		$window.sessionStorage.removeItem('questions');
        		vm.askSuccessful = true;
        		return data;
        	});
        }
        
        function backToListing() {
        	vm.listing = true;
        	vm.asking = false;
        	activate();
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
    
    
    /****************************************************************************************************/
    
    
    QuestionDetailController.$inject = ['$q', 'questionservice', 'commentservice', 'answerservice', 'postservice', 'voteservice', 'logger', '$state', '$window', '$rootScope'];
    /* @ngInject */
    function QuestionDetailController($q, questionservice, commentservice, answerservice, postservice, voteservice, logger, $state, $window, $rootScope) {
        var vm = this;
        vm.title = 'Question detail';
        
        // Navigation
        vm.back = back;
        vm.gotoUser = gotoUser;
        vm.backToNormal = backToNormal;
        vm.normalView = true;

        // Question related
        vm.editQuestion = editQuestion;
        vm.ownQuestion = false;
        vm.submitEdit = submitEdit;
        vm.editSuccessful = false;
        vm.deleteQuestion = deleteQuestion;
        
        // Comment related
        vm.postComment = postComment;
        vm.commentbox = [];
        vm.deleteComment = deleteComment;
        
        // Answer related
        vm.isAnswerBox = false;
        vm.successAnswer = false;
        vm.showAnswerBox = showAnswerBox;
        vm.postAnswer = postAnswer;
        vm.cancelAnswer = cancelAnswer;
        vm.deleteAnswer = deleteAnswer;
        vm.editAnswerBox = [];
        vm.normalAnswer = [];
        vm.editAnswer = editAnswer;
        
        // Voting
        vm.upvote = upvote;
        vm.downvote = downvote;
//        vm.upclick = [];
//        vm.downclick = [];
        
        activate();

        function activate() {
        	vm.editSuccessful = false;

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
        	
        	var promises = [findQuestion()];
        	return $q.all(promises).then(function() {
        		if (vm.loginUser.id == vm.question.Question.Post.Owner.id)
        			vm.ownQuestion = true;
        		logger.info('Activated Question View');
            });
        }
        
        /*******************************************************
		Question related
        *******************************************************/
        function findQuestion() {
            return questionservice.findQuestion($state.params['id']).then(function (data) {
                vm.question = data;
                return vm.question;
            });
        }        
        
        function editQuestion() {
        	if (!vm.ownQuestion) {
        		logger.error("You do not own this question");
        		return;
        	}
        	else {
        		vm.normalView = false;
        	}
        }
        
        function submitEdit() {
        	vm.question.Question.Post.Body = vm.editContent;
        	
        	return questionservice.editQuestion(vm.question.Question).then(function (data) {
        		vm.editSuccessful = true;
        		return data;
        	});
        	
        	console.log(vm.editContent);
        }
        
        function deleteQuestion(aQuestion) {
        	if (vm.loginUser.id != aQuestion.Post.Owner.id) {
        		logger.error("You do not own this question!");
        		return;
        	}
        	else {
	        	return postservice.deleteQuestion(aQuestion).then(function (data) {
	        		$window.sessionStorage.removeItem('questions');
	        		back();
	        		logger.info("Question deleted!");
	        		return data;
	        	});
        	}
        }
        
        /*******************************************************
		Navigation
        *******************************************************/
        function gotoUser(id) {
        	$window.sessionStorage.setItem('targetUserDetail', JSON.stringify(vm.question.Question.Post.Owner));
        	$state.transitionTo('userDetail', {id: id});
        }
        
        function back() {
        	$state.transitionTo('question');
        }
        
        function backToNormal() {
        	vm.normalView = true;
        }
        
        /*******************************************************
		Answer related
        *******************************************************/
        function showAnswerBox() {
        	vm.isAnswerBox = true;
        	vm.successAnswer = false; 
        }

        function postAnswer(questionId) {
        	if ($window.sessionStorage.getItem('login') == undefined) {
        		logger.error("Please log in to post an answer!");
        		return;
        	}
        	
        	if (vm.answerbox == undefined || vm.answerbox.Post.Body == "") {
        		logger.error("Cannot post an empty answer!");
        		return;
        	}
        	
        	vm.answerbox.Post.Owner_id = JSON.parse($window.sessionStorage.getItem('login')).id;
        	return answerservice.postAnswer(questionId, vm.answerbox).then(function (data) {
        		vm.answerbox.Post.Body = "";
        		vm.isAnswerBox = false;
            	vm.successAnswer = true;
            	$window.sessionStorage.removeItem('questions');
        		activate();
        		return data;
        	});
        }
        
        function cancelAnswer() {
        	vm.isAnswerBox = false;
        }
        
        function deleteAnswer(anAnswer) {
        	if (vm.loginUser.id != anAnswer.Answer.Post.Owner.id) {
        		logger.error("You do not own this answer!");
        		return;
        	}
        	else {
	        	return postservice.deleteAnswer(anAnswer).then(function (data) {
	        		activate();
	        		logger.info("Answer deleted!");
	        		return data;
	        	});
        	}
        }
        
        function editAnswer(postId) {
        	if (vm.isEditAnswer[postId] == undefined)
        		vm.isEditAnswer[postId] = true;
        }
        
        /*******************************************************
		Comment related
        *******************************************************/
        function postComment(parentId) {
        	if ($window.sessionStorage.getItem('login') == undefined) {
        		logger.error("Please log in to post a comment!");
        		return;
        	}
        	
        	if (vm.commentbox[parentId] == undefined || vm.commentbox[parentId].Post.Body == "") {
        		logger.error("Cannot post an empty comment!");
        		return;
        	}
        	
        	vm.commentbox[parentId].Post.Owner_id = JSON.parse($window.sessionStorage.getItem('login')).id;
        	return commentservice.postComment(parentId, vm.commentbox[parentId]).then(function (data) {
        		vm.commentbox[parentId].Post.Body = "";
        		activate();
        		return data;
        	});
        }
        
        function deleteComment(aComment) {
        	if (vm.loginUser.id != aComment.Post.Owner.id) {
        		logger.error("You do not own this comment!");
        		return;
        	}
        	else {
	        	return postservice.deleteComment(aComment).then(function (data) {
	        		activate();
	        		logger.info("Comment deleted!");
	        		return data;
	        	});
        	}
        }
        
        /*******************************************************
		Voting related
        *******************************************************/
        function upvote(votingPost) {
        	if ($window.sessionStorage.getItem('login') == undefined) {
        		logger.error("Please log in to vote!");
        		return;
        	}
        	
        	return voteservice.findVote(vm.loginUser.id, votingPost.Id).then(function (data) {
        		vm.currentVote = data;
        		
        		if (vm.currentVote == "No vote found") {
        			vm.newVote = {
        					"UserId": vm.loginUser.id,
        					"PostId": votingPost.Id,
        					"Value": 1
        			}

        			voteservice.addVote(vm.newVote).then(function (data) {
        				console.log(data);
        			});
        			
        			votingPost.Score = votingPost.Score + 1;
                	return postservice.updatePost(votingPost).then(function (data) {
                		$window.sessionStorage.removeItem('questions');
                		return data;
                	});
        		} else if (vm.currentVote.Value == -1){
        			vm.currentVote.Value = 1;
        			vm.currentVote.Post.Score += 2;
        			votingPost.Score += 2;
        			
        			return voteservice.updateVote(vm.currentVote).then(function (data) {
        				$window.sessionStorage.removeItem('questions');
                		return data;
        			});
        		}
        	});
        }

        function downvote(votingPost) {
        	if ($window.sessionStorage.getItem('login') == undefined) {
        		logger.error("Please log in to vote!");
        		return;
        	}
        	
        	return voteservice.findVote(vm.loginUser.id, votingPost.Id).then(function (data) {
        		vm.currentVote = data;
        		
        		if (vm.currentVote == "No vote found") {
        			vm.newVote = {
        					"UserId": vm.loginUser.id,
        					"PostId": votingPost.Id,
        					"Value": -1
        			}

        			voteservice.addVote(vm.newVote).then(function (data) {
        				console.log(data);
        			});
        			
        			votingPost.Score = votingPost.Score - 1;
                	return postservice.updatePost(votingPost).then(function (data) {
                		$window.sessionStorage.removeItem('questions');
                		return data;
                	});
        		} else if (vm.currentVote.Value == 1){
        			vm.currentVote.Value = -1;
        			vm.currentVote.Post.Score -= 2;
        			votingPost.Score -= 2;
        			
        			return voteservice.updateVote(vm.currentVote).then(function (data) {
        				$window.sessionStorage.removeItem('questions');
                		return data;
        			});
        		}
        	});
        }
    }
})();
