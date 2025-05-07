"use client";

import { Container } from "@/modules/shared/ui/core/Container";
import GoBackButton from "@/modules/shared/ui/goback-button/GoBackButton";
import PhotoUpload from "@/shared/ui/photoupload/PhotoUpload";
import LocationAutocompleteYandex from "@/shared/ui/map/LocationAutocompleteYandex";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { FormControl, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/ru";
import Button from "@/modules/shared/ui/button/Button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchCategories } from "@/store/categorySlice";
import { createEvent, fetchEvents } from "@/store/eventSlice";
import { FormikTimePicker } from "@/widgets/create-event/FormikTimePicker";
import "dayjs/plugin/utc";
import { useRouter } from "next/navigation";
import CreateEventSkeleton from "@/shared/ui/skeletons/CreateEventSkeleton";

dayjs.extend(utc);
dayjs.locale("ru");

export type UploadedImage = {
  file: File;
};

export default function CreateEvent() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, isLoading } = useSelector(
    (state: RootState) => state.category,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (isLoading) {
    return <CreateEventSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Container>
        <div className="absolute top-8">
          <GoBackButton />
        </div>
        <h2 className="text-center my-7">Create Event</h2>

        <Formik
          initialValues={{
            cover: null as UploadedImage | null,
            images: [] as UploadedImage[],
            name: "",
            category_id: "",
            address: "",
            latitude: 0,
            longitude: 0,
            date: null as Dayjs | null,
            time: null as Dayjs | null,
            description: "",
          }}
          validationSchema={Yup.object({
            cover: Yup.object({ file: Yup.mixed().required() }).required(
              "Cover is required",
            ),
            images: Yup.array().of(
              Yup.object({ file: Yup.mixed().required() }),
            ),
            name: Yup.string().required("Required"),
            category_id: Yup.string().required("Required"),
            address: Yup.string().required("Select location"),
            date: Yup.date().required("Required"),
            time: Yup.date().required("Required"),
            description: Yup.string().required("Required"),
          })}
          onSubmit={(values) => {
            setIsSubmitting(true);

            const combinedDateTime =
              values.date && values.time
                ? dayjs(values.date)
                    .set("hour", values.time.hour())
                    .set("minute", values.time.minute())
                    .set("second", 0)
                    .set("millisecond", 0)
                    .utc()
                    .toISOString()
                : "";

            dispatch(
              createEvent({
                banner: values.cover!.file,
                images: values.images.map((img) => img.file),
                name: values.name,
                category_id: values.category_id,
                address: values.address,
                latitude: values.latitude,
                longitude: values.longitude,
                date: combinedDateTime,
                description: values.description,
              }),
            );
            dispatch(fetchEvents());
            setTimeout(() => setIsSubmitting(false), 1500);
            router.push("/");
            router.refresh();
          }}
        >
          {({ setFieldValue, values, touched, errors }) => (
            <Form className="flex flex-col gap-5 my-6">
              <PhotoUpload
                cover={values.cover}
                images={values.images}
                onCoverChange={(newCover) => setFieldValue("cover", newCover)}
                onImagesChange={(newImages) =>
                  setFieldValue("images", newImages)
                }
              />

              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold">Event name</label>
                <input
                  name="name"
                  type="text"
                  value={values.name}
                  onChange={(e) => setFieldValue("name", e.target.value)}
                  placeholder="Enter"
                  className="border p-3 rounded-lg text-sm w-full"
                />
                {touched.name && errors.name && (
                  <span className="text-red-500 text-xs">{errors.name}</span>
                )}
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold">Event category</label>
                {isLoading ? (
                  <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <select
                    name="category"
                    value={values.category_id}
                    onChange={(e) =>
                      setFieldValue("category_id", e.target.value)
                    }
                    className="border p-3 rounded-lg text-sm w-full bg-white"
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}

                {touched.category_id && errors.category_id && (
                  <span className="text-red-500 text-xs">
                    {errors.category_id}
                  </span>
                )}
              </div>

              {/* Location */}
              <FormControl>
                <Typography className="text-sm font-bold mb-1">
                  Event Location
                </Typography>
                <LocationAutocompleteYandex
                  onSelect={(place) => {
                    const fullAddress = `${place.name}, ${place.description}`;
                    setFieldValue("address", fullAddress);
                    setFieldValue("latitude", place.coordinates[1]);
                    setFieldValue("longitude", place.coordinates[0]);
                  }}
                />
                {touched.address && errors.address && (
                  <Typography variant="caption" color="error">
                    {errors.address}
                  </Typography>
                )}
              </FormControl>

              {/* Date & Time */}
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="ru"
              >
                <div className="flex gap-3">
                  <div className="flex flex-col gap-3">
                    <Typography className="text-sm font-bold">
                      Select Date
                    </Typography>
                    <DatePicker
                      label="Date"
                      value={values.date}
                      onChange={(val) => setFieldValue("date", val)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: touched.date && Boolean(errors.date),
                          helperText: touched.date && errors.date,
                        },
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <Typography className="text-sm font-bold">
                      Select Time
                    </Typography>
                    <FormikTimePicker name="time" />
                  </div>
                </div>
              </LocalizationProvider>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold">Event description</label>
                <input
                  name="description"
                  type="text"
                  value={values.description}
                  onChange={(e) => setFieldValue("description", e.target.value)}
                  placeholder="Enter description"
                  className="border p-3 rounded-lg text-sm w-full"
                />
                {touched.description && errors.description && (
                  <span className="text-red-500 text-xs">
                    {errors.description}
                  </span>
                )}
              </div>

              <Button
                buttonType="submit"
                buttonText={isSubmitting ? "Submitting..." : "Continue"}
                state={isSubmitting}
              />
            </Form>
          )}
        </Formik>
      </Container>
    </div>
  );
}
