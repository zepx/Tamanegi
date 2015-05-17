var app = angular.module('studentViewApp', ['ui.router', 'uiRouterStyles']);

app.config(function($stateProvider, $urlRouterProvider, $httpProvider){
   
   var checkLoggedin = function($q, $timeout, $http, $location, $rootScope, $window) { 
      // Initialize a new promise 
      var deferred = $q.defer(); 

      // Make an AJAX call to check if the user is logged in 
      $http.get('/loggedin').success(function(user){ // Authenticated 
         if (user.status !== false ) 
            deferred.resolve(user, $location); 
         // Not Authenticated 
         else { 
            $rootScope.message = 'You need to log in.'; 
            deferred.reject(); 
            //Just hacking for now
            $window.location = 'http://localhost:3000/index.html#/login'
            
         } 
      }); 
      return deferred.promise; 
   };  
   
  $httpProvider.interceptors.push(function($q, $location) { 
       return { 
          response: function(response) { 
             return response;
          }, 
          responseError: function(response) { 
             if (response.status === 401) 
                $location.path('/login'); 
             return $q.reject(response); 
          } 
       }; 
    });

  // For any unmatched url, send to /route1
  //$urlRouterProvider.otherwise("/teacherhome/dashboard")
  $urlRouterProvider.otherwise("/studenthome")
  //$urlRouterProvider.otherwise("/dohomework")

  $stateProvider
//    .state('dohomework'), {
//        url: "/dohomework",
//        templateUrl: "route1.html"
//    }
    .state('login', {
        url: "/login",
        templateUrl: "views/login.html",
        controller: "LoginCtrl",
        data: {
         css: 'http://getbootstrap.com/examples/signin/signin.css'
        }
    })
    .state('usertype', {
         url: "/redirect",
         controller: "RedirectCtrl"
    })
    .state('teacherhome', {
        url: "/teacherhome",
        templateUrl: "views/homeTeacher.html",
        controller: "TeacherViewController"
    })
    .state('teacherhome.dashboard', {
        url: "/dashboard",
        templateUrl: "views/teacherDashboard.html",
        controller: "TeacherViewController",
        resolve: {
           loggedin: checkLoggedin
        }
    })
  
    .state('createhomework', {
        url: "/createhomework",
        templateUrl: "views/teacherCreateHomeWork.html",
        controller: "CreateHomeworkViewController"
    })
    .state('createhomework.questionnumber', {
        url: "/questionnumber/:questionId",
        templateUrl: "views/teacherQuestionEdit.html",
        controller: "CreateHomeworkViewByIdController"
    })
    .state('createhomework.addnewquestion', {
        url: "/createhomework/addnewquestion",
        templateUrl: "views/teacherCreateHomeWork.html",
        controller: "CreateHomeworkViewController"
    })
  
    .state('checkhomework', {
        url: "/checkhomework",
        templateUrl: "views/teacherCheckHomework.html",
        controller: "QuestionCheckIdController"
    })
    .state('checkhomework.questionnumber', {
        url: "/questionnumber/:questionId",
        templateUrl: "views/teacherCheckHomeworkDetail.html",
        controller: "QuestionCheckIdController"
    })
  
  // Student View Call here
    .state('studenthome', {
        url: "/studenthome",
        templateUrl: "views/home.html"
    })
    .state('studenthome.studentDate', {
          url: "/studentDate",
          templateUrl: "views/studentViewSortedByDate.html",
          controller: 'StudentViewController'
      })
    .state('studenthome.studentSubject', {
          url: "/studentSubject",
          templateUrl: "views/studentViewBySubject.html",
          controller: 'StudentViewController'
      })  
    .state('dohomework', {
        url: "/dohomework",
        templateUrl: "views/dohomework.html",
        controller: 'questionViewController'
    })
    .state('dohomework.questionId', {
        url: "/questionId/:itemId",
        templateUrl: "views/questionIdView.html",
        controller: 'questionWithIDViewController'
    })
//    .state('dohomework.questionId.show', {
//        url: "/questionId/:itemId/:partyLocation",
//        templateUrl: "route1.html",
//    })

});

/**********************************************************************
 * Login controller
 **********************************************************************/
app.controller('LoginCtrl', function($scope, $rootScope, $http, $location) {
  // This object will be filled by the form
  $scope.user = {};

  // Register the login() function
  $scope.login = function(){
    $http.post('/login', {
      username: $scope.user.username,
      password: $scope.user.password,
    })
    .success(function(user){
      // No error: authentication OK
      $rootScope.message = 'Authentication successful!';
      $location.url('/admin');
    })
    .error(function(){
      // Error: authentication failed
      $rootScope.message = 'Authentication failed.';
      $location.url('/login');
    });
  };
});
   
app.controller('QuestionCheckIdController', ['$scope', '$stateParams', '$http' ,function($scope, $stateParams, $http) {
  $scope.questionObject = {question_id: 1, title: 'Homework A', question_text: 'What is it?'};
  $http.get("/homeworks?teacher=me").success(function(data) {
     $scope.questions = data;
     console.log(data);
     
     if ($stateParams.questionId){
       $scope.qID = parseInt($stateParams.questionId) - 1 
       console.log($scope.qID);
       $scope.questionObject = $scope.questions[$scope.qID];
     }
     
     if ($scope.questions) {
        $http.get("db/answers.json").success(function(data) {
        $scope.answers = data;

        console.log(data);
     });
     }
  });
  
  
  
}]);

app.controller('CreateHomeworkViewByIdController', ['$scope', '$stateParams', function($scope, $stateParams) {
  $scope.showSetting = false
  $scope.questions = [
      {question_id: 1, title: 'Homework A', question_text: ''},
  ];
    $scope.fuckyou = $scope.questionText
  $scope.questionText =  $scope.questions[$stateParams.questionId].question_text
  $scope.qID = parseInt($stateParams.questionId) + 1
  $scope.newQuestion = function() {
    $scope.questions.push({
        question_id: 5, title: 'Homework A', question_text: ''
    });
  };
      
//    $scope.$watch(function($scope) {
//      return $scope.questions.
//          map(function(obj) {
//            return obj.question_text
//          });
//}, function (newVal) {
////        $scope.count++;
////        $scope.msg = 'person name was changed'+ $scope.count;
//    }, true);
    
    $scope.messageChanged = function() {
        $scope.fuckyou = $scope.questionText
        $scope.questions[$stateParams.questionId].question_text = $scope.questionText
        $scope.$apply();
        console.log($scope.questions[$stateParams.questionId].question_text);
    }
    
  //console.log($stateParams.qid);

}]);

app.controller('CreateHomeworkViewController', ['$scope', function($scope,  $state, $stateParams) {
  $scope.questions = [
      {question_id: 1, title: 'Homework A', question_text: 'What is it?'},
      {question_id: 2, title: 'Homework A', question_text: 'What is that?'},
      {question_id: 3, title: 'Homework A', question_text: 'What there?'},
      {question_id: 4, title: 'Homework A', question_text: 'What those?'},
  ];
    
  $scope.questionText = 'Oh Yeahhhhhhh!!!'

//  $scope.newQuestion = function() {
//    $scope.questions.push({
//        question_id: 5, title: 'Homework A', question_text: $scope.questionText
//    });
//  };

  $scope.textChange = function() {
    
  }
    
  //console.log($stateParams.qid);

}]);


app.controller('TeacherViewController', ['$scope','$http', function($scope,$http) {
  $http.get('tests?teacher=me').success(function(data) {
     $scope.homeworks = data;
  });
    
  $scope.subjects = [
      {
        title: 'Math', 
        homeworks: [
          {
            question_id: 123, title: 'Homework A',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework B',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework C',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          }
        ]
      },
    {
        title: 'Chem', 
        homeworks: [
          {
            question_id: 123, title: 'Homework D',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework E',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework F',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          }
        ]
      },
    {
        title: 'Phys', 
        homeworks: [
          {
            question_id: 123, title: 'Homework G',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework H',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework I',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          }
        ]
      }
  ]
  
}]);

app.controller('AnswerSubmitController', ['$scope', function($scope) {
  //$scope.list = [];
  $scope.answertext = 'hello';
  $scope.submit = function() {
      //$scope.list.push(this.text);
      //$scope.text = '';
        $scope.motherChecker = $scope.answertext
        $scope.answerSubmited = true
        console.log($scope.motherChecker)
    
  };
  $scope.motherChecker = 'This is mother checker';
  $scope.showAnswer = false;
    
  $scope.toggle = function() {
    //  $scope.answerSubmited = $scope.answerSubmited
    $scope.showAnswer = true;//!$scope.showAnswer
    //$scope.answertext = $scope.motherChecker
  };
    
  $scope.answerSubmited = false;
  $scope.closeAnswerPopUp = function() {
    $scope.answerSubmited = false;
  }
    
}]);

app.controller('questionWithIDViewController', ['$scope', '$stateParams', function($scope, $stateParams) {
//  
//  console.log($stateParams.itemId);

  $scope.currentquestion = {
    question_id : $stateParams.itemId,
    question_order: $stateParams.itemId,
    question_text: 'Is Pipat Super Gayyyyyyyyyyyy ?'
    };
  
}]);

app.controller('questionViewController', ['$scope', function($scope,  $state, $stateParams) {
  $scope.questions = [
      {question_id: 1, title: 'Homework A', question_text: 'What is it?'},
      {question_id: 2, title: 'Homework A', question_text: 'What is that?'},
      {question_id: 3, title: 'Homework A', question_text: 'What there?'},
      {question_id: 4, title: 'Homework A', question_text: 'What those?'},
  ];
  //console.log($stateParams.qid);

}]);

app.controller('StudentViewController', ['$scope','$http', function($scope, $http) {
  $http.get("tests?user=me").success(function(data) {
     $scope.homeworks = data;
     console.log(data);
  });
    
  $scope.subjects = [
      {
        title: 'Math', 
        homeworks: [
          {
            question_id: 123, title: 'Homework A',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework B',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework C',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          }
        ]
      },
    {
        title: 'Chem', 
        homeworks: [
          {
            question_id: 123, title: 'Homework D',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework E',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework F',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          }
        ]
      },
    {
        title: 'Phys', 
        homeworks: [
          {
            question_id: 123, title: 'Homework G',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework H',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          },
        {
            question_id: 123, title: 'Homework I',
            description: 'Pipat is Gay',
            image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTiAcispLDx41n8BbRDZUntJJwZ9kqOWYHaZgkSu5KL1Zp-U9cPbQ'
          }
        ]
      }
  ]
  
}]);

