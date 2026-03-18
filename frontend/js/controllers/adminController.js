app.controller('AdminDashboardController', function ($scope, $http, API_URL) {
    $scope.stats = {};

    function loadStats() {
        $http.get(API_URL + '/admin/dashboard').then(function (res) {
            $scope.stats = res.data;
        }).catch(function (err) {
            console.error("Error loading stats", err);
        });
    }

    loadStats();
});

app.controller('AdminHostelController', function ($scope, $http, API_URL) {
    $scope.hostels = [];
    $scope.rooms = [];
    $scope.selectedHostelId = null;
    $scope.newRoom = { capacity: 2 };

    function loadHostels() {
        $http.get(API_URL + '/hostels').then(res => $scope.hostels = res.data);
    }
    loadHostels();

    $scope.selectHostel = function (id) {
        $scope.selectedHostelId = id;
        loadRooms(id);
    };

    function loadRooms(hostelId) {
        $http.get(API_URL + '/rooms/hostel/' + hostelId).then(res => $scope.rooms = res.data);
    }

    $scope.addRoom = function () {
        $scope.newRoom.hostel_id = $scope.selectedHostelId;
        $scope.errorMsg = "";
        $scope.successMsg = "";
        $http.post(API_URL + '/rooms', $scope.newRoom).then(res => {
            $scope.successMsg = "Room added successfully";
            $scope.newRoom = { capacity: 2 };
            loadRooms($scope.selectedHostelId);
        }).catch(err => $scope.errorMsg = err.data.error || "Failed to add room");
    };

    $scope.deleteRoom = function (id) {
        if (confirm("Are you sure you want to delete this room?")) {
            $http.delete(API_URL + '/rooms/' + id).then(res => {
                loadRooms($scope.selectedHostelId);
            });
        }
    };
});

app.controller('AdminBookingController', function ($scope, $http, API_URL) {
    $scope.bookings = [];

    function loadBookings() {
        $http.get(API_URL + '/rooms/bookings').then(res => $scope.bookings = res.data);
    }
    loadBookings();

    $scope.approveBooking = function (id, status) {
        $scope.errorMsg = "";
        $scope.successMsg = "";
        $http.put(API_URL + '/rooms/bookings/' + id + '/approve', { status: status }).then(res => {
            $scope.successMsg = res.data.message;
            loadBookings();
        }).catch(err => $scope.errorMsg = err.data.error || "Failed to process booking");
    };
});

app.controller('AdminMessController', function ($scope, $http, API_URL) {
    $scope.todayMenu = [];
    $scope.todayDate = new Date();

    function loadTodayMenu() {
        $http.get(API_URL + '/mess/menu/today').then(function (res) {
            $scope.todayMenu = res.data;
        }).catch(function (err) {
            console.error(err);
        });
    }

    loadTodayMenu();
});

app.controller('AdminComplaintController', function ($scope, $http, API_URL) {
    $scope.complaints = [];
    $scope.selectedComplaint = null;
    $scope.replyText = '';

    function loadComplaints() {
        $http.get(API_URL + '/complaints').then(res => $scope.complaints = res.data);
    }
    loadComplaints();

    $scope.updateStatus = function (id, status, comment) {
        $http.put(API_URL + '/complaints/' + id, { status: status }).then(res => {
            loadComplaints();
        }).catch(err => {
            console.error("Failed to update status", err);
        });
    };

    $scope.openReplyModal = function (complaint) {
        $scope.selectedComplaint = complaint;
        $scope.replyText = complaint.resolution_comment || '';
    };

    $scope.submitReply = function () {
        if (!$scope.selectedComplaint) return;
        $scope.errorMsg = "";
        $scope.successMsg = "";

        let payload = {
            resolution_comment: $scope.replyText
        };
        if ($scope.selectedComplaint.status !== 'Resolved') {
            payload.status = 'Resolved';
        }

        $http.put(API_URL + '/complaints/' + $scope.selectedComplaint.id, payload).then(res => {
            $scope.successMsg = "Reply sent successfully!";
            $scope.selectedComplaint = null;
            $scope.replyText = '';
            loadComplaints();
        }).catch(err => $scope.errorMsg = err.data.error || "Failed");
    };
});

