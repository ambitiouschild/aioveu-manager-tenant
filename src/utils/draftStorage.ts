// utils/draftStorage.js
export const DRAFT_KEY_PREFIX = "goods_stock_draft_";
export const MAX_DRAFT_AGE = 24 * 60 * 60 * 1000; // 24小时

// 获取草稿key
export const getDraftKey = (goodsId : any) => {
  return `${DRAFT_KEY_PREFIX}${goodsId || "new"}`;
};

// 保存草稿
export const saveDraft = (goodsId: any, data: any) => {
  if (!goodsId) return false;

  const draft = {
    goodsId,
    data,
    timestamp: Date.now(),
  };

  try {
    uni.setStorageSync(getDraftKey(goodsId), draft);
    console.log(`✅ 草稿保存成功: ${goodsId}`);
    return true;
  } catch (e) {
    console.error("草稿保存失败:", e);
    return false;
  }
};

// 加载草稿
export const loadDraft = (goodsId: any, autoRemove = true) => {
  if (!goodsId) return null;

  const key = getDraftKey(goodsId);
  const draft = uni.getStorageSync(key);

  if (!draft) return null;

  // 检查是否过期
  if (Date.now() - draft.timestamp > MAX_DRAFT_AGE) {
    uni.removeStorageSync(key);
    console.log(`🗑️ 草稿已过期: ${goodsId}`);
    return null;
  }

  // 检查商品ID是否匹配
  if (draft.goodsId !== goodsId) {
    console.warn(`商品ID不匹配: ${draft.goodsId} !== ${goodsId}`);
    return null;
  }

  if (autoRemove) {
    uni.removeStorageSync(key);
  }

  return draft.data;
};

// 清除草稿
export const clearDraft = (goodsId : any) => {
  if (!goodsId) return;
  uni.removeStorageSync(getDraftKey(goodsId));
  console.log(`🗑️ 草稿已清除: ${goodsId}`);
};
