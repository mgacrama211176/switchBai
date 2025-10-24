import { Game } from "@/app/types/games";

// Service for managing game comparison state and logic
export class GameComparisonService {
  static handleGameSelect(
    game: Game,
    selectedGames: Game[],
    setSelectedGames: React.Dispatch<React.SetStateAction<Game[]>>,
  ) {
    if (selectedGames.length >= 2) {
      alert("You can only compare up to 2 games at a time");
      return;
    }

    if (selectedGames.some((g) => g.gameBarcode === game.gameBarcode)) {
      alert("This game is already selected for comparison");
      return;
    }

    setSelectedGames((prev) => [...prev, game]);
  }

  static handleGameRemove(
    barcode: string,
    setSelectedGames: React.Dispatch<React.SetStateAction<Game[]>>,
  ) {
    setSelectedGames((prev) =>
      prev.filter((game) => game.gameBarcode !== barcode),
    );
  }

  static handleReset(
    setSelectedGames: React.Dispatch<React.SetStateAction<Game[]>>,
  ) {
    setSelectedGames([]);
  }

  static handleAddToCart(
    game: Game,
    cartItems: string[],
    setCartItems: React.Dispatch<React.SetStateAction<string[]>>,
  ) {
    if (game.gameAvailableStocks === 0) return;

    setCartItems((prev) => {
      if (prev.includes(game.gameBarcode)) {
        return prev;
      }
      return [...prev, game.gameBarcode];
    });

    console.log("Added to cart:", game.gameTitle);
  }

  static isInCart(barcode: string, cartItems: string[]): boolean {
    return cartItems.includes(barcode);
  }
}
