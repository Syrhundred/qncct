"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/store/authSlice";
import { AppDispatch, RootState } from "@/store";
import { useRouter } from "next/navigation";
import { Container } from "@/modules/shared/ui/core/Container";
import Button from "@/modules/shared/ui/button/Button";
import Link from "next/link";
import { toast } from "sonner";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), ""], "Passwords must match")
    .required("Confirm password is required"),
  // terms: Yup.boolean().oneOf(
  //   [true],
  //   "You must accept the terms and conditions",
  // ),
});

export default function Register() {
  const dispatch = useDispatch<AppDispatch>();
  const { loadingRegister, error } = useSelector(
    (state: RootState) => state.auth,
  );
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Container>
        <div className="flex flex-col items-center gap-3">
          <h1>Create Account</h1>
          <span className="text-lightgray text-xs">
            Create an account to get started.
          </span>
        </div>

        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            terms: false,
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            const result = await dispatch(registerUser(values));

            if (registerUser.fulfilled.match(result)) {
              toast.success(
                "Account created successfully! Please confirm your email to continue.",
              );
              router.push("/login");
            }
            setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col gap-3 mt-3">
              <div>
                <span className="text-xs">Email Address</span>
                <Field
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="border p-3 rounded-lg text-sm w-full"
                />
                <ErrorMessage
                  name="email"
                  component="p"
                  className="text-red-500 text-xs"
                />
              </div>

              {/* Password */}
              <div>
                <span className="text-xs">Password</span>
                <Field
                  type="password"
                  name="password"
                  placeholder="Create Password"
                  className="border p-3 rounded-lg text-sm w-full"
                />
                <ErrorMessage
                  name="password"
                  component="p"
                  className="text-red-500 text-xs"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <Field
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="border p-3 rounded-lg text-sm w-full"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="p"
                  className="text-red-500 text-xs"
                />
              </div>
              <ErrorMessage
                name="terms"
                component="p"
                className="text-red-500 text-xs"
              />

              {/* Register Button */}
              <Button
                buttonType="submit"
                state={isSubmitting || loadingRegister}
                buttonText={loadingRegister ? "Registering..." : "Register"}
              />
              <div className="flex gap-1 justify-center">
                <span className="text-xs text-lightgray">
                  Already have an account?
                </span>
                <Link
                  href="/login"
                  className="text-xs bg-gradient bg-clip-text text-transparent"
                >
                  Sign In
                </Link>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </Form>
          )}
        </Formik>
      </Container>
    </div>
  );
}
