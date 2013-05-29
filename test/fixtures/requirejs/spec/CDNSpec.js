
describe('Check that the use of CDN and paths works', function(){
  var paths = require('paths');

  it('Should be fetching jQuery from the CDN', function(){
    expect(paths).toEqual("dependency as a path");
  })
});