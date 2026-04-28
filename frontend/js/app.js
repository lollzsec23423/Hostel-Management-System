var app = angular.module('hostelApp', ['ngRoute']);

app.constant('API_URL', 'http://localhost:5000/api');

app.controller('MainController', function ($scope, $rootScope, authService) {
    $rootScope.currentUser = authService.getUser();
});

app.config(function ($routeProvider, $httpProvider) {
    $routeProvider
        // Auth Routes
        .when('/login', {
            templateUrl: 'views/login.html?v=1',
            controller: 'AuthController'
        })
        .when('/register', {
            templateUrl: 'views/register.html?v=1',
            controller: 'AuthController'
        })

        // Student Routes
        .when('/student/dashboard', {
            templateUrl: 'views/student/dashboard.html?v=1',
            controller: 'StudentDashboardController',
            resolve: { auth: checkAuth('Student') }
        })
        .when('/student/records', {
            templateUrl: 'views/student/records.html?v=1',
            controller: 'StudentRecordController',
            resolve: { auth: checkAuth('Student') }
        })
        .when('/student/rooms', {
            templateUrl: 'views/student/rooms.html?v=1',
            controller: 'StudentRoomController',
            resolve: { auth: checkAuth('Student') }
        })
        .when('/student/mess/attendance', {
            templateUrl: 'views/student/mess.html?v=1',
            controller: 'StudentMessController',
            resolve: { auth: checkAuth('Student') }
        })
        .when('/student/mess/menu', {
            templateUrl: 'views/student/mess.html?v=1',
            controller: 'StudentMessController',
            resolve: { auth: checkAuth('Student') }
        })
        .when('/student/complaints', {
            templateUrl: 'views/student/complaints.html?v=1',
            controller: 'StudentComplaintController',
            resolve: { auth: checkAuth('Student') }
        })
        .when('/student/outings', {
            templateUrl: 'views/student/outings.html?v=1',
            controller: 'StudentOutingController',
            resolve: { auth: checkAuth('Student') }
        })
        .when('/student/maintenance', {
            templateUrl: 'views/student/maintenance.html?v=1',
            controller: 'StudentMaintenanceController',
            resolve: { auth: checkAuth('Student') }
        })

        // Admin & Warden Shared Routes
        .when('/admin/dashboard', {
            templateUrl: 'views/admin/dashboard.html?v=1',
            controller: 'AdminDashboardController',
            resolve: { auth: checkAuth(['Admin', 'Warden']) }
        })
        .when('/admin/explorer', {
            templateUrl: 'views/admin/explorer.html?v=1',
            controller: 'AdminExplorerController',
            resolve: { auth: checkAuth('Admin') }
        })
        .when('/admin/hostels', {
            templateUrl: 'views/admin/hostels.html?v=1',
            controller: 'AdminHostelController',
            resolve: { auth: checkAuth(['Admin', 'Warden']) }
        })
        .when('/admin/bookings', {
            templateUrl: 'views/admin/bookings.html?v=1',
            controller: 'AdminBookingController',
            resolve: { auth: checkAuth(['Admin', 'Warden']) }
        })
        .when('/admin/mess', {
            templateUrl: 'views/admin/mess.html?v=1',
            controller: 'AdminMessController',
            resolve: { auth: checkAuth('Admin') }
        })
        .when('/admin/complaints', {
            templateUrl: 'views/admin/complaints.html?v=1',
            controller: 'AdminComplaintController',
            resolve: { auth: checkAuth(['Admin', 'Warden']) }
        })
        .when('/admin/outings', {
            templateUrl: 'views/admin/outings.html?v=1',
            controller: 'AdminOutingController',
            resolve: { auth: checkAuth(['Admin', 'Warden']) }
        })
        .when('/admin/students', {
            templateUrl: 'views/admin/students.html?v=1',
            controller: 'AdminStudentController',
            resolve: { auth: checkAuth(['Admin', 'Warden']) }
        })
        .when('/admin/discipline', {
            templateUrl: 'views/admin/discipline.html?v=1',
            controller: 'AdminDCController',
            resolve: { auth: checkAuth(['Admin', 'Warden']) }
        })
        .when('/admin/maintenance', {
            templateUrl: 'views/admin/maintenance.html?v=1',
            controller: 'AdminMaintenanceController',
            resolve: { auth: checkAuth(['Admin', 'Warden']) }
        })
        .when('/admin/damages', {
            templateUrl: 'views/admin/damages.html?v=1',
            controller: 'AdminDamageController',
            resolve: { auth: checkAuth(['Admin', 'Warden']) }
        })



        // Mess Owner Routes
        .when('/mess-owner/dashboard', {
            templateUrl: 'views/mess-owner/dashboard.html?v=1',
            controller: 'MessOwnerDashboardController',
            resolve: { auth: checkAuth('Mess Owner') }
        })
        .when('/mess-owner/menu', {
            templateUrl: 'views/mess-owner/menu.html?v=1',
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

function checkAuth(requiredRoles) {
    return function ($q, $location, authService) {
        var deferred = $q.defer();
        var user = authService.getUser();

        let hasAccess = false;
        if (user) {
            if (Array.isArray(requiredRoles)) {
                hasAccess = requiredRoles.includes(user.role);
            } else {
                hasAccess = user.role === requiredRoles;
            }
        }

        if (hasAccess) {
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
