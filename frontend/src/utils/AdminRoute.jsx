import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const AdminRoute = ({ children }) => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    return isAdmin ? children : <Navigate to="/login" replace />;
};

AdminRoute.propTypes = {
    children: PropTypes.node.isRequired
};

export default AdminRoute;
