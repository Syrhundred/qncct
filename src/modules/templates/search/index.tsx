import SearchBar from "@/widgets/header/searchbar/SearchBar";
import { Container } from "@/modules/shared/ui/core/Container";
import YandexMap from "@/shared/ui/map/YandexMap";
export default function SearchMap() {
  return (
    <div>
      <div className="w-full absolute z-50 flex flex-col items-center pt-6">
        <Container>
          <SearchBar></SearchBar>
        </Container>
      </div>
      <YandexMap containerSize="h-screen" />
    </div>
  );
}
