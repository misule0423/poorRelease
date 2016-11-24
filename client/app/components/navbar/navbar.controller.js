'use strict';

angular
  .module('app')

  .controller('NavbarCtrl', function ($window, $scope, $location,$state, $modal, Auth, looksAPI, scrapeAPI, $alert, Upload) {

    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    }];

    // 만약 아래의 isCollapsed를 false로 바꾼다면 로그인하기 전에 웹의 크기를 줄였을 때 navbar에서 collapse가 된 모습을 보여주지 않을 것이다. 
    $scope.isCollapsed = false;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.user = Auth.getCurrentUser();

    $scope.look = {};
    $scope.looks = [];

    $scope.selectButton=false;

    $scope.scrapePostForm = false;
    $scope.showScrapeDetails = false;
    $scope.gotScrapeResults = false;
    $scope.loading = false;

    $scope.picPreview = true;
    // $scope.uploadButton = false;

    $scope.uploadLookForm = true;
    $scope.uploadLookTitle = true;

    var alertSuccess = $alert({
      title: 'Saved ',
      content: 'New Look added',
      placement: 'top-right',
      container: '#alertContainer',
      type: 'success',
      duration: 8
    });

    var alertFail = $alert({
      title: 'Not Saved ',
      content: 'New Look failed to save',
      placement: 'top-right',
      container: '#alertContainer',
      type: 'warning',
      duration: 8
    });

    var myModal = $modal({
      scope: $scope,
      show: false
    });

    $scope.showModal = function() {
      myModal.$promise.then(myModal.show);
    }

    $scope.showScrapeForm = function() {
      $scope.uploadLookForm = false;
      $scope.scrapePostForm = true;
      $scope.uploadLookTitle = false;
      $scope.selectButton = false;
    }

    $scope.showUploadForm = function() {
      $scope.uploadLookForm = true;
      $scope.scrapePostForm = false;
      $scope.uploadLookTitle = false;
      $scope.selectButton = false;
    }

    // looksAPI.getAllLooks()
    //   .then(function(data) {
    //     console.log('looks found ');
    //     console.log(data);
    //     $scope.looks = data.data;
    //   })
    //   .catch(function(err) {
    //     console.log('failed to get looks ');
    //     console.log(err);
    //   });

    looksAPI.getAnsweredLooks()
      .then(function(data) {
        console.log('looks found ');
        console.log(data);
        $scope.looks = data.data;
      })
      .catch(function(err) {
        console.log('failed to get looks ');
        console.log(err);
      });


    // Watch for changes to URL, Scrape and Display the image
    $scope.$watch("look.link", function(newVal, oldVal) {
      if (newVal.length > 5) {
        $scope.loading = true;
        var link = {
          url: $scope.look.link
        }

        scrapeAPI.getScrapeDetails(link)
          .then(function(data) {
            console.log(data);
            $scope.showScrapeDetails = true;
            $scope.gotScrapeResults = true;
            $scope.uploadLookTitle = false;
            $scope.look.imgThumb = data.data.img;
            $scope.look.description = data.data.desc;
          })
          .catch(function(data) {
            console.log('failed to return from scrape');
            $scope.loading = false;
            $scope.look.link = '';
            $scope.gotScrapeResults = false;
          })
          .finally(function() {
            $scope.loading = false;
            $scope.uploadLookForm = false;
          });
      }
    });

    $scope.addScrapePost = function() {
      // Send post details to DB
      var look = {
        description: $scope.look.description,
        title: $scope.look.title,
        image: $scope.look.imgThumb,
        linkURL: $scope.look.link,
        email: $scope.user.email,
        name: $scope.user.name,
        _creator: $scope.user._id
      }
      looksAPI.createScrapeLook(look)
        .then(function(data) {
          console.log('posted from frontend success');
          console.log(data);
          alertSuccess.show();
          $scope.showScrapeDetails = false;
          $scope.gotScrapeResults = false;
          $scope.look.title = '';
          $scope.look.link = '';
          $scope.looks.splice(0, 0, data.data);
          // 아래는 스크래핑한 사진을 submit 버튼을 눌렀을때 메인에서 볼 수 없어서 main.html로 redirect시킨 것이다. 이를 사용하기 위해서 $window를 inject하였다.
          // 이를 askUploaded 페이지로 확장할 수 있다.
          // $window.location.href = '/main.html';

        })
        .catch(function() {
          console.log('failed to post from frontend');
          $scope.showScrapeDetails = false;
          alertFail.show();
        });
    }

    $scope.uploadPic = function(file) {
      
      Upload.upload({
        url: 'api/look/upload',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: {

          file: file,
          gender: $scope.look.gender,
          // hashtags: $scope.look.hashtags,
          size: $scope.look.size,
          color: $scope.look.color,
          description: $scope.look.description,
          
          email: $scope.user.email,
          name: $scope.user.name,
          gravatar: $scope.user.gravatar,

          _creator: $scope.user._id
        }
      }).then(function(resp) {

        console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        $scope.looks.splice(0, 0, resp.data);
        $scope.look.gender = '';
        // $scope.look.hashtags = '';
        $scope.look.size = '';
        $scope.look.color = '';
        $scope.look.location = '';
        $scope.look.description = '';
        $scope.picFile = '';
        $scope.picPreview = false;
        alertSuccess.show();

        // 아래는 스크래핑한 사진을 submit 버튼을 눌렀을때 메인에서 볼 수 없어서 main.html로 redirect시킨 것이다. 이를 사용하기 위해서 $window를 inject하였다.
        // 이를 askUploaded 페이지로 확장할 수 있다.
        $window.location.href = '/main.html';
      }, function(resp) {
        alertFail.show();
      }, function(evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
      });
    }

    // $scope.user = {};
    // $scope.errors = {};

    // $scope.login = function(form) {
    //   $scope.submitted = true;

    //   if (form.$valid) {
    //     Auth.login({
    //       email: $scope.user.email,
    //       password: $scope.user.password
    //     })
    //       .then(function() {
    //         // Logged in, redirect to home
    //         $state.go('main');
    //       })
    //       .catch(function(err) {
    //         $scope.errors.other = err.message;
    //       });
    //   }
    // };

    // $scope.loginOauth = function(provider) {
    //   $window.location.href = '/auth/' + provider;
    // };

    // $scope.errors = {};

    // $scope.reset = function(form) {
    //   $scope.submitted = true;
    //   if(form.$valid) {
    //     $http.post('http://localhost:9000/forgotpassword/?email=' + $scope.user.email)
    //     .then( function() {
    //       $scope.message = 'An email with your new password has been sent to your email address.';
    //     });
    //     // .catch( function() {
    //     //   form.password.$setValidity('mongoose', false);
    //     //   $scope.errors.other = 'Incorrect password';
    //     //   $scope.message = '';
    //     // });
    //   }
    // };
    
});


// 'use strict';

// angular.module('app')
//   .controller('NavbarCtrl', function ($scope, $location, Auth) {
//     $scope.menu = [{
//       'title': 'Home',
//       'link': '/'
//     }];

//     $scope.isCollapsed = true;
//     $scope.isLoggedIn = Auth.isLoggedIn;
//     $scope.isAdmin = Auth.isAdmin;
//     $scope.getCurrentUser = Auth.getCurrentUser;

//     $scope.logout = function() {
//       Auth.logout();
//       $location.path('/login');
//     };

//     $scope.isActive = function(route) {
//       return route === $location.path();
//     };
//   });