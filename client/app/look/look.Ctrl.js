(function() {
  'use strict';

  angular
    .module('app')
    .controller('LookCtrl', LookCtrl);

  LookCtrl.$inject = ['$scope', '$stateParams', 'looksAPI', 'commentAPI', 'Auth'];

  function LookCtrl($scope, $stateParams, looksAPI, commentAPI, Auth) {

    $scope.user = Auth.getCurrentUser();
    $scope.id = $stateParams.lookId;
    $scope.popLooks = [];

    

    looksAPI.findOneLook($scope.id)
      .then(function(data) {
        console.log(data);
        $scope.look = data.data;
        addView();
      })
      .catch(function(err) {
        console.log('failed to get look ', err);
      });

    looksAPI.popLooks($scope.id)
      .then(function(data) {
        console.log(data);
        $scope.popLooks = data.data;
      })
      .catch(function(err) {
        console.log('failed to get pop look ', err);
      });

    commentAPI.getComments($scope.id)
      .then(function(data) {
        console.log(data);
        $scope.comments = data.data;
      })
      .catch(function(err) {
        console.log('failed to get comments ' + err);
      });

    $scope.addVote = function(look) {
      looksAPI.upVoteLook(look)
        .then(function(data) {
          console.log(data);
          look.upVotes++;
        })
        .catch(function(err) {
          console.log('failed adding upvote ');
        });
    }

    $scope.postComment = function() {
      var comment = {
        authorId: $scope.user._id,
        authorName: $scope.user.name,
        authorEmail: $scope.user.email,
        gravatar: $scope.user.gravatar,
        comment: $scope.comment.body,
        lookId: $scope.id
      }
      commentAPI.addComment(comment)
        .then(function(data) {
          console.log(data);
          $scope.comment.body = '';
          $scope.comments.splice(0, 0, data.data);
        })
        .catch(function(err) {
          console.log('failed to post comment ' + err);
        })
    }

    function addView() {
      looksAPI.addView($scope.id)
        .then(function(res) {
          console.log('view added to Look');
          console.log(res);
        })
        .catch(function(err) {
          console.log('failed to increment ', err);
        });
    }

    var IMP = window.IMP; // 생략가능
    IMP.init('imp52848676'); // 'iamport' 대신 부여받은 "가맹점 식별코드"를 사용




    $scope.request_pay = function() {

      var payInfo = {
        payInfo_id: $scope.user._id,
        payInfo_email: $scope.user.email,
        payInfo_userName: $scope.user.name,
        payInfo_ansPrice: $scope.look.ansPrice
      }

            // alert(payInfo.payInfoAnsPrice);



       IMP.request_pay({
        pg : 'danal_tpay', // version 1.1.0부터 지원.
        pay_method : 'card',
        merchant_uid : 'merchant_' + new Date().getTime(),
        name : '주문명:결제테스트',
        amount : payInfo.payInfo_ansPrice,
        buyer_email : 'iamport@siot.do',
        buyer_name : '구매자이름',
        buyer_tel : '010-1234-5678',
        buyer_addr : '서울특별시 강남구 삼성동',
        buyer_postcode : '123-456',
        m_redirect_url : 'https://127.0.0.1/payments/complete'
        }, function(rsp) {
            if ( rsp.success ) {
                var msg = '결제가 완료되었습니다.';
                msg += '고유ID : ' + rsp.imp_uid;
                msg += '상점 거래ID : ' + rsp.merchant_uid;
                msg += '결제 금액 : ' + rsp.paid_amount;
                msg += '카드 승인번호 : ' + rsp.apply_num;
            } else {
                var msg = '결제에 실패하였습니다.';
                msg += '에러내용 : ' + rsp.error_msg;
            }
            alert(msg);
        });

    };


   




  }
})();