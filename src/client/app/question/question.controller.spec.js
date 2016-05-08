/* jshint -W117, -W030 */
describe('QuestionController', function() {
    var controller;
    var questions;

    beforeEach(function() {
        bard.appModule('app.question');
        bard.inject('$controller', '$log', '$q', '$rootScope', 'dataservice');
    });

    beforeEach(function () {
    	sinon.stub(dataservice, 'getQuestions').returns($q.when(questions));
        controller = $controller('QuestionController');
        $rootScope.$apply();
    });

    bard.verifyNoOutstandingHttpRequests();

    describe('Question controller', function() {
        it('should be created successfully', function () {
            expect(controller).to.be.defined;
        });

        describe('after activate', function() {
            it('should have title of Question', function() {
                expect(controller.title).to.equal('Question');
            });

            it('should have logged "Activated"', function() {
                expect($log.info.logs).to.match(/Activated/);
            });
        });
    });
});
