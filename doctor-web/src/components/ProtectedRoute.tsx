import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const doctorToken = localStorage.getItem('mc_doctor_jwt');
  
  if (!doctorToken) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{element}</>;
};

export default ProtectedRoute;
