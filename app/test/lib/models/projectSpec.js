define([
    'app-lib/models/Project',
    'project/index'
],
function(Project, project) {
    describe("testing saving and loading of project.", function () {
        it("tests that the project name does not already exist.", function(done) {
            project.project().name('Test');
            project.project().path('/tmp');
            project.project().save().then(function () {
                project.project(new Project());
                project.project().name('Test');
                project.project().path('/tmp');
                project.project().save().then(function (saved) {
                    expect(saved).toBeFalsy();
                    done();
                }).catch(function() {
                    done();
                });
            }).catch(function() {
                done();
            });
        });
    });

});