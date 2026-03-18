app.factory('authService', function ($http, $window, API_URL) {
    var authFactory = {};

    authFactory.login = function (credentials) {
        return $http.post(API_URL + '/auth/login', credentials);
    };

    authFactory.register = function (userData) {
        return $http.post(API_URL + '/auth/register', userData);
    };

    authFactory.saveToken = function (token) {
        $window.localStorage.setItem('token', token);
    };

    authFactory.getToken = function () {
        return $window.localStorage.getItem('token');
    };

    authFactory.saveUser = function (user) {
        $window.localStorage.setItem('user', JSON.stringify(user));
    };

    authFactory.getUser = function () {
        var user = $window.localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    };

    authFactory.logout = function () {
        $window.localStorage.removeItem('token');
        $window.localStorage.removeItem('user');
    };

    return authFactory;
});
