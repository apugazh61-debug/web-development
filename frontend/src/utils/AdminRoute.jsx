import { useState } from 'react';
import PropTypes from 'prop-types';
import AdminLogin from '../components/Admin/AdminLogin';

const AdminRoute = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');

    if (!isAdmin) {
        return <AdminLogin onLoginSuccess={() => setIsAdmin(true)} />;
    }

    return children;
};

AdminRoute.propTypes = {
    children: PropTypes.node.isRequired
};

export default AdminRoute;
