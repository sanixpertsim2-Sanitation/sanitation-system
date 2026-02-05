/**
 * Employee Database Configuration
 * In production, this should be replaced with actual HR system integration
 */

window.SANIXPERT_EMPLOYEES = {
    // Production employee database
    employees: {
        '100001': { name: 'John Smith', department: 'sanitation', role: 'Sanitation Specialist' },
        '100002': { name: 'Sarah Johnson', department: 'maintenance', role: 'Maintenance Technician' },
        '100003': { name: 'Mike Davis', department: 'production', role: 'Production Operator' },
        '100004': { name: 'Emily Wilson', department: 'sanitation', role: 'Sanitation Lead' },
        '100005': { name: 'David Brown', department: 'maintenance', role: 'Maintenance Lead' },
        '100006': { name: 'Lisa Anderson', department: 'production', role: 'Production Supervisor' },
        '100007': { name: 'James Taylor', department: 'sanitation', role: 'Sanitation Specialist' },
        '100008': { name: 'Maria Garcia', department: 'maintenance', role: 'Maintenance Technician' },
        '100009': { name: 'Robert Martinez', department: 'production', role: 'Production Operator' },
        '100010': { name: 'Jennifer Lee', department: 'sanitation', role: 'Quality Inspector' },
        '100011': { name: 'William Chen', department: 'maintenance', role: 'Maintenance Technician' },
        '100012': { name: 'Amanda Foster', department: 'production', role: 'Production Lead' },
        '100013': { name: 'Christopher Kim', department: 'sanitation', role: 'Sanitation Specialist' },
        '100014': { name: 'Jessica Rodriguez', department: 'maintenance', role: 'Maintenance Supervisor' },
        '100015': { name: 'Daniel Thompson', department: 'production', role: 'Production Operator' }
    },

    /**
     * Get employee by ID
     */
    getEmployee: function(employeeId) {
        return this.employees[employeeId] || null;
    },

    /**
     * Get employee name by ID
     */
    getEmployeeName: function(employeeId) {
        const employee = this.getEmployee(employeeId);
        return employee ? employee.name : null;
    },

    /**
     * Get all employees by department
     */
    getEmployeesByDepartment: function(department) {
        const result = {};
        for (const [id, employee] of Object.entries(this.employees)) {
            if (employee.department === department) {
                result[id] = employee;
            }
        }
        return result;
    },

    /**
     * Validate employee ID format
     */
    isValidEmployeeId: function(employeeId) {
        return /^[0-9]{6}$/.test(employeeId) && this.employees.hasOwnProperty(employeeId);
    },

    /**
     * Search employees by name
     */
    searchEmployeesByName: function(searchTerm) {
        const result = {};
        const lowerSearch = searchTerm.toLowerCase();
        
        for (const [id, employee] of Object.entries(this.employees)) {
            if (employee.name.toLowerCase().includes(lowerSearch)) {
                result[id] = employee;
            }
        }
        return result;
    }
};
