/* jshint -W117, -W030 */
describe('question routes', function () {
    describe('state', function () {
        var view = 'app/question/question.html';

        beforeEach(function() {
            module('app.question', bard.fakeToastr);
            bard.inject('$httpBackend', '$location', '$rootScope', '$state', '$templateCache');
        });

        beforeEach(function() {
            $templateCache.put(view, '');
        });

        it('should map state question to url /question ', function() {
            expect($state.href('question', {})).to.equal('/question');
        });

        it('should map /question route to question View template', function () {
            expect($state.get('question').templateUrl).to.equal(view);
        });

        it('of question should work with $state.go', function () {
            $state.go('question');
            $rootScope.$apply();
            expect($state.is('question'));
        });
    });
});
