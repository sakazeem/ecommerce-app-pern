import axios from "axios";
import requests from "./httpService";

const SettingServices = {
  // ─── Global Setting ─────────────────────────────────────────────────────
  addGlobalSetting: async (body) => requests.post("/setting/global/add", body),
  getGlobalSetting: async () => null, // kept for legacy
  updateGlobalSetting: async (body) =>
    requests.put("/setting/global/update", body),

  // ─── Store Setting ───────────────────────────────────────────────────────
  addStoreSetting: async (body) =>
    requests.post("/setting/store-setting/add", body),
  getStoreSetting: async () => requests.get("/setting/store-setting/all"),
  updateStoreSetting: async (body) =>
    requests.put("/setting/store-setting/update", body),

  // ─── Store Customization ─────────────────────────────────────────────────
  addStoreCustomizationSetting: async (body) =>
    requests.post("/setting/store/customization/add", body),
  getStoreCustomizationSetting: async () =>
    requests.get("/setting/store/customization/all"),
  updateStoreCustomizationSetting: async (body) =>
    requests.put("/setting/store/customization/update", body),

  // ─── Brand / Identity / SEO Setting ─────────────────────────────────────
  getBrandSetting: async () => requests.get("/setting/brand/all"),
  updateBrandSetting: async (body) =>
    requests.put("/setting/brand/update", body),

  // ─── Utility ─────────────────────────────────────────────────────────────
  purgeCache: async () =>
    axios.get(
      `${import.meta.env.VITE_APP_API_BASE_URL.replace("/admin", "")}/test/purge-cache`,
    ),
};

export default SettingServices;
