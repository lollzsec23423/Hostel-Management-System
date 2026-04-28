app.controller('AdminDashboardController', function ($scope, $http, API_URL) {
    $scope.stats = {};

    function loadStats() {
        $http.get(API_URL + '/admin/dashboard').then(function (res) {
            $scope.stats = res.data;
        }).catch(function (err) {
            console.error("Error loading stats", err);
        });
    }

    $scope.exportDatabase = function() {
        $http.get(API_URL + '/admin/database/export', { responseType: 'blob' }).then(res => {
            const blob = new Blob([res.data], { type: 'application/sql' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            let filename = 'admin_system_backup.sql';
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
            console.error("Failed to export database", err);
            alert("Failed to export full database.");
        });
    };

    $scope.importDatabase = function(input) {
        if (!input.files || input.files.length === 0) return;
        
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            const sqlContent = e.target.result;
            if (!sqlContent) return;

            $http.post(API_URL + '/admin/database/import', { sql: sqlContent })
                .then(res => {
                    alert('Database imported successfully! ' + res.data.message);
                    loadStats(); 
                })
                .catch(err => {
                    console.error("Failed to import database", err);
                    alert("Failed to import database: " + (err.data && err.data.error ? err.data.error : err.statusText));
                });
        };

        reader.readAsText(file);
        input.value = '';
    };

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

app.controller('AdminBookingController', function ($scope, $http, $timeout, API_URL) {
    $scope.bookings = [];

    let statusChartInstance = null;
    let hostelChartInstance = null;

    function loadBookings() {
        $http.get(API_URL + '/rooms/bookings').then(res => {
            $scope.bookings = res.data;
            renderCharts();
        });
    }

    function renderCharts() {
        let statusCounts = { Pending: 0, Approved: 0, Rejected: 0 };
        let hostelCounts = {};

        $scope.bookings.forEach(b => {
            if (statusCounts[b.status] !== undefined) {
                statusCounts[b.status]++;
            }

            const hname = b.hostel_name || 'Unknown';
            if (!hostelCounts[hname]) hostelCounts[hname] = 0;
            hostelCounts[hname]++;
        });

        $timeout(() => {
            const ctxStatus = document.getElementById('adminStatusChart');
            const ctxHostel = document.getElementById('adminHostelChart');
            
            if (!ctxStatus || !ctxHostel) return;

            if (statusChartInstance) statusChartInstance.destroy();
            statusChartInstance = new Chart(ctxStatus, {
                type: 'doughnut',
                data: {
                    labels: ['Pending', 'Approved', 'Rejected'],
                    datasets: [{
                        data: [statusCounts.Pending, statusCounts.Approved, statusCounts.Rejected],
                        backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
            });

            if (hostelChartInstance) hostelChartInstance.destroy();
            hostelChartInstance = new Chart(ctxHostel, {
                type: 'pie',
                data: {
                    labels: Object.keys(hostelCounts),
                    datasets: [{
                        data: Object.values(hostelCounts),
                        backgroundColor: ['#4f46e5', '#ec4899', '#14b8a6', '#f43f5e', '#8b5cf6'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
            });
        });
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

app.controller('AdminComplaintController', function ($scope, $http, $timeout, API_URL) {
    $scope.complaints = [];
    $scope.selectedComplaint = null;
    $scope.replyText = '';
    let chartInstance = null;

    function renderChart() {
        let stats = { Pending: 0, 'In Progress': 0, 'Resolved': 0 };
        $scope.complaints.forEach(c => {
            if(stats[c.status] !== undefined) stats[c.status]++;
        });

        $timeout(() => {
            const ctx = document.getElementById('complaintsChart');
            if(!ctx || typeof Chart === 'undefined') return;
            if(chartInstance) chartInstance.destroy();

            chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Pending', 'In Progress', 'Resolved'],
                    datasets: [{
                        data: [stats['Pending'], stats['In Progress'], stats['Resolved']],
                        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
            });
        }, 100);
    }

    function loadComplaints() {
        $http.get(API_URL + '/complaints').then(res => {
            $scope.complaints = res.data;
            renderChart();
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

app.controller('AdminOutingController', function ($scope, $http, $timeout, API_URL) {
    $scope.outings = [];
    $scope.stats = { total: 0, pending: 0, approved: 0, others: 0 };
    let chartInstance = null;

    function loadOutings() {
        $http.get(API_URL + '/outings').then(res => {
            $scope.outings = res.data;
            calculateStats();
        }).catch(err => {
            $scope.errorMsg = err.data?.error || "Failed to load outings";
        });
    }

    function calculateStats() {
        $scope.stats = { total: $scope.outings.length, pending: 0, approved: 0, others: 0 };
        $scope.outings.forEach(o => {
            if (o.status === 'Pending') $scope.stats.pending++;
            else if (o.status === 'Approved') $scope.stats.approved++;
            else $scope.stats.others++;
        });
        renderChart();
    }

    function renderChart() {
        $timeout(() => {
            const ctx = document.getElementById('outingsChart');
            if (!ctx) return;
            if (typeof Chart === 'undefined') return;
            
            if (chartInstance) chartInstance.destroy();
            
            chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Pending', 'Approved', 'Rejected/Completed'],
                    datasets: [{
                        data: [$scope.stats.pending, $scope.stats.approved, $scope.stats.others],
                        backgroundColor: ['#f59e0b', '#10b981', '#6b7280'],
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
            });
        }, 100);
    }

    $scope.updateStatus = function (id, status) {
        $scope.errorMsg = '';
        $scope.successMsg = '';
        
        $http.put(API_URL + '/outings/' + id + '/status', { status: status }).then(res => {
            $scope.successMsg = res.data.message;
            loadOutings();
        }).catch(err => {
            $scope.errorMsg = err.data?.error || "Failed to update status";
        });
    };

    loadOutings();
});

// Student Management Controller
app.controller('AdminStudentController', function ($scope, $http, API_URL) {
    $scope.students = [];
    $scope.hostels = [];
    $scope.showModal = false;
    $scope.isEditing = false;
    $scope.currentStudent = {};

    function loadStudents() {
        $http.get(API_URL + '/users/students').then(res => $scope.students = res.data);
    }
    
    $http.get(API_URL + '/hostels').then(res => $scope.hostels = res.data);

    $scope.openModal = function(student = null) {
        $scope.showModal = true;
        if(student) {
            $scope.isEditing = true;
            $scope.currentStudent = angular.copy(student);
        } else {
            $scope.isEditing = false;
            $scope.currentStudent = { course: 'None', gender: 'Male', year_of_study: 1 };
        }
    };

    $scope.closeModal = function() {
        $scope.showModal = false;
        $scope.currentStudent = {};
    };

    $scope.saveStudent = function() {
        if ($scope.isEditing) {
            $http.put(API_URL + '/users/students/' + $scope.currentStudent.id, $scope.currentStudent)
                .then(res => { loadStudents(); $scope.closeModal(); })
                .catch(err => alert("Error updating student"));
        } else {
            $http.post(API_URL + '/users/students', $scope.currentStudent)
                .then(res => { loadStudents(); $scope.closeModal(); })
                .catch(err => alert("Error adding student"));
        }
    };

    $scope.deleteStudent = function(id) {
        if(confirm("Are you sure you want to delete this student?")) {
            $http.delete(API_URL + '/users/students/' + id).then(res => loadStudents());
        }
    };

    loadStudents();
});

// Disciplinary Cases Controller
app.controller('AdminDCController', function ($scope, $http, $timeout, API_URL) {
    $scope.cases = [];
    $scope.students = [];
    $scope.newCase = { action_taken: 'Warning' };
    let dcChartInstance = null;

    function renderChart() {
        let actionCounts = { Warning: 0, Fine: 0, Suspension: 0, YB: 0 };
        $scope.cases.forEach(c => {
            if (actionCounts[c.action_taken] !== undefined) actionCounts[c.action_taken]++;
        });
        
        $timeout(() => {
            const ctx = document.getElementById('dcChart');
            if (!ctx || typeof Chart === 'undefined') return;
            if (dcChartInstance) dcChartInstance.destroy();
            
            dcChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Warning', 'Fine', 'Suspension', 'YB'],
                    datasets: [{
                        data: [actionCounts.Warning, actionCounts.Fine, actionCounts.Suspension, actionCounts.YB],
                        backgroundColor: ['#fef08a', '#93c5fd', '#fca5a5', '#1f2937'],
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
            });
        }, 100);
    }

    function loadCases() {
        $http.get(API_URL + '/dc').then(res => {
            $scope.cases = res.data;
            renderChart();
        });
    }

    $http.get(API_URL + '/users/students').then(res => $scope.students = res.data);

    $scope.addCase = function() {
        if(!$scope.newCase.student_id || !$scope.newCase.reason) return alert("Please fill details");
        $http.post(API_URL + '/dc', $scope.newCase).then(res => {
            $scope.newCase = { action_taken: 'Warning' };
            loadCases();
            alert("Disciplinary case logged successfully");
        }).catch(err => alert("Error adding case"));
    };

    $scope.deleteCase = function(id) {
        if(confirm("Delete this disciplinary case?")) {
            $http.delete(API_URL + '/dc/' + id).then(res => loadCases());
        }
    };

    loadCases();
});

// Property Damages Controller
app.controller('AdminDamageController', function ($scope, $http, $timeout, API_URL) {
    $scope.damages = [];
    $scope.students = [];
    $scope.newDamage = {};
    let damageChartInstance = null;

    function renderChart() {
        let statusCounts = { Pending: 0, Paid: 0 };
        $scope.damages.forEach(d => {
            if (statusCounts[d.status] !== undefined) statusCounts[d.status]++;
        });

        $timeout(() => {
            const ctx = document.getElementById('damageChart');
            if (!ctx || typeof Chart === 'undefined') return;
            if (damageChartInstance) damageChartInstance.destroy();

            damageChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Pending', 'Paid'],
                    datasets: [{
                        data: [statusCounts.Pending, statusCounts.Paid],
                        backgroundColor: ['#ef4444', '#10b981'],
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
            });
        }, 100);
    }

    function loadDamages() {
        $http.get(API_URL + '/damages').then(res => {
            $scope.damages = res.data;
            renderChart();
        });
    }

    $http.get(API_URL + '/users/students').then(res => $scope.students = res.data);

    $scope.addDamage = function() {
        if(!$scope.newDamage.student_id || !$scope.newDamage.item_damaged || !$scope.newDamage.damage_cost) return alert("Please fill all details");
        $http.post(API_URL + '/damages', $scope.newDamage).then(res => {
            $scope.newDamage = {};
            loadDamages();
            alert("Property damage logged successfully");
        }).catch(err => alert("Error adding damage"));
    };

    $scope.updateStatus = function(id, status) {
        $http.put(API_URL + '/damages/' + id + '/status', {status: status}).then(res => loadDamages());
    };

    $scope.deleteDamage = function(id) {
        if(confirm("Delete this damage record?")) {
            $http.delete(API_URL + '/damages/' + id).then(res => loadDamages());
        }
    };

    loadDamages();
});

// Maintenance Controller
app.controller('AdminMaintenanceController', function ($scope, $http, $timeout, API_URL) {
    $scope.records = [];
    let maintenanceChartInstance = null;

    function renderChart() {
        let stats = { Pending: 0, 'In Progress': 0, Resolved: 0 };
        $scope.records.forEach(m => {
            if(stats[m.status] !== undefined) stats[m.status]++;
        });

        $timeout(() => {
            const ctx = document.getElementById('maintenanceChart');
            if(!ctx || typeof Chart === 'undefined') return;
            if(maintenanceChartInstance) maintenanceChartInstance.destroy();

            maintenanceChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Pending', 'In Progress', 'Resolved'],
                    datasets: [{
                        data: [stats['Pending'], stats['In Progress'], stats['Resolved']],
                        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
            });
        }, 100);
    }

    function loadRecords() {
        $http.get(API_URL + '/maintenance').then(res => {
            $scope.records = res.data;
            renderChart();
        });
    }

    $scope.updateStatus = function (id, status) {
        $http.put(API_URL + '/maintenance/' + id + '/status', { status: status }).then(res => {
            loadRecords();
        }).catch(err => {
            console.error("Failed to update status", err);
        });
    };

    $scope.deleteMaintenance = function(id) {
        if(confirm("Delete this maintenance record?")) {
            $http.delete(API_URL + '/maintenance/' + id).then(res => loadRecords());
        }
    };

    loadRecords();
});

// Advanced Data Explorer Controller
app.controller('AdminExplorerController', function ($scope, $http, API_URL) {
    $scope.sqlQuery = '';
    $scope.queryResults = null;
    $scope.resultColumns = [];
    $scope.errorMsg = '';
    $scope.loading = false;

    $scope.clearInput = function() {
        $scope.sqlQuery = '';
        $scope.queryResults = null;
        $scope.resultColumns = [];
        $scope.errorMsg = '';
    };

    $scope.setQuery = function(query) {
        $scope.sqlQuery = query;
        $scope.executeQuery();
    };

    $scope.executeQuery = function() {
        if (!$scope.sqlQuery || $scope.sqlQuery.trim() === '') {
            $scope.errorMsg = 'Please enter a valid SQL query.';
            return;
        }

        $scope.loading = true;
        $scope.errorMsg = '';
        $scope.queryResults = null;
        $scope.resultColumns = [];

        $http.post(API_URL + '/admin/query', { query: $scope.sqlQuery })
            .then(function(res) {
                $scope.loading = false;
                if (res.data && res.data.success) {
                    $scope.queryResults = res.data.data;
                    if ($scope.queryResults && $scope.queryResults.length > 0) {
                        $scope.resultColumns = Object.keys($scope.queryResults[0]);
                    }
                }
            })
            .catch(function(err) {
                $scope.loading = false;
                console.error("Query execution error", err);
                $scope.errorMsg = err.data && err.data.error ? err.data.error : 'Failed to execute query';
            });
    };
});
