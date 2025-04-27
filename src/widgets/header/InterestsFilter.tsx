import Interest from "@/shared/ui/interest/Interest";

const interestsList = [
  "music",
  "sports",
  "travel",
  "cooking",
  "films",
  "art",
  "reading",
  "photo",
  "gaming",
];

export default function InterestsFilter({
  selectedInterests,
  setSelectedInterests,
}: {
  selectedInterests: string[];
  setSelectedInterests: (value: string[]) => void;
}) {
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  return (
    <div className="mt-2 h-9 flex items-center gap-2 overflow-scroll no-scrollbar">
      {interestsList.map((interest) => (
        <Interest
          key={interest}
          title={interest}
          active={selectedInterests?.includes(interest)}
          isButton={true}
          onClick={() => toggleInterest(interest)}
        />
      ))}
    </div>
  );
}
