// Check if user is authenticated
export const isAuthenticated = () => {
    const adminInfo = localStorage.getItem('adminInfo');
    return !!adminInfo;
  };
  
  // Get admin info
  export const getAdminInfo = () => {
    const adminInfo = localStorage.getItem('adminInfo');
    return adminInfo ? JSON.parse(adminInfo) : null;
  };
  
  // Get auth token
  export const getToken = () => {
    const adminInfo = getAdminInfo();
    return adminInfo ? adminInfo.token : null;
  };