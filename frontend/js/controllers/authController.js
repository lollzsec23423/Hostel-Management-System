app.controller('AuthController', function ($scope, $location, authService) {

    // Redirect if already logged in
    var user = authService.getUser();
    if (user) {
        if (user.role === 'Admin') $location.path('/admin/dashboard');
        else if (user.role === 'Warden') $location.path('/warden/dashboard');
        else if (user.role === 'Mess Owner') $location.path('/mess-owner/dashboard');
        else $location.path('/student/dashboard');
    }

    $scope.loginData = {};
    $scope.registerData = { course: 'None' };
    $scope.loading = false;
    $scope.errorMsg = '';
    $scope.successMsg = '';

    $scope.doLogin = function () {
        $scope.loading = true;
        $scope.errorMsg = '';

        authService.login($scope.loginData).then(function (res) {
            $scope.loading = false;
            authService.saveToken(res.data.token);
            authService.saveUser(res.data.user);

            if (res.data.user.role === 'Admin') {
                $location.path('/admin/dashboard');
            } else if (res.data.user.role === 'Warden') {
                $location.path('/warden/dashboard');
            } else if (res.data.user.role === 'Mess Owner') {
                $location.path('/mess-owner/dashboard');
            } else {
                $location.path('/student/dashboard');
            }
        }).catch(function (err) {
            $scope.loading = false;
            $scope.errorMsg = (err && err.data && err.data.error) ? err.data.error : 'Login failed. Please check your connection or try again later.';
        });
    };

    $scope.doRegister = function () {
        $scope.loading = true;
        $scope.errorMsg = '';

        authService.register($scope.registerData).then(function (res) {
            $scope.loading = false;
            $scope.successMsg = 'Registration successful! You can now login.';
            $scope.registerData = { course: 'None' }; // reset
        }).catch(function (err) {
            $scope.loading = false;
            $scope.errorMsg = (err && err.data && err.data.error) ? err.data.error : 'Registration failed. Please check your connection or try again later.';
        });
    };
});
