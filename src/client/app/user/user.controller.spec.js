/* jshint -W117, -W030 */
describe('UserController', function() {
    var controller;
    var users;
    
    beforeEach(function() {
        bard.appModule('app.user');
        bard.inject('$controller', '$log', '$q', '$rootScope', 'dataservice');
    });

    beforeEach(function () {
    	sinon.stub(dataservice, 'getUsers').returns($q.when(users));
        controller = $controller('UserController');
        $rootScope.$apply();
    });

    bard.verifyNoOutstandingHttpRequests();

    describe('User controller', function() {
        it('should be created successfully', function () {
            expect(controller).to.be.defined;
        });

        describe('after activate', function() {
            it('should have title of User', function() {
                expect(controller.title).to.equal('User');
            });

            it('should have logged "Activated"', function() {
                expect($log.info.logs).to.match(/Activated/);
            });
        });
    });
});
