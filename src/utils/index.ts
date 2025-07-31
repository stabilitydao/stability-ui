/* FUNCTIONS */
import { getTokenData } from "./functions/getTokenData";
import { formatNumber } from "./functions/formatNumber";
import { formatFromBigInt } from "./functions/formatFromBigInt";
import { calculateAPY } from "./functions/calculateAPY";
import { getTimeDifference } from "./functions/getTimeDifference";
import { getStrategyInfo } from "./functions/getStrategyInfo";
import { addAssetsBalance } from "./functions/addAssetsBalance";
import { addVaultData } from "./functions/addVaultData";
import { get1InchRoutes } from "./functions/get1InchRoutes";
import { debounce } from "./functions/debounce";
import { decodeHex } from "./functions/decodeHex";
import { setLocalStoreHash } from "./functions/setLocalStoreHash";
import { getDate } from "./functions/getDate";
import { determineAPR } from "./functions/determineAPR";
import { addAssetToWallet } from "./functions/addAssetToWallet";
import { getLocalStorageData } from "./functions/getLocalStorageData";
import { dataSorter } from "./functions/dataSorter";
import { getShortAddress } from "./functions/getShortAddress";
import { sortTable } from "./functions/sortTable";
import { formatTimestampToDate } from "./functions/formatTimestampToDate";
import { getNFTSymbol } from "./functions/getNFTSymbol";
import { extractDomain } from "./functions/extractDomain";
import { setVisibleBalances } from "./functions/setVisibleBalances";
import { getContractDataWithPagination } from "./functions/getContractDataWithPagination";
import { extractPointsMultiplier } from "./functions/extractPointsMultiplier";
import { playAudio } from "./functions/playAudio";
import { cn } from "./functions/cn";
import { capitalize } from "./functions/capilatize";
import { getTransactionReceipt } from "./functions/getTransactionReceipt";
import { enrichAndResolveMetaVaults } from "./functions/enrichAndResolveMetaVaults";
import { copyAddress } from "./functions/copyAddress";
import { exactToFixed } from "./functions/exactToFixed";

/* HOOKS */
import { useClickOutside } from "./hooks/useClickOutside";
import { useModalClickOutside } from "./hooks/useModalClickOutside";
import { useUrlHistory } from "./hooks/useUrlHistory";

export {
  getTokenData,
  formatNumber,
  formatFromBigInt,
  calculateAPY,
  getTimeDifference,
  getStrategyInfo,
  get1InchRoutes,
  debounce,
  addAssetsBalance,
  addVaultData,
  decodeHex,
  setLocalStoreHash,
  getDate,
  determineAPR,
  addAssetToWallet,
  getLocalStorageData,
  dataSorter,
  getShortAddress,
  sortTable,
  formatTimestampToDate,
  getNFTSymbol,
  extractDomain,
  setVisibleBalances,
  getContractDataWithPagination,
  extractPointsMultiplier,
  playAudio,
  cn,
  capitalize,
  useClickOutside,
  useModalClickOutside,
  getTransactionReceipt,
  enrichAndResolveMetaVaults,
  copyAddress,
  exactToFixed,
  useUrlHistory,
};
