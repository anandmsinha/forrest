(function() {
  var app;

  app = angular.module('mainForrestApp', ['ngRoute', 'angular-loading-bar', 'mentio']);

  app.directive('urlText', function() {
    var output;
    output = {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, elem, attrs, controller) {
        return controller.$parsers.unshift(function(value) {
          var regexExpression;
          regexExpression = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?");
          controller.$setValidity('urlAndText', regexExpression.test(value));
          return value;
        });
      }
    };
    return output;
  });

  app.directive('collapse', function() {
    var output;
    return output = {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var collapse, expand;
        collapse = function() {
          element.removeClass('in');
          return element.css({
            height: 0
          });
        };
        expand = function() {
          element.addClass('in');
          return element.css({
            height: 'auto'
          });
        };
        return scope.$watch(attrs.collapse, function(shouldCollapse) {
          if (shouldCollapse) {
            return collapse();
          } else {
            return expand();
          }
        });
      }
    };
  });

  app.filter('dateandtime', function() {
    return function(input) {
      return (new Date(input)).toLocaleString();
    };
  });

  app.filter('reverse', function() {
    return function(input) {
      if (!angular.isArray(input)) {
        return false;
      }
      return input.slice().reverse();
    };
  });

  app.filter('removehash', function() {
    return function(input) {
      var regexp;
      if (input && input.length > 0) {
        regexp = new RegExp('#([^\\s]*)', 'g');
        return input.replace(regexp, '');
      }
      return '';
    };
  });

  app.factory('$appModes', function() {
    var modes;
    modes = {
      createQuest: false
    };
    this.setCreateMode = function(val) {
      return modes.createQuest = val;
    };
    this.getModes = function() {
      return modes;
    };
    return this;
  });

  app.factory('$authService', function() {
    var user;
    user = {
      is_login: false,
      id: '',
      name: ''
    };
    this.changeUser = function(nuser) {
      user.is_login = nuser.is_login;
      user.id = nuser.id || nuser._id;
      return user.name = nuser.name;
    };
    this.resetUser = function() {
      user.is_login = false;
      user.id = '';
      return user.name = '';
    };
    this.getUser = function() {
      return user;
    };
    return this;
  });

  app.factory('$questService', [
    '$http', '$window', function($http, $window) {
      var fetched, links, quests;
      quests = [];
      links = {};
      fetched = false;
      this.fetchQuests = function() {
        var failedMessage;
        failedMessage = 'Failed to fetch quests';
        return $http.get('/backend/quests').success(function(data, status, headers, config) {
          var message, quest, _i, _len, _ref;
          if (data.status) {
            fetched = true;
            while (quests.length > 0) {
              quests.pop();
            }
            _ref = data.quests;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              quest = _ref[_i];
              quests.push(quest);
            }
          } else {
            message = data.message || failedMessage;
            return $window.alert(message);
          }
        }).error(function(data, status, headers, config) {
          var message;
          message = data.message || failedMessage;
          return $window.alert(message);
        });
      };
      this.addQuest = function(quest_name) {
        var failedMessage;
        failedMessage = 'Failed to add request';
        return $http.post('/backend/quests', {
          name: quest_name
        }).success(function(data, status, headers, config) {
          var message, to_push;
          if (data.status) {
            to_push = data.quest;
            if (Array.isArray(data.quest)) {
              to_push = data.quest[0];
            }
            quests.push(to_push);
          } else {
            message = data.message || failedMessage;
            return $window.alert(message);
          }
        }).error(function(data, status, headers, config) {
          var message;
          message = data.message || failedMessage;
          return $window.alert(message);
        });
      };
      this.clearQuests = function() {
        var k;
        while (quests.length > 0) {
          quests.pop();
        }
        for (k in links) {
          delete links[k];
        }
        return fetched = false;
      };
      this.getLinks = function(id) {
        var failedMessage;
        failedMessage = 'Failed to fetch links for quest';
        if (links[id]) {
          return links[id];
        }
        $http.post('/backend/quests/fetch', {
          quest_id: id
        }).success(function(data, status, headers, config) {
          var message;
          if (data.status) {
            return links[id] = data.quest;
          } else {
            message = data.message || failedMessage;
            return $window.alert(message);
          }
        }).error(function(data, status, headers, config) {
          return $window.alert(failedMessage);
        });
        return links[id];
      };
      this.addLink = function(quest_id, link_object) {
        var failedMessage;
        failedMessage = 'Failed to add link';
        link_object.quest_id = quest_id;
        return $http.post('/backend/quest/add', link_object).success(function(data, status, headers, config) {
          var message;
          if (data.status) {
            return links[quest_id] = data.quest;
          } else {
            message = data.message || failedMessage;
            return $window.alert(message);
          }
        }).error(function(data, status, headers, config) {
          return $window.alert(failedMessage);
        });
      };
      this.getQuests = function() {
        if (!fetched) {
          this.fetchQuests();
        }
        return quests;
      };
      return this;
    }
  ]);

  app.controller('NavBarController', [
    '$scope', '$authService', '$appModes', '$location', function($scope, $authService, $appModes, $location) {
      $scope.user = $authService.getUser();
      $scope.isCollapsed = true;
      $scope.initUser = function(text) {
        return $authService.changeUser(JSON.parse(text));
      };
      return $scope.changeToQuestMode = function() {
        $appModes.setCreateMode(true);
        if ($location.path() !== '/board') {
          return $location.path('/board');
        }
      };
    }
  ]);

  app.controller('HomePageController', [
    '$scope', '$authService', function($scope, $authService) {
      var user;
      return user = $authService.getUser();
    }
  ]);

  app.controller('LoginController', [
    '$scope', '$authService', '$http', '$location', function($scope, $authService, $http, $location) {
      $scope.user = $authService.getUser();
      $scope.loginForm = {};
      $scope.formSubmitted = false;
      return $scope.submitForm = function() {
        var formData;
        $scope.formSubmitted = true;
        formData = {
          username: $scope.loginForm.username,
          password: $scope.loginForm.password
        };
        return $http.post('/login', formData).success(function(data, status, headers, config) {
          if (data.status && data.user) {
            $authService.changeUser(data.user);
            return $location.path('/board');
          } else {
            return alert('Auth failed');
          }
        }).error(function(data, status, headers, config) {
          return alert('Auth failed');
        });
      };
    }
  ]);

  app.controller('BoardController', [
    '$scope', '$authService', '$questService', '$appModes', '$http', '$window', function($scope, $authService, $questService, $appModes, $http, $window) {
      var firstSet, uri_pattern;
      $scope.quests = $questService.getQuests();
      $scope.defaultQuest = 0;
      $scope.questObject = {};
      $scope.linksDataStructure = {};
      $scope.allTags = [];
      firstSet = false;
      $scope.$watchCollection("quests", function(newval, oldval) {
        if (newval.length > 0 && !firstSet) {
          return $scope.changeQuest(0);
        }
      });
      $scope.$watch("questObject", function(newval, oldval) {
        var k, link, tmpVal, _i, _len, _ref;
        while ($scope.allTags.length > 0) {
          $scope.allTags.pop();
        }
        if (newval && newval.links) {
          tmpVal = {
            untagged: []
          };
          _ref = newval.links;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            link = _ref[_i];
            if (link.tags && link.tags.length !== 0) {
              if (!tmpVal[link.tags[0]]) {
                tmpVal[link.tags[0]] = [];
              }
              tmpVal[link.tags[0]].push(link);
            } else {
              tmpVal.untagged.push(link);
            }
          }
          for (k in tmpVal) {
            if (k !== 'untagged') {
              $scope.allTags.push({
                label: k
              });
            }
          }
          $scope.linksDataStructure = tmpVal;
        } else {
          $scope.linksDataStructure = {};
        }
      });
      $scope.appModes = $appModes.getModes();
      $scope.createQuestForm = {};
      $scope.addLinkForm = {};
      uri_pattern = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
      $scope.createQuest = function() {
        $questService.addQuest($scope.createQuestForm.quest);
        return $scope.createQuestForm.quest = '';
      };
      $scope.createLink = function(mainForm) {
        var failedMessage, link_object, linksInText;
        linksInText = $scope.addLinkForm.link.match(uri_pattern);
        if (linksInText.length === 0) {
          alert('No link in text');
          return;
        }
        link_object = {
          quest_id: $scope.quests[$scope.defaultQuest]._id,
          link: linksInText[0],
          desc: $scope.addLinkForm.link.replace(linksInText[0], "")
        };
        failedMessage = 'Failed to add link';
        $http.post('/backend/quests/add', link_object).success(function(data, status, headers, config) {
          var message;
          if (data.status) {
            return $scope.questObject = data.quest;
          } else {
            message = data.message || failedMessage;
            return $window.alert(message);
          }
        }).error(function(data, status, headers, config) {
          return $window.alert(failedMessage);
        });
        $scope.addLinkForm.link = '';
        mainForm.$setPristine();
        return mainForm.$setUntouched();
      };
      return $scope.changeQuest = function(index) {
        var failedMessage;
        firstSet = true;
        if ($scope.quests.length === 0) {
          return;
        }
        failedMessage = 'Failed to fetch links';
        $scope.defaultQuest = index;
        return $http.post('/backend/quests/fetch', {
          quest_id: $scope.quests[$scope.defaultQuest]._id
        }).success(function(data, status, headers, config) {
          var message;
          if (data.status) {
            return $scope.questObject = data.quest;
          } else {
            message = data.message || failedMessage;
            return $window.alert(message);
          }
        }).error(function(data, status, headers, config) {
          return $window.alert(failedMessage);
        });
      };
    }
  ]);

  app.controller('LogoutController', [
    '$scope', '$authService', '$http', '$location', '$questService', function($scope, $authService, $http, $location, $questService) {
      return $http.post('/logout').success(function(data, status, headers, config) {
        if (data.status) {
          $authService.resetUser();
          $questService.clearQuests();
          return $location.path('/');
        } else {
          return alert('Auth failed');
        }
      }).error(function(data, status, headers, config) {
        alert('Some error occured');
        return $location.path('/board');
      });
    }
  ]);

  app.controller('RegisterController', [
    '$scope', '$authService', '$http', '$location', function($scope, $authService, $http, $location) {
      if ($authService.getUser().is_login) {
        $location.path('/board');
      }
      $scope.registerForm = {};
      $scope.formSubmitted = false;
      return $scope.submitForm = function() {
        var formData;
        formData = {
          username: $scope.registerForm.username,
          password: $scope.registerForm.password
        };
        return $http.post('/register', formData).success(function(data, status, headers, config) {
          var message;
          if (data.status && data.user) {
            data.user.is_login = true;
            $authService.changeUser(data.user);
            return $location.path('/board');
          } else {
            message = data.message || 'Registration failed';
            return alert(message);
          }
        }).error(function(data, status, headers, config) {
          var message;
          message = data.message || 'Registration failed';
          return alert(message);
        });
      };
    }
  ]);

  app.config([
    '$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
      $routeProvider.when('/', {
        templateUrl: '/root.html',
        controller: 'HomePageController',
        config: {
          authRequired: false
        }
      }).when('/login', {
        templateUrl: '/login.html',
        controller: 'LoginController',
        config: {
          authRequired: false
        }
      }).when('/register', {
        templateUrl: '/register.html',
        controller: 'RegisterController',
        config: {
          authRequired: false
        }
      }).when('/board', {
        templateUrl: '/board.html',
        controller: 'BoardController',
        config: {
          authRequired: true
        }
      }).when('/logout', {
        template: '',
        controller: 'LogoutController',
        config: {
          authRequired: true
        }
      }).otherwise({
        redirectTo: '/'
      });
      return $locationProvider.html5Mode(false);
    }
  ]);

  app.run([
    '$rootScope', '$location', '$authService', function($rootScope, $location, $authService) {
      $rootScope.$on('$routeChangeStart', function(event, next, current) {
        if (next.$$route.config && next.$$route.config.authRequired) {
          if (!$authService.getUser().is_login) {
            return $location.path('/login');
          }
        }
      });
    }
  ]);

}).call(this);
