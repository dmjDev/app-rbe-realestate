export const SEARCH_OPERATION_TYPES: Record<string, { "EN": string, "ES": string }> = {
  "SALE": {
    EN: "BUY",
    ES: "COMPRAR"
  }
  ,
  "RENT": {
    EN: "RENT",
    ES: "ALQUILER"
  }
  ,
  "RENT_TO_BUY": {
    EN: "RENT TO BUY",
    ES: "ALQUILER CON OPCIÓN A COMPRA"
  }
  ,
  "HOLIDAY_RENT": {
    EN: "VACATION RENT",
    ES: "ALQUILER VACACIONAL"
  }
  ,
  "LIFE_ESTATE": {
    EN: "INVESTMENT",
    ES: "INVERSIÓN"
  }
  ,
  "SHARE": { // ROOMS, COMMERCIAL_PROPERTIES, STORAGE_ROOMS, LAND, OFFICES
    EN: "ROOMMATE & COLIVING & COWORKING",
    ES: "COMPARTIR"
  }
  ,
  "TRANSFER": {
    EN: "TAKE OVER",
    ES: "TRASPASO"
  }
};

export const OPTION = Object.keys(SEARCH_OPERATION_TYPES);
