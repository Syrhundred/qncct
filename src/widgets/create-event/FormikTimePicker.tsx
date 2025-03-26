import { TimePicker } from "@mui/x-date-pickers";
import { useFormikContext } from "formik";
import { Dayjs } from "dayjs";

interface EventFormValues {
  name: string;
  category_id: string;
  address: string;
  latitude: number;
  longitude: number;
  date: Dayjs | null;
  time: Dayjs | null;
  description: string;
}

export const FormikTimePicker = ({ name }: { name: keyof EventFormValues }) => {
  const { values, setFieldValue, setFieldTouched, touched, errors } =
    useFormikContext<EventFormValues>();

  return (
    <TimePicker
      label="Time"
      value={values[name] as Dayjs | null}
      onChange={(val: Dayjs | null) => {
        const cleaned = val?.set("second", 0).set("millisecond", 0) ?? null;
        setFieldValue(name, cleaned, true);
      }}
      onAccept={(val: Dayjs | null) => {
        const cleaned = val?.set("second", 0).set("millisecond", 0) ?? null;
        setFieldValue(name, cleaned, true);
      }}
      onClose={() => {
        setFieldTouched(name, true);
      }}
      slotProps={{
        textField: {
          fullWidth: true,
          error: !!(touched[name] && errors[name]),
          helperText:
            touched[name] && typeof errors[name] === "string"
              ? errors[name]
              : undefined,
        },
      }}
    />
  );
};
