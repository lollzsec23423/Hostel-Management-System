var app = angular.module('hostelApp', ['ngRoute']);

app.constant('API_URL', 'http://localhost:5000/api');

app.controller('MainController', function ($scope, $rootScope, authService) {
    $rootScope.currentUser = authService.getUser();
});

app.config(function ($routeProvider, $httpProvider) {
    $routeProvider
        // Auth Routes
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'AuthController'
        })
        .when('/register', {
            templateUrl: 'views/register.html',
            controller: 'AuthController'
        })

        // Student Routes
        .when('/student/dashboard', {
            templateUrl: 'views/student/dashboard.html',
            controller: 'StudentDashboardController',
            resolve: { auth: checkAuth('Student') }
        })
        .when('/student/rooms', {
            templateUrl: 'views/student/rooms.html',
            controller: 'StudentRoomController',
            resolve: { auth: checkAuth('Student') }
        })
        .when('/student/mess/attendance', {
            templateUrl: 'views/student/mess.html',
            controller: 'StudentMessController',
            resolve: { auth: checkAuth('Student') }
        })
        .when('/student/mess/menu', {
            templateUrl: 'views/student/mess.html',
            controller: 'StudentMessController',
            resolve: { auth: checkAuth('Student') }
        })
        .when('/student/complaints', {
            templateUrl: 'views/student/complaints.html',
            controller: 'StudentComplaintController',
            resolve: { auth: checkAuth('Student') }
        })
        .when('/student/outings', {
            templateUrl: 'views/student/outings.html',
            controller: 'StudentOutingController',
            resolve: { auth: checkAuth('Student') }
        })

        // Admin Routes
        .when('/admin/dashboard', {
            templateUrl: 'views/admin/dashboard.html',
            controller: 'AdminDashboardController',
            resolve: { auth: checkAuth('Admin') }
        })
        .when('/admin/hostels', {
            templateUrl: 'views/admin/hostels.html',
            controller: 'AdminHostelController',
            resolve: { auth: checkAuth('Admin') }
        })
        .when('/admin/bookings', {
            templateUrl: 'views/admin/bookings.html',
            controller: 'AdminBookingController',
            resolve: { auth: checkAuth('Admin') }
        })
        .when('/admin/mess', {
            templateUrl: 'views/admin/mess.html',
            controller: 'AdminMessController',
            resolve: { auth: checkAuth('Admin') }
        })
        .when('/admin/complaints', {
            templateUrl: 'views/admin/complaints.html',
            controller: 'AdminComplaintController',
            resolve: { auth: checkAuth('Admin') }
        })

        // Warden Routes
        .when('/warden/dashboard', {
            templateUrl: 'views/warden/dashboard.html',
            controller: 'WardenDashboardController',
            resolve: { auth: checkAuth('Warden') }
        })
        .when('/warden/bookings', {
            templateUrl: 'views/warden/bookings.html',
            controller: 'WardenBookingController',
            resolve: { auth: checkAuth('Warden') }
        })
        .when('/warden/complaints', {
            templateUrl: 'views/warden/complaints.html',
            controller: 'WardenComplaintController',
            resolve: { auth: checkAuth('Warden') }
        })
        .when('/warden/rooms', {
            templateUrl: 'views/warden/rooms.html',
            controller: 'WardenRoomStatusController',
            resolve: { auth: checkAuth('Warden') }
        })
        .when('/warden/outings', {
            templateUrl: 'views/warden/outings.html',
            controller: 'WardenOutingController',
            resolve: { auth: checkAuth('Warden') }
        })

        // Mess Owner Routes
        .when('/mess-owner/dashboard', {
            templateUrl: 'views/mess-owner/dashboard.html',
            controller: 'MessOwnerDashboardController',
            resolve: { auth: checkAuth('Mess Owner') }
        })
        .when('/mess-owner/menu', {
            templateUrl: 'views/mess-owner/menu.html',
            controller: 'MessOwnerMenuController',
            resolve: { auth: checkAuth('Mess Owner') }
        })

        .otherwise({
            redirectTo: '/login'
        });

    // Add interceptor for JWT token
    $httpProvider.interceptors.push('authInterceptor');
});

// Configure Interceptor
app.factory('authInterceptor', function ($window, $q) {
    return {
        request: function (config) {
            var token = $window.localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = 'Bearer ' + token;
            }
            return config;
        },
        responseError: function (rejection) {
            if (rejection.status === 401 || rejection.status === 403) {
                $window.localStorage.removeItem('token');
                $window.localStorage.removeItem('user');
                $window.location.href = '#!/login';
            }
            return $q.reject(rejection);
        }
    };
});

function checkAuth(requiredRole) {
    return function ($q, $location, authService) {
        var deferred = $q.defer();
        var user = authService.getUser();

        if (user && user.role === requiredRole) {
            deferred.resolve();
        } else {
            console.log("Access denied, redirecting...");
            $location.path('/login');
            deferred.reject();
        }
        return deferred.promise;
    };
}

// Ensure the app checks auth on run
app.run(function ($rootScope, $location, authService) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        // You can add global route checks here if needed
        var user = authService.getUser();
        $rootScope.currentUser = user;
    });

    $rootScope.logout = function () {
        authService.logout();
        $location.path('/login');
    };
});
