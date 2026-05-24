# Part 4: Frontend Architecture & Global State

This module breaks down the structure of our React application, focusing on client routing, dynamic state, global contexts, and API services integration.

---

## 1. Global Session Management with React Context API

In large React applications, passing user variables down through multiple layers of components (prop drilling) becomes messy. To solve this, we created `AuthContext.jsx`.

### A. Context Provider (`AuthProvider`)
The context provider acts as a global store. It wraps the entire application (`App.jsx`) and exposes state variables:
* `user`: Stores decoded name, email, and role.
* `loading`: Indicates whether the app is validating a saved token on startup.
* Helper boolean flags: `isAuthenticated`, `isAdmin`, `isAgent`, `isSeller`, `isBuyer`.

### B. Startup Session Verification
When the user refreshes their browser, the React application restarts. To keep them logged in, `AuthContext` has a `useEffect` hook that checks for a stored token:

```javascript
useEffect(() => {
  const initializeAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Fetch fresh profile data using the saved token
        const profileData = await authAPI.getProfile();
        setUser(profileData);
      } catch (error) {
        // Token was invalid or expired
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  };
  initializeAuth();
}, []);
```

---

## 2. Dynamic HTTP Interceptors (Axios Setup)

Every time the frontend requests protected resources (like booking a visit or loading dashboard stats), it must present its JWT token.
Instead of manually adding the `Authorization` header to every individual `axios.get` or `axios.post` call, we configured a dynamic interceptor in `frontend/src/services/api.js`:

```javascript
// Automatically inject JWT token into all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

Whenever a request is sent, this interceptor intercepts it, reads the token from `localStorage`, appends it to the header as `Bearer <token>`, and passes it to the server seamlessly.

---

## 3. Dynamic State-Driven List Filtering

In `Listings.jsx`, our filters are tied directly to React state values:

```javascript
const [location, setLocation] = useState('');
const [type, setType] = useState('all');
const [minPrice, setMinPrice] = useState('');
const [maxPrice, setMaxPrice] = useState('');
const [rooms, setRooms] = useState('all');
const [availability, setAvailability] = useState('available');
```

Whenever any of these state variables change (for example, when a user selects "Commercial" instead of "Residential" in the dropdown), it triggers a `useEffect` hook to fetch filtered data from our API:

```javascript
useEffect(() => {
  fetchFilteredProperties();
}, [location, type, minPrice, maxPrice, rooms, availability]);
```

React detects the update, triggers the API call with the new filter parameters, retrieves the matching properties, and updates the local `properties` array. React then automatically re-renders only the changed listing cards in the grid.
