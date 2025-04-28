"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { verifyCode, verifyPhone, verifyToken } from "@/store/authSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/modules/shared/ui/core/Container";
import Button from "@/modules/shared/ui/button/Button";
import React, { Suspense, useEffect, useRef, useState } from "react";

// Валидация
const phoneSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^\+?\d{10,15}$/, "Phone number is not correct")
    .required("Phone number is required"),
});

const codeSchema = Yup.object().shape({
  code: Yup.array()
    .of(Yup.string().matches(/^\d$/, "Each digit must be a number"))
    .length(6, "Code must be exactly 6 digits")
    .required("Code is required"),
});

export default function VerifyPhone() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const searchParams = useSearchParams();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get("token");
      if (token) {
        try {
          const result = await dispatch(verifyToken(token)).unwrap();
          if (!result?.token) {
            router.push("/register");
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          router.push("/register");
        }
      } else {
        router.push("/register");
      }
    };

    verify();
  }, [dispatch, searchParams, router]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Container>
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-center">
              {isCodeSent
                ? "Enter verification code"
                : "Let's add your phone number"}
            </h1>
            <span className="text-lightgray text-xs">
              {isCodeSent
                ? "We sent a code to your phone"
                : "We'll send you a confirmation code"}
            </span>
          </div>

          {/* Форма ввода телефона */}
          {!isCodeSent ? (
            <Formik
              key="phone-form"
              initialValues={{ phone: "" }}
              validationSchema={phoneSchema}
              onSubmit={async (values, { setSubmitting }) => {
                const result = await dispatch(verifyPhone(values.phone));

                if (verifyPhone.fulfilled.match(result)) {
                  setPhoneNumber(values.phone);
                  setIsCodeSent(true);
                }
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, values, setFieldValue }) => (
                <Form className="flex flex-col gap-3 mt-3">
                  <div>
                    <Field
                      type="text"
                      name="phone"
                      value={values.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        let value = e.target.value.replace(/\D/g, ""); // Удаляем все, кроме цифр
                        if (value.length > 0) {
                          value = "+" + value; // Добавляем "+" в начало
                        }
                        setFieldValue("phone", value);
                      }}
                      placeholder="+79991234567"
                      className="border p-3 rounded-lg text-sm w-full"
                    />
                    <ErrorMessage
                      name="phone"
                      component="p"
                      className="text-red-500 text-xs"
                    />
                  </div>

                  <Button
                    buttonType="submit"
                    state={isSubmitting || loading}
                    buttonText={loading ? "Sending..." : "Send Code"}
                  />

                  {error && (
                    <p className="text-red-500 text-sm">
                      Something went wrong...
                    </p>
                  )}
                </Form>
              )}
            </Formik>
          ) : (
            // Форма ввода 6-значного кода
            <Formik
              key="code-form"
              initialValues={{ code: ["", "", "", "", "", ""] }}
              validationSchema={codeSchema}
              onSubmit={async (values, { setSubmitting }) => {
                const verificationCode = values.code.join(""); // ✅ Преобразуем массив в строку
                const result = await dispatch(
                  verifyCode({
                    phone_number: phoneNumber,
                    verification_code: verificationCode,
                  }),
                );

                if (verifyCode.fulfilled.match(result)) {
                  router.push("/complete-registration");
                }
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
                          const value = e.target.value.replace(/\D/g, ""); // Оставляем только цифры
                          if (value.length > 1) return;

                          const newCode = [...values.code];
                          newCode[index] = value;
                          setFieldValue("code", newCode);

                          // Переключение фокуса на следующее поле
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

                  <ErrorMessage
                    name="code"
                    component="p"
                    className="text-red-500 text-xs text-center"
                  />
                  <Button
                    buttonType="submit"
                    state={isSubmitting || loading}
                    buttonText={loading ? "Verifying..." : "Verify Code"}
                  />
                  {error && (
                    <p className="text-red-500 text-sm text-center">
                      Something went wrong...
                    </p>
                  )}
                </Form>
              )}
            </Formik>
          )}
        </Container>
      </div>
    </Suspense>
  );
}
