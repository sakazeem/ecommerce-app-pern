import requests from "./httpServices";

const FavouriteService = {
  getFavourites: () => requests.get("/favourites"),
  toggleFavourite: (product_id) =>
    requests.post("/favourites/toggle", { product_id }),
  syncFavourites: (productIds) =>
    requests.post("/favourites/sync", { productIds }),
};

export default FavouriteService;
