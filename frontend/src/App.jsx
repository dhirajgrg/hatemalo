import { RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider, ListingProvider, CategoryProvider } from "./context";
import router from "./router";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CategoryProvider>
          <ListingProvider>
            <RouterProvider router={router} />
          </ListingProvider>
        </CategoryProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
