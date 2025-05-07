import Recommendations from "@/widgets/home/recommendations/Recommendations";
import LayoutWithNavigation from "@/app/LayoutWithNavigation";
import Header from "@/widgets/header/Header";
import TrendingEvents from "@/widgets/home/trending/TrendingEvents";

export default function Home() {
  return (
    <>
      <LayoutWithNavigation>
        <Header />
        <TrendingEvents />
        <Recommendations />
      </LayoutWithNavigation>
    </>
  );
}
