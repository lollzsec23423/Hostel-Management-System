app.controller('MessOwnerDashboardController', function ($scope) {
    // Basic scope for default dashboard
});

app.controller('MessOwnerMenuController', function ($scope, $http, API_URL) {
    $scope.menuList = [];
    $scope.attendanceList = [];
    $scope.menuData = { meal_type: 'Breakfast', day_number: '1' };

    function loadMenu() {
        $http.get(API_URL + '/mess/menu').then(res => {
            $scope.menuList = res.data;

            // Group by date
            let grouped = {};
            res.data.forEach(m => {
                let d = m.menu_date;
                if (!grouped[d]) {
                    grouped[d] = {
                        date: d,
                        day_number: m.day_number,
                        meals: []
                    };
                }
                grouped[d].meals.push(m);
            });
            $scope.groupedMenu = Object.values(grouped);
        });
    }
    loadMenu();

    $scope.loadAttendance = function () {
        let url = API_URL + '/mess/attendance/all';
        if ($scope.filterDate) {
            // format date YYYY-MM-DD
            let d = new Date($scope.filterDate);
            let dateStr = d.toISOString().split('T')[0];
            url += '?date=' + dateStr;
        }
        $http.get(url).then(res => $scope.attendanceList = res.data);
    };
    $scope.loadAttendance();

    $scope.addMenu = function () {
        $scope.errorMsg = "";
        $scope.successMsg = "";
        let payload = angular.copy($scope.menuData);
        payload.day_number = parseInt(payload.day_number);

        $http.post(API_URL + '/mess/menu', payload).then(res => {
            $scope.successMsg = res.data.message;
            $scope.menuData.items = ''; // reset only items
            loadMenu();
        }).catch(err => $scope.errorMsg = err.data.error || "Failed to add menu");
    };

    $scope.deleteMenu = function (id) {
        if (confirm("Delete this menu entry?")) {
            $http.delete(API_URL + '/mess/menu/' + id).then(loadMenu);
        }
    };
});
