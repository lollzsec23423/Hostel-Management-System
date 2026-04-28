app.controller('StudentDashboardController', function ($scope, $http, API_URL) {
    $scope.myBooking = null;
    $scope.myComplaints = [];

    // Load initial dashboard data
    function loadData() {
        // Get user's room booking
        $http.get(API_URL + '/rooms/bookings/my').then(function (res) {
            if (res.data && res.data.length > 0) {
                // Get the most recent one
                $scope.myBooking = res.data[0];
            }
        });

        // Get recent complaints
        $http.get(API_URL + '/complaints/my').then(function (res) {
            $scope.myComplaints = res.data;
        });
    }

    loadData();
});

app.controller('StudentRoomController', function ($scope, $http, API_URL) {
    $scope.hostels = [];
    $scope.rooms = [];
    $scope.selectedHostel = "";
    $scope.myBooking = null;
    $scope.errorMsg = "";
    $scope.successMsg = "";

    function loadBooking() {
        $http.get(API_URL + '/rooms/bookings/my').then(function (res) {
            if (res.data && res.data.length > 0) {
                $scope.myBooking = res.data[0];
            }
        });
    }

    $http.get(API_URL + '/hostels').then(function (res) {
        $scope.hostels = res.data;
    });

    loadBooking();

    $scope.loadRooms = function (hostelId) {
        if (!hostelId) {
            $scope.rooms = [];
            return;
        }
        $http.get(API_URL + '/rooms/hostel/' + hostelId).then(function (res) {
            $scope.rooms = res.data;
        });
    };

    $scope.bookRoom = function (roomId) {
        $scope.errorMsg = "";
        $scope.successMsg = "";

        $http.post(API_URL + '/rooms/book', { room_id: roomId }).then(function (res) {
            $scope.successMsg = res.data.message;
            loadBooking();
            if ($scope.selectedHostel) {
                $scope.loadRooms($scope.selectedHostel);
            }
        }).catch(function (err) {
            $scope.errorMsg = err.data.error || 'Failed to book room';
        });
    };
});

app.controller('StudentMessController', function ($scope, $http, API_URL, $location) {
    $scope.currentPath = $location.path();
    $scope.attendanceHistory = [];
    $scope.menuList = [];
    $scope.errorMsg = "";
    $scope.successMsg = "";

    if ($scope.currentPath === '/student/mess/attendance') {
        $http.get(API_URL + '/mess/attendance/my').then(function (res) {
            $scope.attendanceHistory = res.data;
        });
    } else if ($scope.currentPath === '/student/mess/menu') {
        $http.get(API_URL + '/mess/menu/today').then(function (res) {
            let meals = res.data;
            const order = { 'breakfast': 1, 'lunch': 2, 'dinner': 3 };
            meals.sort((a, b) => {
                let aType = (a.meal_type || '').toLowerCase().trim();
                let bType = (b.meal_type || '').toLowerCase().trim();
                return (order[aType] || 99) - (order[bType] || 99);
            });
            $scope.todayMenu = meals;
            $scope.todayDate = new Date();
        });
    }

    $scope.markAttendance = function (mealType) {
        $scope.errorMsg = "";
        $scope.successMsg = "";

        $http.post(API_URL + '/mess/attendance', { meal_type: mealType }).then(function (res) {
            $scope.successMsg = res.data.message;
            // Reload history
            $http.get(API_URL + '/mess/attendance/my').then(function (r) {
                $scope.attendanceHistory = r.data;
            });
        }).catch(function (err) {
            $scope.errorMsg = err.data.error || 'Failed to mark attendance';
        });
    };
});

app.controller('StudentComplaintController', function ($scope, $http, API_URL) {
    $scope.complaintData = { category: 'Other' };
    $scope.myComplaints = [];
    $scope.errorMsg = "";
    $scope.successMsg = "";
    $scope.loading = false;

    function loadComplaints() {
        $http.get(API_URL + '/complaints/my').then(function (res) {
            $scope.myComplaints = res.data;
        });
    }

    loadComplaints();

    $scope.submitComplaint = function () {
        $scope.errorMsg = "";
        $scope.successMsg = "";
        $scope.loading = true;

        $http.post(API_URL + '/complaints', $scope.complaintData).then(function (res) {
            $scope.loading = false;
            $scope.successMsg = res.data.message;
            $scope.complaintData = { category: 'Other' }; // reset
            loadComplaints();
        }).catch(function (err) {
            $scope.loading = false;
            $scope.errorMsg = err.data.error || 'Failed to submit complaint';
        });
    };
});

app.controller('StudentOutingController', function ($scope, $http, API_URL) {
    $scope.outingData = {};
    $scope.myOutings = [];
    $scope.errorMsg = "";
    $scope.successMsg = "";
    $scope.loading = false;

    // Load Min Departure date
    $scope.minDateTime = new Date();
    $scope.minDateTime.setMinutes($scope.minDateTime.getMinutes() - $scope.minDateTime.getTimezoneOffset());
    $scope.minDateTimeStr = $scope.minDateTime.toISOString().slice(0, 16);

    $scope.updateReturnMinDate = function () {
        if ($scope.outingData.departure_date) {
            let depDate = new Date($scope.outingData.departure_date);
            depDate.setMinutes(depDate.getMinutes() - depDate.getTimezoneOffset());
            $scope.minReturnDateTimeStr = depDate.toISOString().slice(0, 16);
        }
    };

    function loadOutings() {
        $http.get(API_URL + '/outings/my-requests').then(function (res) {
            $scope.myOutings = res.data;
        }).catch(function (err) {
            console.error(err);
        });
    }

    loadOutings();

    $scope.submitOuting = function () {
        $scope.errorMsg = "";
        $scope.successMsg = "";
        $scope.loading = true;

        $http.post(API_URL + '/outings', $scope.outingData).then(function (res) {
            $scope.loading = false;
            $scope.successMsg = res.data.message;
            $scope.outingData = {}; // reset
            loadOutings();
        }).catch(function (err) {
            $scope.loading = false;
            $scope.errorMsg = err.data.error || 'Failed to submit outing request';
        });
    };
});

// Student Records Controller
app.controller('StudentRecordController', function ($scope, $http, API_URL) {
    $scope.dcCases = [];
    $scope.damages = [];
    
    $http.get(API_URL + '/dc/my-cases').then(res => {
        $scope.dcCases = res.data;
    }).catch(err => console.error("Error fetching DC Cases", err));

    $http.get(API_URL + '/damages/my-damages').then(res => {
        $scope.damages = res.data;
    }).catch(err => console.error("Error fetching Damages", err));
});

// Student Maintenance Controller
app.controller('StudentMaintenanceController', function ($scope, $http, API_URL) {
    $scope.myMaintenance = [];
    $scope.maintenanceData = {};
    $scope.loading = false;

    function loadMaintenance() {
        $http.get(API_URL + '/maintenance/my-requests').then(function (res) {
            $scope.myMaintenance = res.data;
        }).catch(function (err) {
            console.error(err);
        });
    }

    loadMaintenance();

    $scope.submitMaintenance = function () {
        $scope.errorMsg = "";
        $scope.successMsg = "";
        $scope.loading = true;

        $http.post(API_URL + '/maintenance', $scope.maintenanceData).then(function (res) {
            $scope.loading = false;
            $scope.successMsg = res.data.message;
            $scope.maintenanceData = {};
            loadMaintenance();
        }).catch(function (err) {
            $scope.loading = false;
            $scope.errorMsg = err.data.error || 'Failed to submit request';
        });
    };
});

