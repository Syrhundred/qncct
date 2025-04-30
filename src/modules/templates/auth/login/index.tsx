"use client";
import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/store/authSlice";
import { AppDispatch, RootState } from "@/store";
import { useRouter } from "next/navigation";
import { Container } from "@/modules/shared/ui/core/Container";
import Link from "next/link";
import Image from "next/image";
import Button from "@/modules/shared/ui/button/Button";

const validationSchema = Yup.object({
  identifier: Yup.string()
    .test(
      "is-email-or-phone",
      "Enter a valid email or phone number",
      (value) => {
        if (!value) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?\d{10,15}$/;
        return emailRegex.test(value) || phoneRegex.test(value);
      },
    )
    .required("Email or phone number is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const { error, isAuth, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorFromBack, setErrorFromBack] = useState("");
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ensure localStorage is accessed only on the client side
  const [isActive, setIsActive] = useState<string | null>(null);

  useEffect(() => {
    // Check for window object to make sure it's running in the browser
    if (isClient) {
      const activeStatus = localStorage.getItem("is_active");
      setIsActive(activeStatus);
    }
  }, [isClient]);

  useEffect(() => {
    if (isAuth) {
      if (isActive === "true") {
        router.replace("/");
      } else {
        router.push("/complete-registration");
      }
    }
  }, [isAuth, user, router, isActive]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Container>
        <div className="flex flex-col items-center gap-6">
          <h1>Welcome back!</h1>
          <span className="text-lightgray text-xs text-center">
            Enter your email or phone number and password to continue.
          </span>
          <Formik
            initialValues={{ identifier: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              const result = await dispatch(loginUser(values));

              if (!loginUser.fulfilled.match(result)) {
                setErrorFromBack("Invalid credentials. Please try again.");
              }

              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form className="flex flex-col space-y-4">
                <div>
                  <Field
                    type="text" // ✅ Changed to text to support email and phone
                    name="identifier"
                    placeholder="Email or Phone Number"
                    className="border p-3 rounded-lg w-full"
                  />
                  <ErrorMessage
                    name="identifier"
                    component="p"
                    className="text-red-500 text-xs"
                  />
                </div>

                <div className="relative">
                  <Field
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className="border p-3 rounded-lg w-full pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setPasswordVisible((prev) => !prev)}
                  >
                    {passwordVisible ? (
                      <Image
                        alt="eye"
                        src="/assets/img/login/eye-slash.svg"
                        width={20}
                        height={20}
                      />
                    ) : (
                      <Image
                        alt="eye"
                        src="/assets/img/login/eye.svg"
                        width={20}
                        height={20}
                      />
                    )}
                  </button>
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-red-500 text-xs"
                  />
                </div>

                <Link
                  href="/reset"
                  className="text-xs bg-gradient bg-clip-text text-transparent"
                >
                  Forgot Password?
                </Link>
                <Button
                  buttonType="submit"
                  state={isSubmitting || loading}
                  buttonText={loading ? "Logging in..." : "Sign In"}
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}
                <p className="text-red-500 text-sm">{errorFromBack}</p>
              </Form>
            )}
          </Formik>
          <div className="flex gap-1">
            <span className="text-xs text-lightgray">
              Don&#39;t have an account?
            </span>
            <Link
              href="/register"
              className="text-xs bg-gradient bg-clip-text text-transparent"
            >
              Sign Up
            </Link>
          </div>
          <div className="border-t h-[1px] w-full"></div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs text-lightgray">Or continue with</span>
            <Link href="https://web-production-f0f5.up.railway.app/api/v1/auth/google/login">
              <Image
                width={40}
                height={40}
                src="/assets/img/login/google.svg"
                alt="google"
              />
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
