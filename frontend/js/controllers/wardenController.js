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

app.controller('WardenComplaintController', function ($scope, $http, $timeout, API_URL) {
    $scope.complaints = [];
    $scope.selectedComplaint = null;
    $scope.replyText = '';
    
    $scope.stats = {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0
    };
    
    let complaintsChartInstance = null;

    function loadComplaints() {
        $http.get(API_URL + '/complaints').then(res => {
            $scope.complaints = res.data;
            calculateStats();
        });
    }
    
    function calculateStats() {
        let total = 0, pending = 0, inProgress = 0, resolved = 0;
        
        $scope.complaints.forEach(c => {
            total++;
            if (c.status === 'Pending') pending++;
            else if (c.status === 'In Progress') inProgress++;
            else if (c.status === 'Resolved') resolved++;
        });
        
        $scope.stats.total = total;
        $scope.stats.pending = pending;
        $scope.stats.inProgress = inProgress;
        $scope.stats.resolved = resolved;
        
        $timeout(() => {
            const ctx = document.getElementById('complaintsChart');
            if (!ctx) return;
            
            if (complaintsChartInstance) {
                complaintsChartInstance.destroy();
            }
            
            complaintsChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Pending', 'In Progress', 'Resolved'],
                    datasets: [{
                        data: [pending, inProgress, resolved],
                        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        });
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
app.controller('WardenRoomStatusController', function ($scope, $http, $timeout, API_URL) {
    $scope.rooms = [];
    $scope.stats = {
        totalRooms: 0,
        totalCapacity: 0,
        occupiedSeats: 0,
        freeSeats: 0
    };

    let occupancyChartInstance = null;

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

        // Render Chart
        $timeout(() => {
            const ctx = document.getElementById('occupancyChart');
            if (!ctx) return;
            
            if (occupancyChartInstance) {
                occupancyChartInstance.destroy();
            }
            
            occupancyChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Occupied Seats', 'Free Seats'],
                    datasets: [{
                        data: [$scope.stats.occupiedSeats, $scope.stats.freeSeats],
                        backgroundColor: ['#ef4444', '#10b981'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        });
    }

    $scope.exportSQL = function() {
        $http.get(API_URL + '/rooms/hostel/occupancy/export', { responseType: 'blob' }).then(res => {
            const blob = new Blob([res.data], { type: 'application/sql' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // Get filename from header if possible, else default
            let filename = 'occupancy_export.sql';
            const disposition = res.headers('Content-Disposition');
            if (disposition && disposition.indexOf('filename=') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) { 
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }).catch(err => {
            console.error("Failed to export SQL", err);
            alert("Failed to export SQL file.");
        });
    };

    $scope.importSQLFile = function(input) {
        if (!input.files || input.files.length === 0) return;
        
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            const sqlContent = e.target.result;
            if (!sqlContent) return;

            // Send raw content to the server
            $http.post(API_URL + '/rooms/hostel/occupancy/import', { sql: sqlContent })
                .then(res => {
                    alert('SQL data imported successfully!');
                    loadRoomStatus(); // refresh dashboard
                })
                .catch(err => {
                    console.error("Failed to import SQL", err);
                    alert("Failed to import SQL file: " + (err.data && err.data.error ? err.data.error : err.statusText));
                });
        };

        reader.readAsText(file);
        // Clear the input so the same file can be selected again
        input.value = '';
    };

    loadRoomStatus();
});

app.controller('WardenOutingController', function ($scope, $http, $timeout, API_URL) {
    $scope.outings = [];
    $scope.errorMsg = "";
    $scope.successMsg = "";
    $scope.filterStatus = 'All';

    $scope.stats = {
        total: 0,
        pending: 0,
        approved: 0,
        others: 0
    };

    let outingsChartInstance = null;

    $scope.loadOutings = function () {
        $http.get(API_URL + '/outings').then(function (res) {
            $scope.outings = res.data;
            calculateStats();
        }).catch(function (err) {
            console.error(err);
        });
    };

    function calculateStats() {
        let total = 0, pending = 0, approved = 0, others = 0;
        
        $scope.outings.forEach(o => {
            total++;
            if (o.status === 'Pending') pending++;
            else if (o.status === 'Approved') approved++;
            else others++;
        });
        
        $scope.stats.total = total;
        $scope.stats.pending = pending;
        $scope.stats.approved = approved;
        $scope.stats.others = others;
        
        $timeout(() => {
            const ctx = document.getElementById('outingsChart');
            if (!ctx) return;
            
            if (outingsChartInstance) {
                outingsChartInstance.destroy();
            }
            
            outingsChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Pending', 'Approved', 'Rejected/Completed'],
                    datasets: [{
                        data: [pending, approved, others],
                        backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        });
    }

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
