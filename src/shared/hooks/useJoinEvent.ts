import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useAppSelector } from "./useAppSelector";
import { joinEvent, unjoinEvent, setEventJoinState } from "@/store/eventSlice";
import { toast } from "sonner";
import { IEvent } from "@/shared/types/types";

export const useJoinEvent = (event: IEvent | null) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useAppSelector((state) => state.user);

  if (!event) {
    return {
      handleJoin: () => {},
      handleUnjoin: () => {},
      isJoined: false,
      isOwner: false,
    };
  }

  const handleJoin = async () => {
    if (!event?.id) return;
    const result = await dispatch(joinEvent(event.id));
    if (joinEvent.fulfilled.match(result)) {
      dispatch(setEventJoinState(true));
      toast.success("You've successfully joined the event!");
    } else {
      toast.error("Failed to join the event.");
    }
  };

  const handleUnjoin = async () => {
    if (!event?.id) return;
    const result = await dispatch(unjoinEvent(event.id));
    if (unjoinEvent.fulfilled.match(result)) {
      dispatch(setEventJoinState(false));
      toast.success("You've successfully unjoined the event.");
    } else {
      toast.error("Failed to unjoin the event.");
    }
  };

  const isOwner =
    event?.created_by?.profile?.username === user?.profile?.username;
  const isJoined = event?.is_joined || false;

  return {
    handleJoin,
    handleUnjoin,
    isJoined,
    isOwner,
  };
};
