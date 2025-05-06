"use client";

import React, { useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Container } from "@/modules/shared/ui/core/Container";
import Button from "@/modules/shared/ui/button/Button";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { forgotPassword, verifyCodeResetPassword } from "@/store/authSlice";
import { useRouter } from "next/navigation";

const validationSchema = Yup.object().shape({
  email: Yup.string()
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
});

const codeSchema = Yup.object().shape({
  code: Yup.array()
    .of(Yup.string().matches(/^\d$/, "Each digit must be a number"))
    .length(6, "Code must be exactly 6 digits")
    .required("Code is required"),
});

export default function ResetPassword() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Container>
        <div className="flex flex-col items-center gap-6">
          <h1>
            {!isCodeSent
              ? "Forgot Password"
              : isCodeVerified
                ? "Create New Password"
                : "Enter Verification Code"}
          </h1>

          <span className="text-lightgray text-xs text-center">
            {!isCodeSent
              ? "Enter your email or phone number to reset the password."
              : isCodeVerified
                ? "Set a new password for your account."
                : "Enter the 6-digit verification code sent to your email/phone."}
          </span>

          {!isCodeSent && (
            <Formik
              initialValues={{ email }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting }) => {
                setError(null);

                const result = await dispatch(
                  forgotPassword({ email: values.email }),
                );

                if (forgotPassword.fulfilled.match(result)) {
                  setEmail(values.email);
                  setIsCodeSent(true);
                } else {
                  setError("Failed to send verification code.");
                }
                setSubmitting(false);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col space-y-4 w-full max-w-sm">
                  <div>
                    <Field
                      type="text"
                      name="email"
                      placeholder="Email or Phone Number"
                      className="border p-3 rounded-lg text-sm w-full"
                    />
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="text-red-500 text-xs"
                    />
                  </div>

                  <Button
                    buttonType="submit"
                    state={isSubmitting}
                    buttonText="Send Code"
                  />
                </Form>
              )}
            </Formik>
          )}

          {isCodeSent && !isCodeVerified && (
            <Formik
              key="code-form"
              initialValues={{ code: ["", "", "", "", "", ""] }}
              validationSchema={codeSchema}
              onSubmit={async (values, { setSubmitting }) => {
                setVerificationCode(values.code.join("")); // ✅ Преобразуем массив в строку
                setIsCodeVerified(true); // ✅ Переход к вводу пароля
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, values, setFieldValue }) => (
                <Form className="flex flex-col gap-3 mt-3">
                  <div className="flex justify-center gap-2">
                    {values.code.map((_, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        className="border p-3 rounded-lg text-sm w-12 h-12 text-center"
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        value={values.code[index]}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length > 1) return;

                          const newCode = [...values.code];
                          newCode[index] = value;
                          setFieldValue("code", newCode);

                          if (value && index < 5) {
                            inputRefs.current[index + 1]?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Backspace" &&
                            !values.code[index] &&
                            index > 0
                          ) {
                            inputRefs.current[index - 1]?.focus();
                          }
                        }}
                      />
                    ))}
                  </div>

                  <Button
                    buttonType="submit"
                    state={isSubmitting}
                    buttonText={isSubmitting ? "Verifying..." : "Verify Code"}
                  />
                </Form>
              )}
            </Formik>
          )}

          {/* ✅ Ввод нового пароля */}
          {isCodeVerified && (
            <Formik
              initialValues={{
                password: "",
                confirmPassword: "",
              }}
              validationSchema={Yup.object().shape({
                password: Yup.string()
                  .min(6, "Password must be at least 6 characters")
                  .required("Required"),
                confirmPassword: Yup.string()
                  .oneOf(
                    [Yup.ref("password"), undefined],
                    "Passwords must match",
                  )
                  .required("Required"),
              })}
              onSubmit={async (values, { setSubmitting }) => {
                const result = await dispatch(
                  verifyCodeResetPassword({
                    email,
                    verification_code: verificationCode,
                    new_password: values.password,
                  }),
                );

                if (verifyCodeResetPassword.fulfilled.match(result)) {
                  alert("Now you have a new password!");
                  router.push("/login");
                }
                setSubmitting(false);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col gap-3 mt-3">
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

                  <Button
                    buttonType="submit"
                    state={isSubmitting}
                    buttonText={isSubmitting ? "Registering..." : "Register"}
                  />

                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </Form>
              )}
            </Formik>
          )}
        </div>
      </Container>
    </div>
  );
}
