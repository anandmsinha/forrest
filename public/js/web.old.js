var app = angular.module('mainForrestApp', ['ngRoute', 'angular-loading-bar'])

// Main authentication service
app.factory('$authService', function() {
    var user = {is_login: false, id: '', name: ''}

    this.changeUser = function(nuser) {
        user.is_login = nuser.is_login
        user.id = nuser.id || nuser._id
        user.name = nuser.name
    }

    this.resetUser = function() {
        user.is_login = false
        user.id = ''
        user.name = ''
    }

    this.getUser = function() {
        return user
    }

    return this
})

app.controller('NavBarController', ['$scope', '$authService', function($scope, $authService) {
    $scope.user = $authService.getUser()

    $scope.initUser = function(text){
        $authService.changeUser(JSON.parse(text))
    }
}])

app.controller('HomePageController', ['$scope', '$authService', function($scope, $authService) {
    $scope.user = $authService.getUser()
}])

app.controller('LoginController', ['$scope', '$authService', '$http', '$location', function($scope, $authService, $http, $location) {
    $scope.user = $authService.getUser()

    $scope.loginForm = {}

    $scope.formSubmitted = false

    $scope.submitForm = function() {
        $scope.formSubmitted = true
        $http.post('/login', {username: $scope.loginForm.username, password: $scope.loginForm.password})
            .success(function(data, status, headers, config) {
                if (data.status && data.user) {
                    $authService.changeUser(data.user)
                    $location.path("/board")
                    return
                }
                alert('Auth failed')
            })
            .error(function(data, status, headers, config) {
                alert('Auth failed')
            })
    }
}])

app.controller('BoardController', ['$scope', '$authService', function($scope, $authService) {
    $scope.user = $authService.getUser()
}])

app.controller('LogoutController', ['$scope', '$authService', '$http', '$location', function($scope, $authService, $http, $location) {
    $http.post('/logout')
        .success(function(data, status, headers, config) {
            if (data.status) {
                $authService.resetUser()
                $location.path("/")
            } else {
                $location.path("/board")
            }
        })
        .error(function(data, status, headers, config) {
            alert('Some error occured')
            $location.path("/board")
        })
}])

app.controller('RegisterController', ['$scope', '$authService', '$http', '$location', function($scope, $authService, $http, $location) {
    if ($authService.getUser().is_login) {
        $location.path("/board")
    }

    $scope.registerForm = {}
    $scope.formSubmitted = false

    $scope.submitForm = function() {
        $http.post('/register', {username: $scope.registerForm.username, password: $scope.registerForm.password})
            .success(function(data, status, headers, config) {
                if (data.status && data.user) {
                    data.user.is_login = true
                    $authService.changeUser(data.user)
                    $location.path("/board")
                } else {
                    if (data.message) {
                        alert(data.message)
                    } else {
                        alert('Registration failed')
                    }
                }
            })
            .error(function(data, status, headers, config) {
                if (data.message) {
                    alert(data.message)
                } else {
                    alert('Registration failed')
                }
            })
    }
}])

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/root.html',
            controller: 'HomePageController',
            config: { authRequired: false }
        })
        .when('/login', {
            templateUrl: '/login.html',
            controller: 'LoginController',
            config: { authRequired: false }
        })
        .when('/register', {
            templateUrl: '/register.html',
            controller: 'RegisterController',
            config: { authRequired: false }
        })
        .when('/board', {
            templateUrl: '/board.html',
            controller: 'BoardController',
            config: { authRequired: true }
        })
        .when('/logout', {
            template: " ",
            controller: 'LogoutController',
            config: { authRequired: true }
        })
        .otherwise({redirectTo: '/'})
    $locationProvider.html5Mode(false);
}])

app.run(['$rootScope', '$location', '$log', '$authService', function($rootScope, $location, $log, $authService) {
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        var route = next.$$route
        if (route.config && route.config.authRequired) {
            if (route.config.authRequired) {
                if (!$authService.getUser().is_login) {
                    $location.path("/login")
                }
            }
        }
    })
}])