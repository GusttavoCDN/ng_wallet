import { Route, Routes } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';

export function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="dashboard" element={<Dashboard />} />
    </Routes>
  );
}
