(function () {
    'use strict';

    var app = angular
        .module('app.question', ['ngSanitize', 'ngTagsInput']);
        
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
        vm.searchByKeyword = true;
        
        // Toggling and sorting
        vm.searchOption = "keyword";
        vm.toggleSearch = toggleSearch;
        vm.sortBy = "latest";
        vm.resort = resort;
        
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
        	
        	if ($window.sessionStorage.getItem('page'))
        		vm.page = JSON.parse($window.sessionStorage.getItem('page'));
        	else
        		vm.page = 1;
        	
        	vm.firstpage = (vm.page == 1 || vm.page == undefined) ? true : false;
        	
        	if ($window.sessionStorage.getItem('questionsSort'))
        		vm.sortBy = JSON.parse($window.sessionStorage.getItem('questionsSort'));
        	
        	if ($window.sessionStorage.getItem('qtitle')) {
        		vm.qtitle = JSON.parse($window.sessionStorage.getItem('qtitle'));
        	} else if ($window.sessionStorage.getItem('tags')) {
        		vm.searchByKeyword = false;
        		vm.searchOption = "tag";
        		vm.tags = JSON.parse($window.sessionStorage.getItem('tags'));
        	}
        	
//        	if ($window.sessionStorage.getItem('questions')) {
//            	vm.questions = JSON.parse($window.sessionStorage.getItem('questions'));
//            	return logger.info('Activated Question View');
//        	}
        	
        	var promises = [getQuestions()];
        	return $q.all(promises).then(function() {
        		logger.info('Activated Question View');
            });
        }
        
        /*******************************************************
		Question related
        *******************************************************/
        function qsearch() {
        	var promises = [getQuestions()];
        	return $q.all(promises);
        }
        
        function getQuestions() {
        	if (vm.asking) {
        		vm.asking = false;
        		vm.listing = true;
        	}
        	
        	if (vm.searchOption == "tag") {
        		if (vm.tags[0] == undefined)
        			vm.tags = undefined;
            	vm.qtitle = undefined;
        	}
        	else if (vm.searchOption == "keyword") {
        		vm.tags = undefined;
        	}
        	
        	return questionservice.getQuestions(vm.tags, vm.qtitle, vm.page, vm.sortBy).then(function (data) {
        		vm.lastpage = (data.length < 30) ? true : false;
                vm.questions = data;
                
                $window.sessionStorage.setItem('page', JSON.stringify(vm.page));
                $window.sessionStorage.setItem('questionsSort', JSON.stringify(vm.sortBy));
                if (vm.searchOption == "tag" && vm.tags != undefined) {
                	$window.sessionStorage.setItem('tags', JSON.stringify(vm.tags));
                	$window.sessionStorage.removeItem('qtitle');
                } else if (vm.searchOption == "keyword" && vm.qtitle != undefined) {
                	$window.sessionStorage.setItem('qtitle', JSON.stringify(vm.qtitle));
                	$window.sessionStorage.removeItem('tags');
                } else {
                	$window.sessionStorage.removeItem('tags');
                	$window.sessionStorage.removeItem('qtitle');
                }
//                $window.sessionStorage.setItem('questions', JSON.stringify(vm.questions));
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
        	if (vm.tags) {
        		vm.newquestion.Tags = "";
            	for (var i = 0; i < vm.tags.length; i++) {
            		vm.newquestion.Tags = vm.newquestion.Tags + "<" + vm.tags[i].text + ">";
            	}
        	}
        	
        	return questionservice.askQuestion(vm.newquestion).then(function (data) {
//        		$window.sessionStorage.removeItem('questions');
        		vm.askSuccessful = true;
        		return data;
        	});
        }
        
        /*******************************************************
		Toggling and sorting related
        *******************************************************/
        function toggleSearch() {
        	vm.searchByKeyword = vm.searchByKeyword == true ? false : true;
        }
        
        function resort() {
        	return getQuestions();
        }
        
        /*******************************************************
		Navigation related
        *******************************************************/
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
        
        // Privileges
        vm.canEdit = false;
        vm.canDelete = false;
        vm.canFlag = false;
        
        // Navigation
        vm.back = back;
        vm.gotoUser = gotoUser;
        vm.backToNormal = backToNormal;
        vm.normalView = true;

        // Question related
        vm.editQuestion = editQuestion;
        vm.submitEdit = submitEdit;
        vm.editSuccessful = false;
        vm.deleteQuestion = deleteQuestion;
        vm.acceptAnswer = acceptAnswer;
        
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
        vm.editAnswer = editAnswer;
        vm.editingAnswer = false;
        vm.editAnswerSuccessful = false;
        vm.submitAnswerEdit = submitAnswerEdit;
        
        // Voting
        vm.upvote = upvote;
        vm.downvote = downvote;
        
        activate();

        function activate() {
        	vm.editSuccessful = false;
        	vm.editAnswerSuccessful = false;

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
        		if ($window.sessionStorage.getItem('reputation')) {
                	vm.reputation = JSON.parse($window.sessionStorage.getItem('reputation'));
                	if (vm.loginUser.reputation >= vm.reputation.canDelete)
            			vm.canDelete = true;
            		if (vm.loginUser.reputation >= vm.reputation.canEdit)
            			vm.canEdit = true;
            		if (vm.loginUser.reputation >= vm.reputation.canFlag)
            			vm.canFlag = true;
        		}
        		
        		logger.info('Activated Question View');
            });
        }
        
        /*******************************************************
		Question related
        *******************************************************/
        function findQuestion() {
            return questionservice.findQuestion($state.params['id']).then(function (data) {
                vm.question = data;
                
                if (vm.question.Question.Tags) {
	                vm.tags = vm.question.Question.Tags.split("><");
	                vm.tags[0] = vm.tags[0].substr(1);
	                vm.tags[vm.tags.length-1] = vm.tags[vm.tags.length-1].substr(0, vm.tags[vm.tags.length-1].length-1);
                }
                
	            return vm.question;
            });
        }        
        
        function editQuestion() {
    		vm.normalView = false;
    		vm.editingAnswer = false;
        }
        
        function submitEdit() {
        	if (vm.editContent)
        		vm.question.Question.Post.Body = vm.editContent;
        	if (vm.tags) {
        		vm.question.Question.Tags = "";
            	for (var i = 0; i < vm.tags.length; i++) {
            		vm.question.Question.Tags = vm.question.Question.Tags + "<" + vm.tags[i].text + ">";
            	}
        	}
        	
        	return questionservice.editQuestion(vm.question.Question).then(function (data) {
        		vm.editSuccessful = true;
        		return data;
        	});
        }
        
        function deleteQuestion(aQuestion) {
        	return postservice.deleteQuestion(aQuestion).then(function (data) {
//	        		$window.sessionStorage.removeItem('questions');
        		back();
        		logger.info("Question deleted!");
        		return data;
        	});
        }
        
        function acceptAnswer(anAnswer) {
        	vm.question.Question.AcceptedAnswer_id = anAnswer.Id;
        	
        	return questionservice.editQuestion(vm.question.Question).then(function (data) {
        		activate();
        		return data;
        	});
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
        	activate();
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
//            	$window.sessionStorage.removeItem('questions');
        		activate();
        		return data;
        	});
        }
        
        function cancelAnswer() {
        	vm.isAnswerBox = false;
        }
        
        function deleteAnswer(anAnswer) {
        	return postservice.deleteAnswer(anAnswer).then(function (data) {
        		activate();
        		logger.info("Answer deleted!");
        		return data;
        	});
        }
        
        function editAnswer(anAnswer) {
        	vm.normalView = false;
        	vm.editingAnswer = true;
        	vm.editBody = anAnswer.Post.Body;
        	vm.answerToEdit = anAnswer;
        }
        
        function submitAnswerEdit() {
        	if (vm.editAnswerContent) {
        		vm.answerToEdit.Post.Body = vm.editAnswerContent;

				return postservice.updatePost(vm.answerToEdit.Post).then(function (data) {
					vm.editAnswerSuccessful = true;
					return data;
				});
        	}
        	else {
        		vm.editAnswerSuccessful = true;
        		return;
        	}
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
        	return postservice.deleteComment(aComment).then(function (data) {
        		activate();
        		logger.info("Comment deleted!");
        		return data;
        	});
        }
        
        /*******************************************************
		Voting related
        *******************************************************/
        function upvote(votingPost) {
        	if ($window.sessionStorage.getItem('login') == undefined) {
        		logger.error("Please log in to vote!");
        		return;
        	}
        	
        	if (vm.loginUser.id == votingPost.Owner.id) {
        		logger.error("Cannot vote your post!");
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
//                		$window.sessionStorage.removeItem('questions');
                		return data;
                	});
        		} else if (vm.currentVote.Value == -1){
        			vm.currentVote.Value = 1;
        			vm.currentVote.Post.Score += 2;
        			votingPost.Score += 2;
        			
        			return voteservice.updateVote(vm.currentVote).then(function (data) {
//        				$window.sessionStorage.removeItem('questions');
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
        	
        	if (vm.loginUser.id == votingPost.Owner.id) {
        		logger.error("Cannot vote your post!");
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
//                		$window.sessionStorage.removeItem('questions');
                		return data;
                	});
        		} else if (vm.currentVote.Value == 1){
        			vm.currentVote.Value = -1;
        			vm.currentVote.Post.Score -= 2;
        			votingPost.Score -= 2;
        			
        			return voteservice.updateVote(vm.currentVote).then(function (data) {
//        				$window.sessionStorage.removeItem('questions');
                		return data;
        			});
        		}
        	});
        }
    }
})();
