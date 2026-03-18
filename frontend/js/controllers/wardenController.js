app.controller('WardenDashboardController', function ($scope, $http, API_URL) {
    // Basic wrapper, can be expanded for Warden-specific stats later
    $scope.stats = { pendingBookings: 0, activeComplaints: 0 };
});

app.controller('WardenBookingController', function ($scope, $http, API_URL) {
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

app.controller('WardenComplaintController', function ($scope, $http, API_URL) {
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
        // If it's not already resolved, resolve it when replying
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
app.controller('WardenRoomStatusController', function ($scope, $http, API_URL) {
    $scope.rooms = [];
    $scope.stats = {
        totalRooms: 0,
        totalCapacity: 0,
        occupiedSeats: 0,
        freeSeats: 0
    };

    function loadRoomStatus() {
        $http.get(API_URL + '/rooms/hostel/occupancy').then(res => {
            $scope.rooms = res.data;
            calculateStats();
        }).catch(err => {
            console.error("Failed to load room status", err);
        });
    }

    function calculateStats() {
        let tRooms = 0, tCap = 0, occSeats = 0;
        $scope.rooms.forEach(room => {
            tRooms += 1;
            tCap += room.capacity;
            occSeats += room.occupied_seats;
        });

        $scope.stats.totalRooms = tRooms;
        $scope.stats.totalCapacity = tCap;
        $scope.stats.occupiedSeats = occSeats;
        $scope.stats.freeSeats = tCap - occSeats;
    }

    loadRoomStatus();
});

app.controller('WardenOutingController', function ($scope, $http, API_URL) {
    $scope.outings = [];
    $scope.errorMsg = "";
    $scope.successMsg = "";
    $scope.filterStatus = 'All';

    $scope.loadOutings = function () {
        $http.get(API_URL + '/outings').then(function (res) {
            $scope.outings = res.data;
        }).catch(function (err) {
            console.error(err);
        });
    };

    $scope.loadOutings();

    $scope.updateStatus = function (id, status) {
        $scope.errorMsg = "";
        $scope.successMsg = "";

        $http.put(API_URL + '/outings/' + id + '/status', { status: status }).then(function (res) {
            $scope.successMsg = res.data.message;
            $scope.loadOutings();
        }).catch(function (err) {
            $scope.errorMsg = err.data.error || 'Failed to update outing status';
        });
    };
});
