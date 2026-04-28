const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '../frontend/views/admin');
const studentDir = path.join(__dirname, '../frontend/views/student');

function updateSidebars(dir) {
    fs.readdirSync(dir).forEach(file => {
        if(file.endsWith('.html')) {
            const p = path.join(dir, file);
            let content = fs.readFileSync(p, 'utf8');
            
            // Add Maintenance under Discipline or Complaints
            if (dir === adminDir) {
                // First revert complaints if needed
                content = content.replace('Complaints / Maintenance', 'Complaints');
                content = content.replace('Manage Complaints & Maintenance', 'Manage Complaints');
                content = content.replace('Manage Complaints &amp; Maintenance', 'Manage Complaints');

                // If maintenance link isn't already there
                if (!content.includes('admin/maintenance')) {
                    content = content.replace(
                        '<li><a href="#!/admin/discipline">Discipline (DC)</a></li>',
                        '<li><a href="#!/admin/discipline">Discipline (DC)</a></li>\n            <li><a href="#!/admin/maintenance">Maintenance</a></li>'
                    );
                    content = content.replace(
                        '<li><a href="#!/admin/discipline" class="active">Discipline (DC)</a></li>',
                        '<li><a href="#!/admin/discipline" class="active">Discipline (DC)</a></li>\n            <li><a href="#!/admin/maintenance">Maintenance</a></li>'
                    );
                }
            } else if (dir === studentDir) {
                // If maintenance link isn't already there
                if (!content.includes('student/maintenance')) {
                    content = content.replace(
                        '<li><a href="#!/student/outings">Outings</a></li>',
                        '<li><a href="#!/student/outings">Outings</a></li>\n            <li><a href="#!/student/maintenance">Maintenance</a></li>'
                    );
                    content = content.replace(
                        '<li><a href="#!/student/outings" class="active">Outings</a></li>',
                        '<li><a href="#!/student/outings" class="active">Outings</a></li>\n            <li><a href="#!/student/maintenance">Maintenance</a></li>'
                    );
                }
            }
            
            fs.writeFileSync(p, content);
            console.log("Updated", file);
        }
    });
}

updateSidebars(adminDir);
updateSidebars(studentDir);
