import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from '../components/Layout';
import { Applications } from '../features/applications';
import { Roles } from '../features/roles';
import { Users } from '../features/users';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/applications" replace />} />
        <Route path="applications" element={<Applications />} />
        <Route path="roles" element={<Roles />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;