import Interest from "@/shared/ui/interest/Interest";
import { useAppSelector } from "@/shared/hooks/useAppSelector";
import { useEffect } from "react";
import { useAppDispatch } from "@/shared/lib/storeHooks";
import { fetchCategories } from "@/store/categorySlice";

export default function InterestsFilter({
  selectedInterests,
  setSelectedInterests,
}: {
  selectedInterests: string[];
  setSelectedInterests: (value: string[]) => void;
}) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const { categories } = useAppSelector((state) => state.category);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  return (
    <div className="mt-2 h-11 flex items-center gap-2 overflow-scroll no-scrollbar">
      {categories.map((category) => (
        <Interest
          key={category.id}
          title={category.name}
          active={selectedInterests?.includes(category.name)}
          isButton={true}
          onClick={() => toggleInterest(category.name)}
        />
      ))}
    </div>
  );
}
