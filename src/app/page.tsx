import Recommendations from "@/widgets/home/recommendations/Recommendations";
import LayoutWithNavigation from "@/app/LayoutWithNavigation";
import Header from "@/widgets/header/Header";

export default function Home() {
  return (
    <>
      <LayoutWithNavigation>
        <Header />
        <Recommendations />
      </LayoutWithNavigation>
    </>
  );
}
