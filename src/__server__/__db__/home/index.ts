// FOLLOWING CODES ARE MOCK SERVER IMPLEMENTATION
// YOU NEED TO BUILD YOUR OWN SERVER
// IF YOU NEED HELP ABOUT SERVER SIDE IMPLEMENTATION
// CONTACT US AT support@ui-lib.com

import MockAdapter from "axios-mock-adapter";
import * as db from "./data";

export const HomeEndpoints = (Mock: MockAdapter) => {
  const flashItems = db.products.filter((item) => item.for.type === "flash-deals");
  Mock.onGet("/api/home/products?tag=flash").reply(async () => {
    try {
      return [200, flashItems];
    } catch (err) {
      console.error(err);
      return [500, { message: "Internal server error" }];
    }
  });

  const newItems = db.products.filter((item) => item.for.type === "new-arrivals");
  Mock.onGet("/api/home/products?tag=new").reply(() => {
    try {
      return [200, newItems];
    } catch (err) {
      console.error(err);
      return [500, { message: "Internal server error" }];
    }
  });

  const trendingItems = db.products.filter((item) => item.for.type === "trending-items");
  Mock.onGet("/api/home/products?tag=trending").reply(() => {
    try {
      return [200, trendingItems];
    } catch (err) {
      console.error(err);
      return [500, { message: "Internal server error" }];
    }
  });

  Mock.onGet("/api/home/service-list").reply(() => {
    try {
      return [200, db.serviceList];
    } catch (err) {
      console.error(err);
      return [500, { message: "Internal server error" }];
    }
  });

  Mock.onGet("/api/home/hot-deals").reply(() => {
    try {
      return [200, db.hotDealsData];
    } catch (err) {
      console.error(err);
      return [500, { message: "Internal server error" }];
    }
  });
};
