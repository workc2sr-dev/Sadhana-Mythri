import { useLocation, useNavigate } from "react-router-dom";

// Fixed top-left button that navigates back to the previous page
export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/") return null;

  return (
    <button
      type="button"
      className="back-button"
      onClick={() => navigate(-1)}
      aria-label="Go back"
    >
      ← Back
    </button>
  );
}
