"use client";

import { Container } from "@/modules/shared/ui/core/Container";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Select from "react-select";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { completeRegistration } from "@/store/authSlice";
import Button from "@/modules/shared/ui/button/Button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { components } from "react-select";
import { setCookie } from "@/shared/lib/cookies";
import { useAppSelector } from "@/shared/hooks/useAppSelector";
import { fetchCategories } from "@/store/categorySlice";

const usernameSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .required("Username is required"),
});

const interestsSchema = Yup.object().shape({
  interests: Yup.array()
    .of(
      Yup.object().shape({
        value: Yup.string().required(),
        label: Yup.string().required(),
      }),
    )
    .min(1, "Select at least one interest")
    .required("Interests are required"),
});

export default function CompleteRegistration() {
  const dispatch = useDispatch<AppDispatch>();
  const { loadingCompleteRegistration, error } = useAppSelector(
    (state) => state.auth,
  );
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isUsernameCreated, setIsUsernameCreated] = useState<boolean | null>(
    null,
  );
  const { categories } = useAppSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Container>
        {!isUsernameCreated ? (
          <div>
            <div className="flex flex-col items-center">
              <h1 className="text-xl font-semibold">Create a username 👤</h1>
            </div>

            <Formik
              initialValues={{ username: username }}
              validationSchema={usernameSchema}
              onSubmit={(values, { setSubmitting }) => {
                setUsername(values.username);
                setIsUsernameCreated(true);
                setSubmitting(false);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col items-center gap-4 mt-5">
                  <div>
                    <Field
                      type="text"
                      name="username"
                      placeholder="Enter your username"
                      className="border p-3 rounded-lg text-sm w-64 text-center"
                    />
                    <ErrorMessage
                      name="username"
                      component="p"
                      className="text-red-500 text-xs mt-1 text-center"
                    />
                  </div>

                  <Button
                    buttonType="submit"
                    state={isSubmitting}
                    buttonText="Create Username"
                  />
                </Form>
              )}
            </Formik>
          </div>
        ) : (
          <div>
            <div className="flex flex-col items-center">
              <h1 className="text-xl font-semibold">
                Select your interests 🎯
              </h1>
            </div>

            <Formik<{
              interests: { value: string; label: string }[];
            }>
              initialValues={{ interests: [] }}
              validationSchema={interestsSchema}
              onSubmit={async (values, { setSubmitting }) => {
                const result = await dispatch(
                  completeRegistration({
                    username,
                    interests: values.interests.map((i) => i.value),
                  }),
                );

                if (completeRegistration.fulfilled.match(result)) {
                  setCookie("is_active", "true", 60 * 60 * 24 * 7);
                  router.push("/");
                }

                setSubmitting(false);
              }}
            >
              {({ isSubmitting, setFieldValue, values }) => (
                <Form className="flex flex-col items-center gap-4 mt-5">
                  <div className="w-64">
                    <Select
                      options={categories.map((cat) => ({
                        value: cat.id,
                        label: cat.name,
                      }))}
                      isMulti
                      isSearchable={false} // ← ключевая строка
                      name="interests"
                      value={values.interests}
                      onChange={(selected) =>
                        setFieldValue(
                          "interests",
                          selected as { value: string; label: string }[],
                        )
                      }
                      components={{
                        Input: (props) => (
                          <components.Input {...props} autoComplete="nope" /> // Chrome уважает random-value
                        ),
                      }}
                    />

                    <ErrorMessage
                      name="interests"
                      component="p"
                      className="text-red-500 text-xs mt-1 text-center"
                    />
                  </div>

                  <Button
                    buttonType="submit"
                    state={isSubmitting || loadingCompleteRegistration}
                    buttonText={
                      loadingCompleteRegistration
                        ? "Processing..."
                        : "Complete Registration"
                    }
                  />

                  {error && (
                    <p className="text-red-500 text-sm text-center">
                      Something went wrong...
                    </p>
                  )}
                </Form>
              )}
            </Formik>
          </div>
        )}
      </Container>
    </div>
  );
}
