import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { authService } from "../../services";
import { Card, Spinner, Button } from "../../components/ui";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await authService.verifyEmail(token);
        setMessage(data.message);
        setStatus("success");
      } catch (err) {
        setMessage(
          err.response?.data?.message || "Verification failed or link expired",
        );
        setStatus("error");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <Card.Body className="space-y-6 text-center">
          {status === "loading" && (
            <>
              <Spinner />
              <p className="text-text-secondary">Verifying your email...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text-primary">
                Email Verified!
              </h1>
              <p className="text-text-secondary">{message}</p>
              <Link to="/login">
                <Button className="w-full">Sign In</Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text-primary">
                Verification Failed
              </h1>
              <p className="text-text-secondary">{message}</p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
